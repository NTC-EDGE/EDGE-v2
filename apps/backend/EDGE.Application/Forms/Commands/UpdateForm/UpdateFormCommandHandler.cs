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

namespace EDGE.Application.Forms.Commands.UpdateForm;

public class UpdateFormCommandHandler : IRequestHandler<UpdateFormCommand, ApiResponse<FormDto>>
{
    private readonly IFormRepository _formRepository;
    private readonly ContractFormValidator _contractValidator;

    public UpdateFormCommandHandler(
        IFormRepository formRepository,
        ContractFormValidator? contractValidator = null)
    {
        _formRepository = formRepository;
        _contractValidator = contractValidator ?? new ContractFormValidator();
    }

    public async Task<ApiResponse<FormDto>> Handle(UpdateFormCommand request, CancellationToken cancellationToken)
    {
        if (!request.ServiceVariantId.HasValue)
        {
            var deletionError = await _formRepository.ValidateBaseFormDeletionsAsync(
                request.Id,
                request.ServiceId,
                request.Sections ?? new List<FormSectionDto>(),
                cancellationToken);

            if (!string.IsNullOrWhiteSpace(deletionError))
            {
                return ApiResponse<FormDto>.Fail(deletionError);
            }
        }

        var form = await _formRepository.SaveFormStructureAsync(
            request.Id,
            request.ServiceId,
            request.Version,
            request.CategorySelectionRequired,
            request.Sections ?? new List<FormSectionDto>(),
            request.Name,
            request.IsActive,
            request.Key,
            request.ServiceVariantId,
            request.BaseFormId,
            cancellationToken);

        if (!form.ServiceVariantId.HasValue && form.IsActive)
        {
            await _formRepository.SyncBaseFormToVariantFormsAsync(
                form,
                request.PropagateToCustomizedVariants,
                cancellationToken);
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

        var allVersions = form.ServiceId != Guid.Empty
            ? (await _formRepository.GetVersionsByServiceIdAsync(form.ServiceId, cancellationToken) ?? new List<Form>())
            : new List<Form>();
        var versionSummaries = allVersions
            .Where(v => v.ServiceVariantId == form.ServiceVariantId)
            .Select(v => new FormVersionSummaryDto
            {
                FormId = v.Id,
                Key = v.Key,
                ServiceVariantId = v.ServiceVariantId,
                Version = v.Version,
                Name = v.Name,
                IsActive = v.IsActive,
                CreatedAt = v.CreatedAt,
                UpdatedAt = v.LastModifiedAt,
                SectionsCount = v.Sections?.Count(s => !s.IsDeleted) ?? 0,
                FieldsCount = v.Sections?.Where(s => !s.IsDeleted).SelectMany(s => s.SectionFields ?? Enumerable.Empty<SectionField>()).Count() ?? 0
            }).ToList();

        var resultDto = new FormDto
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
                .Select(s => new FormSectionDto
                {
                    Key = s.Key,
                    Title = s.Title,
                    Required = requiredSectionKeys.Contains(s.Key),
                    OrderIndex = s.OrderIndex,
                    VisibilityCondition = FormSectionDto.ExtractSectionVisibilityCondition(s.SectionFields),
                    Fields = s.SectionFields
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

        return ApiResponse<FormDto>.Success(resultDto, "Form template updated successfully.");
    }
}
