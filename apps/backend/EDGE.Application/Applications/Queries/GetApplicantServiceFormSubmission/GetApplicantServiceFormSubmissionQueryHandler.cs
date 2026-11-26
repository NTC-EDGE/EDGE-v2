using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Constants;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Forms.Dtos;
using EDGE.Application.Forms.Services;

namespace EDGE.Application.Applications.Queries.GetApplicantServiceFormSubmission;

public class GetApplicantServiceFormSubmissionQueryHandler : IRequestHandler<GetApplicantServiceFormSubmissionQuery, ApiResponse<ApplicationFormSubmissionDto>>
{
    private static bool IsApplicantProfileField(string? label)
    {
        if (string.IsNullOrWhiteSpace(label)) return false;
        var lower = label.Trim().ToLowerInvariant();
        return lower.Contains("name") ||
               lower.Contains("birth") ||
               lower.Contains("dob") ||
               lower.Contains("address") ||
               lower.Contains("contact") ||
               lower.Contains("mobile") ||
               lower.Contains("phone") ||
               lower.Contains("email") ||
               lower.Contains("gender") ||
               lower.Contains("sex") ||
               lower.Contains("civil status") ||
               lower.Contains("civilstatus") ||
               lower.Contains("marital") ||
               lower.Contains("nationality") ||
               lower.Contains("citizenship") ||
               lower.Contains("signature") ||
               lower.Contains("declaration") ||
               lower.Contains("barangay") ||
               lower.Contains("province") ||
               lower.Contains("city") ||
               lower.Contains("municipality") ||
               lower.Contains("region") ||
               lower.Contains("zip") ||
               lower.Contains("postal");
    }

    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IFormRepository _formRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly ContractFormValidator _contractValidator;

    public GetApplicantServiceFormSubmissionQueryHandler(
        IApplicationFullRepository applicationRepository,
        IFormRepository formRepository,
        IServiceRepository serviceRepository,
        ContractFormValidator contractValidator)
    {
        _applicationRepository = applicationRepository;
        _formRepository = formRepository;
        _serviceRepository = serviceRepository;
        _contractValidator = contractValidator;
    }

    public async Task<ApiResponse<ApplicationFormSubmissionDto>> Handle(GetApplicantServiceFormSubmissionQuery request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<ApplicationFormSubmissionDto>.Fail($"Application with ID '{request.ApplicationId}' was not found.");
        }

        // 1. Locate specified Applicant
        var appApplicant = app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == request.ApplicantId);
        if (appApplicant == null && (request.ApplicantId == app.Id || app.ApplicationApplicants.Count == 1))
        {
            appApplicant = app.ApplicationApplicants.FirstOrDefault();
        }
        var applicant = appApplicant?.Applicant;

        if (applicant == null)
        {
            return ApiResponse<ApplicationFormSubmissionDto>.Fail($"Applicant '{request.ApplicantId}' was not found under Application '{request.ApplicationId}'.");
        }

        var serviceId = applicant.ServiceId ?? app.ApplicationApplicants.FirstOrDefault(aa => aa.Applicant?.ServiceId != null)?.Applicant?.ServiceId;
        if (!serviceId.HasValue || serviceId.Value == Guid.Empty)
        {
            return ApiResponse<ApplicationFormSubmissionDto>.Fail($"Service ID for Applicant '{request.ApplicantId}' was not found under Application '{request.ApplicationId}'.");
        }

        var service = await _serviceRepository.GetByIdAsync(serviceId.Value, cancellationToken);

        // 2. Locate exact FormSubmission for this Applicant
        var submission = applicant.FormSubmission
            ?? app.FormSubmissions.FirstOrDefault(fs => fs.ApplicantId == applicant.Id)
            ?? app.FormSubmissions.FirstOrDefault(fs => fs.ApplicantId == request.ApplicantId)
            ?? app.FormSubmissions.FirstOrDefault();

        // 3. Resolve Form layout schema (prefer variant-specific form when available)
        var effectiveVariantId = request.ServiceVariantId ?? applicant.ServiceVariantId;
        var targetVariant = applicant.ServiceVariant;
        if (targetVariant == null && effectiveVariantId.HasValue && effectiveVariantId.Value != Guid.Empty)
        {
            targetVariant = await _serviceRepository.GetVariantByIdAsync(effectiveVariantId.Value, cancellationToken);
        }

        Form? form = null;
        if (effectiveVariantId.HasValue && effectiveVariantId.Value != Guid.Empty)
        {
            form = await _formRepository.GetFormByServiceIdAsync(serviceId.Value, effectiveVariantId.Value, null, cancellationToken);
        }

        if (form == null && submission != null && submission.FormId != Guid.Empty)
        {
            form = await _formRepository.GetByIdAsync(submission.FormId, cancellationToken);
        }

        form ??= await _formRepository.GetFormByServiceIdAsync(serviceId.Value, cancellationToken);

        if (form == null)
        {
            return ApiResponse<ApplicationFormSubmissionDto>.Fail($"Form layout schema for Service ID '{serviceId.Value}' was not found.");
        }

        var valueMap = submission?.FieldValues != null
            ? submission.FieldValues
                .Where(fv => fv != null)
                .GroupBy(fv => fv.FieldId)
                .ToDictionary(g => g.Key, g => g.First().Value)
            : new Dictionary<Guid, string>();

        var requiredSectionKeys = service != null && !string.IsNullOrWhiteSpace(service.Contract)
            ? _contractValidator.GetRequiredSectionKeys(service.Contract)
            : new HashSet<string>();

        bool isCustomized = form.ServiceVariantId.HasValue && (!effectiveVariantId.HasValue || form.ServiceVariantId.Value == effectiveVariantId.Value);
        var projectedSections = new List<ApplicationFormSectionDto>();
        var seenFieldIdsAcrossForm = new HashSet<Guid>();

        foreach (var fs in form.Sections.Where(s => !s.IsDeleted).OrderBy(s => s.OrderIndex))
        {
            var secVis = FormSectionDto.ExtractSectionVisibilityCondition(fs.SectionFields);
            if (!isCustomized && targetVariant != null && !IsVariantConditionApplicable(secVis, targetVariant))
            {
                continue;
            }

            var rawSfs = (fs.SectionFields ?? Enumerable.Empty<SectionField>())
                .OrderBy(sf => sf.OrderIndex)
                .ToList();

            var filteredSfs = (!isCustomized && targetVariant != null)
                ? rawSfs.Where(sf => IsVariantConditionApplicable(ExtractEffectiveFieldCondition(sf), targetVariant)).ToList()
                : rawSfs;

            var uniqueSfs = new List<SectionField>();
            foreach (var sf in filteredSfs)
            {
                bool isDivider = string.Equals(sf.Field?.FieldType, "divider", StringComparison.OrdinalIgnoreCase);
                if (!isDivider && sf.FieldId != Guid.Empty && !seenFieldIdsAcrossForm.Add(sf.FieldId))
                {
                    continue;
                }
                uniqueSfs.Add(sf);
            }

            if (rawSfs.Count > 0 && uniqueSfs.Count == 0)
            {
                continue;
            }

            projectedSections.Add(new ApplicationFormSectionDto
            {
                Key = fs.Key,
                Title = FormSectionDto.ResolveTitle(fs, targetVariant),
                Required = requiredSectionKeys.Contains(fs.Key),
                OrderIndex = projectedSections.Count,
                VisibilityCondition = isCustomized ? secVis : null,
                Fields = uniqueSfs
                    .Select((sf, idx) =>
                    {
                        var projectedField = FormFieldDto.FromSectionField(sf, targetVariant, isCustomized ? form.Id : null);
                        return new ApplicationFormFieldValueDto
                        {
                            FieldId = projectedField.FieldId,
                            Label = projectedField.Label,
                            Type = projectedField.Type,
                            IsRequired = projectedField.IsRequired,
                            OrderIndex = idx,
                            ValidationRules = projectedField.ValidationRules,
                            VisibilityCondition = projectedField.VisibilityCondition,
                            Options = projectedField.Options,
                            Value = valueMap.TryGetValue(sf.FieldId, out var val) ? val : null
                        };
                    }).ToList()
            });
        }

        var dto = new ApplicationFormSubmissionDto
        {
            SubmissionId = submission?.Id,
            FormId = form.Id,
            ServiceId = form.ServiceId,
            ServiceCode = form.Service?.Code ?? service?.Code,
            ServiceVariantId = effectiveVariantId ?? form.ServiceVariantId,
            ServiceVariantName = targetVariant?.Description,
            ApplicationId = app.Id,
            ApplicantId = request.ApplicantId,
            Version = form.Version,
            Sections = projectedSections
        };

        return ApiResponse<ApplicationFormSubmissionDto>.Success(dto);
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
