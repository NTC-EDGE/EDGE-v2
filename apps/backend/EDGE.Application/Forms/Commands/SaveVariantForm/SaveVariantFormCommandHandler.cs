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

namespace EDGE.Application.Forms.Commands.SaveVariantForm;

public class SaveVariantFormCommandHandler : IRequestHandler<SaveVariantFormCommand, ApiResponse<FormDto>>
{
    private readonly IServiceVariantRepository _serviceVariantRepository;
    private readonly IFormRepository _formRepository;

    public SaveVariantFormCommandHandler(
        IServiceVariantRepository serviceVariantRepository,
        IFormRepository formRepository)
    {
        _serviceVariantRepository = serviceVariantRepository;
        _formRepository = formRepository;
    }

    public async Task<ApiResponse<FormDto>> Handle(SaveVariantFormCommand request, CancellationToken cancellationToken)
    {
        var variant = await _serviceVariantRepository.GetByIdAsync(request.VariantId, cancellationToken);
        if (variant == null)
        {
            return ApiResponse<FormDto>.Fail($"Service variant with ID {request.VariantId} was not found.");
        }

        // Find the Master Base Form for this service
        var baseForm = await _formRepository.GetFormByServiceIdAsync(variant.ServiceId, null, null, cancellationToken);

        var allServiceForms = (await _formRepository.GetVersionsByServiceIdAsync(variant.ServiceId, cancellationToken))
            ?? new List<Form>();
        var existingVariantVersions = allServiceForms
            .Where(v => v.ServiceVariantId == variant.Id)
            .OrderByDescending(v => v.IsActive)
            .ThenByDescending(v => v.CreatedAt)
            .ToList();

        var defaultFormName = $"{variant.Description ?? variant.Type.ToString()} Form";
        var formKey = existingVariantVersions.FirstOrDefault()?.Key ?? $"var_{variant.Id}";

        // If creating a brand-new Variant Draft version while the variant had 0 customized versions yet,
        // first materialize v1.0 (Active) from the inherited structure so live clients stay on v1.0 while v2.0 is Draft!
        if (request.CreateNewVersion && existingVariantVersions.Count == 0 && baseForm != null)
        {
            var initialV1Sections = baseForm.Sections
                .Where(s => !s.IsDeleted)
                .OrderBy(s => s.OrderIndex)
                .Select(s => new FormSectionDto
                {
                    Key = s.Key,
                    Title = FormSectionDto.ResolveTitle(s, variant),
                    Required = true,
                    OrderIndex = s.OrderIndex,
                    Fields = (s.SectionFields ?? Enumerable.Empty<SectionField>())
                        .OrderBy(sf => sf.OrderIndex)
                        .Select(sf => FormFieldDto.FromSectionField(sf, variant))
                        .ToList()
                })
                .ToList();

            await _formRepository.SaveFormStructureAsync(
                Guid.NewGuid(),
                variant.ServiceId,
                baseForm.Version ?? "1.0",
                false,
                initialV1Sections,
                defaultFormName,
                true,
                formKey,
                variant.Id,
                baseForm.Id,
                cancellationToken);
        }

        Guid targetFormId;
        string formVersion;
        bool shouldBeActive;

        if (request.CreateNewVersion)
        {
            targetFormId = Guid.NewGuid();
            formVersion = !string.IsNullOrWhiteSpace(request.Version) ? request.Version.Trim() : "2.0";
            shouldBeActive = false; // New versions always start as safe Inactive Drafts!
        }
        else
        {
            Form? matchedTarget = null;
            if (request.FormId.HasValue && request.FormId.Value != Guid.Empty)
            {
                matchedTarget = existingVariantVersions.FirstOrDefault(v => v.Id == request.FormId.Value);
            }
            matchedTarget ??= existingVariantVersions.FirstOrDefault(v => v.IsActive)
                              ?? existingVariantVersions.FirstOrDefault();

            targetFormId = matchedTarget?.Id ?? Guid.NewGuid();
            formVersion = !string.IsNullOrWhiteSpace(request.Version)
                ? request.Version.Trim()
                : matchedTarget?.Version ?? "1.0";
            shouldBeActive = request.IsActive ?? matchedTarget?.IsActive ?? true;
        }

        var formName = !string.IsNullOrWhiteSpace(request.Name)
            ? request.Name.Trim()
            : existingVariantVersions.FirstOrDefault()?.Name ?? defaultFormName;

        var savedForm = await _formRepository.SaveFormStructureAsync(
            targetFormId,
            variant.ServiceId,
            formVersion,
            false,
            request.Sections ?? new List<FormSectionDto>(),
            formName,
            shouldBeActive,
            formKey,
            variant.Id,
            baseForm?.Id,
            cancellationToken);

        // Only sync newly added fields/exclusions to Master Base Form ("All Sections & Fields") when this variant version is Active!
        if (savedForm.IsActive)
        {
            await _formRepository.SyncVariantFormToBaseFormAsync(savedForm, variant, cancellationToken);
        }

        var customizedVariantIds = await _formRepository.GetCustomizedVariantIdsForServiceGroupAsync(variant.ServiceId, cancellationToken)
            ?? new List<Guid>();
        var linkedVariantsCount = await _formRepository.GetLinkedVariantsCountForServiceGroupAsync(variant.ServiceId, cancellationToken);

        var refreshedVersions = (await _formRepository.GetVersionsByServiceIdAsync(savedForm.ServiceId, cancellationToken))
            ?? new List<Form>();

        bool seenActive = false;
        var versionSummaries = refreshedVersions
            .Where(v => v.ServiceVariantId == variant.Id)
            .OrderByDescending(v => v.IsActive)
            .ThenByDescending(v => v.CreatedAt)
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
                    FieldsCount = v.Sections?.Where(s => !s.IsDeleted)
                        .SelectMany(s => s.SectionFields ?? Enumerable.Empty<SectionField>())
                        .Count() ?? 0
                };
            }).ToList();

        var resultDto = new FormDto
        {
            FormId = savedForm.Id,
            Key = savedForm.Key,
            ServiceId = savedForm.ServiceId,
            ServiceName = savedForm.Service?.Name ?? variant.Service?.Name,
            ServiceCode = savedForm.Service?.Code ?? variant.Service?.Code,
            ServiceVariantId = savedForm.ServiceVariantId,
            ServiceVariantName = savedForm.ServiceVariant?.Description ?? variant.Description,
            BaseFormId = savedForm.BaseFormId,
            BaseFormKey = savedForm.BaseForm?.Key ?? baseForm?.Key,
            Name = savedForm.Name,
            Version = savedForm.Version,
            IsActive = savedForm.IsActive,
            CategorySelectionRequired = savedForm.CategorySelectionRequired,
            IsCustomized = true,
            LinkedVariantsCount = linkedVariantsCount,
            CustomizedVariantIds = customizedVariantIds,
            CreatedAt = savedForm.CreatedAt,
            UpdatedAt = savedForm.LastModifiedAt,
            AvailableVersions = versionSummaries,
            Sections = savedForm.Sections
                .Where(s => !s.IsDeleted)
                .OrderBy(s => s.OrderIndex)
                .Select(s => new FormSectionDto
                {
                    Key = s.Key,
                    Title = FormSectionDto.ResolveTitle(s, variant),
                    Required = true,
                    OrderIndex = s.OrderIndex,
                    VisibilityCondition = FormSectionDto.ExtractSectionVisibilityCondition(s.SectionFields),
                    Fields = s.SectionFields
                        .OrderBy(sf => sf.OrderIndex)
                        .Select(sf => FormFieldDto.FromSectionField(sf, variant, savedForm.Id)).ToList()
                }).ToList()
        };

        return ApiResponse<FormDto>.Success(
            resultDto,
            request.CreateNewVersion
                ? $"Created new draft version v{savedForm.Version} for this Service Variant."
                : "Variant form customized and saved successfully.");
    }
}
