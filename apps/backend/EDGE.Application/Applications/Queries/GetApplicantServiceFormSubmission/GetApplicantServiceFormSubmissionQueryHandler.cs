using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Forms.Services;

namespace EDGE.Application.Applications.Queries.GetApplicantServiceFormSubmission;

public class GetApplicantServiceFormSubmissionQueryHandler : IRequestHandler<GetApplicantServiceFormSubmissionQuery, ApiResponse<ApplicationFormSubmissionDto>>
{
    private static readonly HashSet<Guid> ApplicantProfileFieldGuids = new()
    {
        Guid.Parse("fd000000-0000-0000-0000-000000000001"), // Full Name
        Guid.Parse("fd000000-0000-0000-0000-000000000002"), // Date of Birth
        Guid.Parse("fd000000-0000-0000-0000-000000000003"), // Complete Address
        Guid.Parse("fd000000-0000-0000-0000-000000000004"), // Contact / Mobile Number
        Guid.Parse("fd000000-0000-0000-0000-000000000005"), // Email Address
        Guid.Parse("fd000000-0000-0000-0000-000000000012"), // Applicant Signature
        Guid.Parse("fd000000-0000-0000-0000-000000000013"), // Declaration
        Guid.Parse("fd000000-0000-0000-0000-000000000041"), // Sex / Gender
        Guid.Parse("fd000000-0000-0000-0000-000000000042"), // Civil Status
        Guid.Parse("fd000000-0000-0000-0000-000000000043"), // Nationality
        Guid.Parse("fd000000-0000-0000-0000-000000000051"), // Region
        Guid.Parse("fd000000-0000-0000-0000-000000000052"), // Province
        Guid.Parse("fd000000-0000-0000-0000-000000000053"), // City
        Guid.Parse("fd000000-0000-0000-0000-000000000054"), // Barangay
        Guid.Parse("fd000000-0000-0000-0000-000000000055"), // Street
        Guid.Parse("fd000000-0000-0000-0000-000000000056"), // Zip Code
        Guid.Parse("fd000000-0000-0000-0000-000000000081"), // Company Name
        Guid.Parse("fd000000-0000-0000-0000-000000000082"), // Representative Name
        Guid.Parse("fd000000-0000-0000-0000-000000000083"), // Position
        Guid.Parse("fd000000-0000-0000-0000-000000000086"), // SEC / DTI Registration
    };

    private static bool IsApplicantProfileField(Guid fieldId, string? label)
    {
        if (ApplicantProfileFieldGuids.Contains(fieldId)) return true;
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

        // 3. Resolve Form layout schema
        Form? form = null;
        if (submission != null && submission.FormId != Guid.Empty)
        {
            form = await _formRepository.GetByIdAsync(submission.FormId, cancellationToken);
        }

        form ??= await _formRepository.GetFormByServiceIdAsync(serviceId.Value, cancellationToken);

        if (form == null)
        {
            return ApiResponse<ApplicationFormSubmissionDto>.Fail($"Form layout schema for Service ID '{serviceId.Value}' was not found.");
        }

        var valueMap = submission?.FieldValues
            .GroupBy(fv => fv.FieldId)
            .ToDictionary(g => g.Key, g => g.First().Value)
            ?? new Dictionary<Guid, string>();

        var requiredSectionKeys = service != null && !string.IsNullOrWhiteSpace(service.Contract)
            ? _contractValidator.GetRequiredSectionKeys(service.Contract)
            : new HashSet<string>();

        var dto = new ApplicationFormSubmissionDto
        {
            SubmissionId = submission?.Id,
            FormId = form.Id,
            ServiceId = form.ServiceId,
            ApplicationId = app.Id,
            ApplicantId = request.ApplicantId,
            Version = form.Version,
            Sections = form.Sections
                .OrderBy(s => s.OrderIndex)
                .Select(fs => new ApplicationFormSectionDto
                {
                    Key = fs.Key,
                    Title = fs.Title,
                    Required = requiredSectionKeys.Contains(fs.Key),
                    OrderIndex = fs.OrderIndex,
                    Fields = fs.SectionFields
                        .OrderBy(sf => sf.OrderIndex)
                        .Select(sf => new ApplicationFormFieldValueDto
                        {
                            FieldId = sf.FieldId,
                            Label = sf.Field?.Label ?? string.Empty,
                            Type = sf.Field?.FieldType ?? string.Empty,
                            IsRequired = sf.IsRequired,
                            OrderIndex = sf.OrderIndex,
                            ValidationRules = sf.Field?.ValidationRules,
                            VisibilityCondition = sf.VisibilityCondition,
                            Value = valueMap.TryGetValue(sf.FieldId, out var val) ? val : null
                        }).ToList()
                }).ToList()
        };

        // 4. Preserve any submitted fields that are not part of the form's defined sections,
        // excluding personal applicant profile fields that are already displayed in Applicant Details.
        var sectionFieldIds = form.Sections
            .SelectMany(s => s.SectionFields)
            .Select(sf => sf.FieldId)
            .ToHashSet();

        var extraFields = (submission?.FieldValues ?? Enumerable.Empty<FormFieldValue>())
            .Where(fv => !sectionFieldIds.Contains(fv.FieldId)
                         && !IsApplicantProfileField(fv.FieldId, fv.Field?.Label ?? fv.CustomLabel)
                         && !string.IsNullOrWhiteSpace(fv.Value))
            .GroupBy(fv => fv.FieldId)
            .Select(g => g.First())
            .Select((fv, idx) => new ApplicationFormFieldValueDto
            {
                FieldId = fv.FieldId,
                Label = fv.Field?.Label ?? (!string.IsNullOrWhiteSpace(fv.CustomLabel) ? fv.CustomLabel : "Field"),
                Type = fv.Field?.FieldType ?? "text",
                IsRequired = false,
                OrderIndex = 1000 + idx,
                ValidationRules = fv.Field?.ValidationRules,
                Value = fv.Value
            })
            .ToList();

        if (extraFields.Count > 0)
        {
            dto.Sections.Add(new ApplicationFormSectionDto
            {
                Key = "additionalSpecifications",
                Title = "Additional Technical Specifications",
                Required = false,
                OrderIndex = form.Sections.Count + 1,
                Fields = extraFields
            });
        }

        return ApiResponse<ApplicationFormSubmissionDto>.Success(dto);
    }
}
