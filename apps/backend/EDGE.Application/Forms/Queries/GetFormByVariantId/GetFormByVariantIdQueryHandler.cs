using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;
using EDGE.Application.Forms.Services;

namespace EDGE.Application.Forms.Queries.GetFormByVariantId;

public class GetFormByVariantIdQueryHandler : IRequestHandler<GetFormByVariantIdQuery, ApiResponse<FormDto>>
{
    private readonly IServiceVariantRepository _serviceVariantRepository;
    private readonly IFormRepository _formRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly ContractFormValidator _contractValidator;
    private readonly ILogger<GetFormByVariantIdQueryHandler>? _logger;

    public GetFormByVariantIdQueryHandler(
        IServiceVariantRepository serviceVariantRepository,
        IFormRepository formRepository,
        IServiceRepository serviceRepository,
        ContractFormValidator contractValidator,
        ILogger<GetFormByVariantIdQueryHandler>? logger = null)
    {
        _serviceVariantRepository = serviceVariantRepository;
        _formRepository = formRepository;
        _serviceRepository = serviceRepository;
        _contractValidator = contractValidator;
        _logger = logger;
    }

    public async Task<ApiResponse<FormDto>> Handle(GetFormByVariantIdQuery request, CancellationToken cancellationToken)
    {
        var variant = await _serviceVariantRepository.GetByIdAsync(request.VariantId, cancellationToken);
        if (variant == null)
        {
            return ApiResponse<FormDto>.Fail($"Service variant with ID {request.VariantId} was not found.");
        }

        var service = await _serviceRepository.GetByIdAsync(variant.ServiceId, cancellationToken);
        if (service == null)
        {
            return ApiResponse<FormDto>.Fail($"Service with ID {variant.ServiceId} was not found.");
        }

        var allVersions = (await _formRepository.GetVersionsByServiceIdAsync(variant.ServiceId, cancellationToken))
            ?? new List<Form>();
        var variantVersions = allVersions
            .Where(v => v.ServiceVariantId == variant.Id)
            .OrderByDescending(v => v.IsActive)
            .ThenByDescending(v => v.CreatedAt)
            .ToList();

        Form? form = null;
        bool isCustomized = false;

        if (request.FormId.HasValue && request.FormId.Value != Guid.Empty)
        {
            var requestedVersion = await _formRepository.GetByIdAsync(request.FormId.Value, cancellationToken);
            if (requestedVersion != null && requestedVersion.ServiceVariantId == variant.Id)
            {
                form = requestedVersion;
                isCustomized = true;
            }
        }

        if (form == null && variantVersions.Count > 0)
        {
            form = await _formRepository.GetActiveVariantFormAsync(variant.Id, cancellationToken);
            if (form != null)
            {
                isCustomized = true;
            }
        }

        if (form == null)
        {
            form = await _formRepository.GetFormByServiceIdAsync(
                variant.ServiceId,
                variant.Id,
                null,
                cancellationToken);
            isCustomized = form != null && form.ServiceVariantId.HasValue && form.ServiceVariantId.Value == variant.Id;
        }

        if (form == null)
        {
            return ApiResponse<FormDto>.Fail($"Form template for service variant {request.VariantId} was not found.");
        }

        var requiredSectionKeys = !string.IsNullOrWhiteSpace(service.Contract)
            ? _contractValidator.GetRequiredSectionKeys(service.Contract)
            : new HashSet<string>();

        var customizedVariantIds = await _formRepository.GetCustomizedVariantIdsForServiceGroupAsync(form.ServiceId, cancellationToken)
            ?? new List<Guid>();
        var linkedVariantsCount = await _formRepository.GetLinkedVariantsCountForServiceGroupAsync(form.ServiceId, cancellationToken);

        bool seenActive = false;
        var versionSummaries = isCustomized
            ? variantVersions.Select(v =>
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
            }).ToList()
            : new List<FormVersionSummaryDto>();

        // Filter sections & fields server-side when inheriting from Base Form so ONLY this variant's needed sections/fields are returned!
        var projectedSections = new List<FormSectionDto>();
        foreach (var fs in form.Sections.Where(s => !s.IsDeleted).OrderBy(s => s.OrderIndex))
        {
            var secVis = FormSectionDto.ExtractSectionVisibilityCondition(fs.SectionFields);
            if (!isCustomized && !IsVariantConditionApplicable(secVis, variant))
            {
                continue;
            }

            var rawSfs = (fs.SectionFields ?? Enumerable.Empty<SectionField>())
                .OrderBy(sf => sf.OrderIndex)
                .ToList();

            var filteredSfs = isCustomized
                ? rawSfs
                : rawSfs.Where(sf => IsVariantConditionApplicable(ExtractEffectiveFieldCondition(sf), variant)).ToList();

            if (!isCustomized && rawSfs.Count > 0 && filteredSfs.Count == 0)
            {
                // All fields in this Base Form section are excluded/inapplicable for this Service Variant -> omit section!
                continue;
            }

            projectedSections.Add(new FormSectionDto
            {
                Key = fs.Key,
                Title = FormSectionDto.ResolveTitle(fs, variant),
                Required = requiredSectionKeys.Contains(fs.Key),
                OrderIndex = projectedSections.Count,
                VisibilityCondition = isCustomized ? secVis : null,
                Fields = filteredSfs
                    .Select((sf, idx) =>
                    {
                        var dtoField = FormFieldDto.FromSectionField(sf, variant, isCustomized ? form.Id : null);
                        dtoField.OrderIndex = idx;
                        return dtoField;
                    })
                    .ToList()
            });
        }

        var dto = new FormDto
        {
            FormId = form.Id,
            Key = form.Key,
            ServiceId = form.ServiceId,
            ServiceName = form.Service?.Name ?? service.Name,
            ServiceCode = form.Service?.Code ?? service.Code,
            ServiceVariantId = variant.Id,
            ServiceVariantName = variant.Description,
            BaseFormId = isCustomized ? form.BaseFormId : form.Id,
            BaseFormKey = isCustomized ? form.BaseForm?.Key : form.Key,
            Name = form.Name,
            Version = form.Version,
            IsActive = form.IsActive,
            CategorySelectionRequired = form.CategorySelectionRequired,
            IsCustomized = isCustomized,
            LinkedVariantsCount = linkedVariantsCount,
            CustomizedVariantIds = customizedVariantIds,
            CreatedAt = form.CreatedAt,
            UpdatedAt = form.LastModifiedAt,
            AvailableVersions = versionSummaries,
            Sections = projectedSections
        };

        return ApiResponse<FormDto>.Success(dto);
    }

    private static string? ExtractEffectiveFieldCondition(SectionField sf)
    {
        if (!string.IsNullOrWhiteSpace(sf.VisibilityCondition))
        {
            return sf.VisibilityCondition;
        }

        var rules = sf.Field?.ValidationRules;
        if (!string.IsNullOrWhiteSpace(rules) && rules.Trim().StartsWith("{", StringComparison.Ordinal))
        {
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(rules.Trim());
                if (doc.RootElement.ValueKind == System.Text.Json.JsonValueKind.Object &&
                    doc.RootElement.TryGetProperty("condition", out var condEl))
                {
                    if (condEl.ValueKind == System.Text.Json.JsonValueKind.Object)
                    {
                        return condEl.GetRawText();
                    }
                    if (condEl.ValueKind == System.Text.Json.JsonValueKind.String)
                    {
                        return condEl.GetString();
                    }
                }
            }
            catch
            {
                // ignore malformed JSON
            }
        }

        return null;
    }

    private static bool IsVariantConditionApplicable(string? visibilityCondition, ServiceVariant variant)
    {
        if (string.IsNullOrWhiteSpace(visibilityCondition)) return true;
        var trimmed = visibilityCondition.Trim();
        if (!trimmed.StartsWith("{", StringComparison.Ordinal)) return true;

        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(trimmed);
            var root = doc.RootElement;
            if (root.ValueKind != System.Text.Json.JsonValueKind.Object) return true;

            var excluded = ReadStringArray(root, "excludedVariants");
            if (excluded.Any(tok => string.Equals(tok, "ALL", StringComparison.OrdinalIgnoreCase) || FormFieldDto.MatchesServiceVariant(tok, variant)))
            {
                return false;
            }

            var variants = ReadStringArray(root, "variants");
            variants.AddRange(ReadStringArray(root, "variantType"));
            var appTypes = ReadStringArray(root, "applicationTypes");
            appTypes.AddRange(ReadStringArray(root, "variantDescription"));

            if (variants.Count == 0 && appTypes.Count == 0) return true;
            if (variants.Count > 0 && variants.All(v => string.Equals(v, "__NONE__", StringComparison.OrdinalIgnoreCase)))
            {
                return false;
            }

            bool matchesVar = variants.Count == 0 || variants.Any(tok => FormFieldDto.MatchesServiceVariant(tok, variant));
            bool matchesApp = appTypes.Count == 0 || appTypes.Any(tok => FormFieldDto.MatchesServiceVariant(tok, variant));

            return variants.Count > 0 && appTypes.Count > 0
                ? (matchesVar || matchesApp)
                : (variants.Count > 0 ? matchesVar : matchesApp);
        }
        catch
        {
            return true;
        }
    }

    private static List<string> ReadStringArray(System.Text.Json.JsonElement obj, string propName)
    {
        var list = new List<string>();
        if (!obj.TryGetProperty(propName, out var el)) return list;
        if (el.ValueKind == System.Text.Json.JsonValueKind.String)
        {
            var s = el.GetString()?.Trim();
            if (!string.IsNullOrEmpty(s)) list.Add(s);
        }
        else if (el.ValueKind == System.Text.Json.JsonValueKind.Array)
        {
            foreach (var item in el.EnumerateArray())
            {
                if (item.ValueKind == System.Text.Json.JsonValueKind.String)
                {
                    var s = item.GetString()?.Trim();
                    if (!string.IsNullOrEmpty(s)) list.Add(s);
                }
            }
        }
        return list;
    }
}
