using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;
using EDGE.Application.Forms.Services;

namespace EDGE.Application.Forms.Queries.GetFormById;

public class GetFormByIdQueryHandler : IRequestHandler<GetFormByIdQuery, ApiResponse<FormDto>>
{
    private readonly IFormRepository _formRepository;
    private readonly ContractFormValidator _contractValidator;

    public GetFormByIdQueryHandler(
        IFormRepository formRepository,
        ContractFormValidator? contractValidator = null)
    {
        _formRepository = formRepository;
        _contractValidator = contractValidator ?? new ContractFormValidator();
    }

    public async Task<ApiResponse<FormDto>> Handle(GetFormByIdQuery request, CancellationToken cancellationToken)
    {
        var form = await _formRepository.GetByIdAsync(request.Id, cancellationToken);
        if (form == null)
        {
            return ApiResponse<FormDto>.Fail($"Form template with ID '{request.Id}' was not found.", ApiErrorCode.NotFound);
        }

        var requiredSectionKeys = !string.IsNullOrWhiteSpace(form.Service?.Contract)
            ? _contractValidator.GetRequiredSectionKeys(form.Service!.Contract)
            : new HashSet<string>();

        var customizedVariantIds = form.ServiceId != Guid.Empty
            ? (await _formRepository.GetCustomizedVariantIdsForServiceGroupAsync(form.ServiceId, cancellationToken) ?? new List<Guid>())
            : new List<Guid>();
        var linkedVariantsCount = form.ServiceId != Guid.Empty
            ? await _formRepository.GetLinkedVariantsCountForServiceGroupAsync(form.ServiceId, cancellationToken)
            : 0;

        var versionSummaries = new List<FormVersionSummaryDto>();
        if (form.ServiceId != Guid.Empty)
        {
            var allVersions = (await _formRepository.GetVersionsByServiceIdAsync(form.ServiceId, cancellationToken)) ?? new List<Form>();
            bool seenActive = false;
            versionSummaries = allVersions
                .Where(v => v.ServiceVariantId == form.ServiceVariantId)
                .Select(v =>
                {
                    bool effectiveActive = v.IsActive && !seenActive;
                    if (effectiveActive) seenActive = true;
                    return new FormVersionSummaryDto
                    {
                        FormId = v.Id,
                        Key = v.Key,
                        ServiceVariantId = v.ServiceVariantId,
                        Version = v.Version,
                        Name = v.Name,
                        IsActive = effectiveActive,
                        CreatedAt = v.CreatedAt,
                        UpdatedAt = v.LastModifiedAt,
                        SectionsCount = v.Sections?.Count(s => !s.IsDeleted) ?? 0,
                        FieldsCount = v.Sections?.Where(s => !s.IsDeleted).SelectMany(s => s.SectionFields ?? Enumerable.Empty<SectionField>()).Count() ?? 0
                    };
                }).ToList();
        }

        var dto = new FormDto
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
            LinkedVariantsCount = linkedVariantsCount,
            CustomizedVariantIds = customizedVariantIds,
            CreatedAt = form.CreatedAt,
            UpdatedAt = form.LastModifiedAt,
            AvailableVersions = versionSummaries,
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

        return ApiResponse<FormDto>.Success(dto);
    }
}
