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

namespace EDGE.Application.Forms.Commands.ActivateForm;

public class ActivateFormCommandHandler : IRequestHandler<ActivateFormCommand, ApiResponse<FormDto>>
{
    private readonly IFormRepository _formRepository;
    private readonly ContractFormValidator _contractValidator;

    public ActivateFormCommandHandler(
        IFormRepository formRepository,
        ContractFormValidator? contractValidator = null)
    {
        _formRepository = formRepository;
        _contractValidator = contractValidator ?? new ContractFormValidator();
    }

    public async Task<ApiResponse<FormDto>> Handle(ActivateFormCommand request, CancellationToken cancellationToken)
    {
        var form = await _formRepository.SetFormActiveAsync(request.Id, cancellationToken);
        if (form == null)
        {
            return ApiResponse<FormDto>.Fail($"Form template with ID '{request.Id}' was not found.", ApiErrorCode.NotFound);
        }

        if (!form.ServiceVariantId.HasValue)
        {
            await _formRepository.SyncBaseFormToVariantFormsAsync(form, overwriteCustomizedOverrides: false, cancellationToken);
        }
        else if (form.ServiceVariant != null)
        {
            await _formRepository.PromoteVariantDraftOverridesAsync(form, form.ServiceVariant, cancellationToken);
            await _formRepository.SyncVariantFormToBaseFormAsync(form, form.ServiceVariant, cancellationToken);
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
            var allVersions = (await _formRepository.GetVersionsByServiceIdAsync(form.ServiceId, cancellationToken)) ?? new List<EDGE.Domain.Entities.Form>();
            versionSummaries = allVersions
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
                    FieldsCount = v.Sections?.Where(s => !s.IsDeleted).SelectMany(s => s.SectionFields ?? Enumerable.Empty<EDGE.Domain.Entities.SectionField>()).Count() ?? 0
                }).ToList();
        }

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
                    Title = FormSectionDto.ResolveTitle(s, form.ServiceVariant),
                    Required = requiredSectionKeys.Contains(s.Key),
                    OrderIndex = s.OrderIndex,
                    VisibilityCondition = FormSectionDto.ExtractSectionVisibilityCondition(s.SectionFields),
                    Fields = s.SectionFields
                        .OrderBy(sf => sf.OrderIndex)
                        .Select(sf => FormFieldDto.FromSectionField(sf, form.ServiceVariant, form.Id)).ToList()
                }).ToList()
        };

        return ApiResponse<FormDto>.Success(resultDto, $"Form template '{form.Name ?? form.Version}' is now the active form for this service.");
    }
}
