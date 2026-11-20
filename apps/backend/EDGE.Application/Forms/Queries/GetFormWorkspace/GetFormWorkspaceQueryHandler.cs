using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;
using EDGE.Application.Forms.Services;

namespace EDGE.Application.Forms.Queries.GetFormWorkspace;

public class GetFormWorkspaceQueryHandler : IRequestHandler<GetFormWorkspaceQuery, ApiResponse<FormWorkspaceDto>>
{
    private readonly IFormRepository _formRepository;
    private readonly ContractFormValidator _contractValidator;

    public GetFormWorkspaceQueryHandler(
        IFormRepository formRepository,
        ContractFormValidator? contractValidator = null)
    {
        _formRepository = formRepository;
        _contractValidator = contractValidator ?? new ContractFormValidator();
    }

    public async Task<ApiResponse<FormWorkspaceDto>> Handle(GetFormWorkspaceQuery request, CancellationToken cancellationToken)
    {
        var (form, versions, customizedVariantIds, linkedServices, serviceVariants) =
            await _formRepository.GetFormWorkspaceDataAsync(request.Id, cancellationToken);

        if (form == null)
        {
            return ApiResponse<FormWorkspaceDto>.Fail(
                $"Form template with ID '{request.Id}' was not found.",
                ApiErrorCode.NotFound);
        }

        var requiredSectionKeys = !string.IsNullOrWhiteSpace(form.Service?.Contract)
            ? _contractValidator.GetRequiredSectionKeys(form.Service!.Contract)
            : new HashSet<string>();

        var formDto = new FormDto
        {
            FormId = form.Id,
            Key = form.Key,
            ServiceId = form.ServiceId,
            ServiceName = form.Service?.Name,
            ServiceCode = form.Service?.Code,
            ServiceVariantId = form.ServiceVariantId,
            ServiceVariantName = form.ServiceVariant?.Description,
            BaseFormId = form.BaseFormId,
            BaseFormKey = form.BaseForm?.Key,
            Name = form.Name,
            Version = form.Version,
            IsActive = form.IsActive,
            CategorySelectionRequired = form.CategorySelectionRequired,
            IsCustomized = form.ServiceVariantId.HasValue,
            LinkedVariantsCount = serviceVariants.Count,
            CustomizedVariantIds = customizedVariantIds,
            CreatedAt = form.CreatedAt,
            UpdatedAt = form.LastModifiedAt,
            AvailableVersions = versions,
            Sections = form.Sections
                .Where(s => !s.IsDeleted)
                .OrderBy(s => s.OrderIndex)
                .Select(fs => new FormSectionDto
                {
                    Key = fs.Key,
                    Title = fs.Title,
                    Required = requiredSectionKeys.Contains(fs.Key),
                    OrderIndex = fs.OrderIndex,
                    VisibilityCondition = FormSectionDto.ExtractSectionVisibilityCondition(fs.SectionFields),
                    Fields = fs.SectionFields
                        .OrderBy(sf => sf.OrderIndex)
                        .Select(sf => new FormFieldDto
                        {
                            FieldId = sf.FieldId,
                            Label = sf.Field?.Label ?? string.Empty,
                            Type = sf.Field?.FieldType ?? string.Empty,
                            IsRequired = sf.IsRequired,
                            OrderIndex = sf.OrderIndex,
                            ValidationRules = sf.Field?.ValidationRules,
                            VisibilityCondition = sf.VisibilityCondition,
                            Options = FormFieldDto.ExtractOptions(sf.Field?.ValidationRules)
                        }).ToList()
                }).ToList()
        };

        var workspace = new FormWorkspaceDto
        {
            Form = formDto,
            LinkedServices = linkedServices,
            ServiceVariants = serviceVariants
        };

        return ApiResponse<FormWorkspaceDto>.Success(workspace, "Form workspace loaded successfully.");
    }
}
