using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.SubmitApplication;

public class SubmitApplicationCommandHandler : IRequestHandler<SubmitApplicationCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IApplicantRepository _applicantRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IFormRepository _formRepository;
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    private static readonly Dictionary<string, string> LabelToKeyMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["First Name"] = "firstName",
        ["Last Name"] = "lastName",
        ["Email Address"] = "email",
        ["Contact Number"] = "contactNumber",
        ["Operator Class"] = "operatorClass",
        ["License Number"] = "licenseNumber",
        ["Expiry Date"] = "expiryDate",
        ["Company Name"] = "companyName",
        ["SEC/DTI Registration Number"] = "registrationNumber",
        ["TIN"] = "tin",
        ["Station Type"] = "stationType",
        ["Assigned Frequency (MHz)"] = "frequency",
        ["Transmitter Power Output (W)"] = "powerOutput",
        ["Station Location"] = "location",
        ["Signature"] = "signatureField",
        ["I declare the info is true"] = "declarationCheckbox"
    };

    public SubmitApplicationCommandHandler(
        IApplicationFullRepository applicationRepository,
        IApplicantRepository applicantRepository,
        IServiceRepository serviceRepository,
        IFormRepository formRepository,
        IScheduleRepository scheduleRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        _applicationRepository = applicationRepository;
        _applicantRepository = applicantRepository;
        _serviceRepository = serviceRepository;
        _formRepository = formRepository;
        _scheduleRepository = scheduleRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<Guid>> Handle(SubmitApplicationCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate Single/Bulk submission constraints
        bool isBulkMode = request.SubmissionMode.Equals("Bulk", StringComparison.OrdinalIgnoreCase);
        if (isBulkMode)
        {
            return ApiResponse<Guid>.Fail("Validation Error: Bulk submission mode is not supported in this version.");
        }

        var currentUserIdStr = _currentUserService.UserId;
        bool isGuest = string.IsNullOrEmpty(currentUserIdStr);
        Guid? submitterUserId = null;

        if (!isGuest)
        {
            if (Guid.TryParse(currentUserIdStr, out var parsedGuid))
            {
                submitterUserId = parsedGuid;
            }
            else
            {
                submitterUserId = CreateGuidFromString(currentUserIdStr!);
            }
        }

        if (request.ApplicantIds.Count != 1)
        {
            return ApiResponse<Guid>.Fail("Validation Error: Single submission mode must have exactly one applicant.");
        }

        // 2. Fetch Service Catalog and Validate Category conformance
        var service = await _serviceRepository.GetByIdAsync(request.ServiceId ?? Guid.Empty, cancellationToken);
        if (service == null)
        {
            return ApiResponse<Guid>.Fail($"Validation Error: Service with ID '{request.ServiceId}' does not exist.");
        }
    
        // 3. Guard against missing Schedule for Exam category services
        if (service.ServiceCategory?.Type == ServiceCategoryType.Exam)
        {
            if (!request.ScheduleId.HasValue || request.ScheduleId == Guid.Empty)
            {
                return ApiResponse<Guid>.Fail("Validation Error: ScheduleId is mandatory for exam services.");
            }

            var schedule = await _scheduleRepository.GetByIdAsync(request.ScheduleId.Value, cancellationToken);
            if (schedule == null)
            {
                return ApiResponse<Guid>.Fail($"Validation Error: The selected examination schedule '{request.ScheduleId}' does not exist.");
            }
        }

        // 4. Validate that applicant exists, belongs to tenant, and is Complete
        // Using the lean overload — we only need TenantId and Status; the full
        // applicant details were already persisted in the prior POST+PATCH steps.
        var applicantId = request.ApplicantIds[0];
        var applicant = await _applicantRepository.GetApplicantByIdAsync(applicantId, cancellationToken);
        if (applicant == null)
        {
            return ApiResponse<Guid>.Fail($"Validation Error: Applicant '{applicantId}' does not exist.");
        }

        if (applicant.TenantId != request.TenantId)
        {
            return ApiResponse<Guid>.Fail($"Validation Error: Applicant '{applicantId}' does not belong to the requested tenant.");
        }

        if (applicant.Status != ApplicantStatus.Complete)
        {
            return ApiResponse<Guid>.Fail($"Validation Error: The applicant details must be fully filled out and complete before submission.");
        }

        // 5. Validate dynamic contract and unknown fields mapping
        if (string.IsNullOrWhiteSpace(service.Contract))
        {
            return ApiResponse<Guid>.Fail("Validation Error: Service contract is missing or malformed.");
        }

        HashSet<string> requiredSectionKeys = new();
        try
        {
            using var contractDoc = JsonDocument.Parse(service.Contract);
            if (contractDoc.RootElement.TryGetProperty("requiredSections", out var sectionsElem))
            {
                foreach (var sec in sectionsElem.EnumerateArray())
                {
                    if (sec.TryGetProperty("key", out var keyElem))
                    {
                        requiredSectionKeys.Add(keyElem.GetString() ?? "");
                    }
                }
            }
        }
        catch (Exception)
        {
            return ApiResponse<Guid>.Fail("Validation Error: Failed to parse service contract schema.");
        }

        var form = await _formRepository.GetFormByServiceIdAsync(service.Id, cancellationToken);
        var fieldValuesToInsert = new List<FormFieldValue>();

        if (requiredSectionKeys.Count > 0)
        {
            if (string.IsNullOrWhiteSpace(request.DynamicDataJson))
            {
                return ApiResponse<Guid>.Fail("Validation Error: Dynamic data JSON is required for this service.");
            }

            try
            {
                using var dataDoc = JsonDocument.Parse(request.DynamicDataJson);
                var root = dataDoc.RootElement;

                // Ensure all contract-required sections are present
                foreach (var reqKey in requiredSectionKeys)
                {
                    if (!root.TryGetProperty(reqKey, out _))
                    {
                        return ApiResponse<Guid>.Fail($"Validation Error: Missing required section '{reqKey}' in submitted form data.");
                    }
                }

                if (form != null)
                {
                    // Map key to Section and its fields
                    var sectionMap = form.Sections.ToDictionary(s => s.Key, s => s, StringComparer.OrdinalIgnoreCase);

                    foreach (var sectionProp in root.EnumerateObject())
                    {
                        var sectionKey = sectionProp.Name;
                        if (!sectionMap.TryGetValue(sectionKey, out var formSection))
                        {
                            return ApiResponse<Guid>.Fail($"Validation Error: Unknown section '{sectionKey}' is not defined in the service form layout.");
                        }

                        // Map field key (normalized label or LabelToKeyMap) to Field ID
                        var fieldKeyMap = formSection.SectionFields
                            .Where(sf => sf.Field != null)
                            .ToDictionary(
                                sf => LabelToKeyMap.TryGetValue(sf.Field!.Label, out var keyVal) ? keyVal : NormalizeLabel(sf.Field.Label),
                                sf => sf.Field!.Id,
                                StringComparer.OrdinalIgnoreCase
                            );

                        if (sectionProp.Value.ValueKind == JsonValueKind.Object)
                        {
                            foreach (var fieldProp in sectionProp.Value.EnumerateObject())
                            {
                                if (!fieldKeyMap.TryGetValue(fieldProp.Name, out var fieldId))
                                {
                                    return ApiResponse<Guid>.Fail($"Validation Error: Unknown field '{fieldProp.Name}' under section '{sectionKey}' is not defined in the service form layout.");
                                }

                                string strValue = fieldProp.Value.ValueKind == JsonValueKind.String
                                    ? fieldProp.Value.GetString() ?? ""
                                    : fieldProp.Value.GetRawText();

                                fieldValuesToInsert.Add(new FormFieldValue
                                {
                                    Id = Guid.NewGuid(),
                                    FieldId = fieldId,
                                    Value = strValue
                                });
                            }
                        }
                    }
                }
            }
            catch (JsonException)
            {
                return ApiResponse<Guid>.Fail("Validation Error: Dynamic data is not a valid JSON string.");
            }
        }

        // 6. Begin Database Transaction
        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            var submissionMode = SubmissionMode.Single;
            var dataEntryMethod = string.Equals(request.DataEntryMethod, "CSV", StringComparison.OrdinalIgnoreCase)
                ? DataEntryMethod.CSV
                : DataEntryMethod.Manual;
            var status = string.Equals(request.Status, "Submitted", StringComparison.OrdinalIgnoreCase)
                ? ApplicationStatus.Submitted
                : ApplicationStatus.Draft;

            string? appNumber = null;
            if (status == ApplicationStatus.Submitted)
            {
                appNumber = $"APP-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
            }

            var application = new Domain.Entities.Application
            {
                TenantId = request.TenantId,
                ScheduleId = request.ScheduleId,
                RegionId = request.RegionId,
                Office = request.Office,
                ApplicationNumber = appNumber,
                ReferenceNumber = $"REF-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
                Status = status,
                SubmissionMode = submissionMode,
                DataEntryMethod = dataEntryMethod,
                UserId = submitterUserId,
                IsGuest = isGuest
            };

            await _applicationRepository.AddAsync(application, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Link Application to Service
            // DynamicDataJson is intentionally omitted here: the normalized answers
            // are stored in FormFieldValue rows (see below). Keeping both would be
            // redundant storage not called for by the plan's ApplicationService schema.
            var appService = new ApplicationService
            {
                ApplicationId = application.Id,
                ServiceCategoryId = service.ServiceCategoryId,
                ServiceId = service.Id,
                ServiceVariantId = request.ServiceVariantId,
                ApplicationTypeKey = request.ApplicationTypeKey
            };
            await _applicationRepository.AddApplicationServiceAsync(appService, cancellationToken);

            // Link Applicant to Application
            var appApplicant = new ApplicationApplicant
            {
                ApplicationId = application.Id,
                ApplicantId = applicantId,
                SequenceOrder = 1
            };
            await _applicationRepository.AddApplicationApplicantAsync(appApplicant, cancellationToken);

            // Create FormSubmission and FormFieldValue rows
            if (form != null)
            {
                var formSubmission = new FormSubmission
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = application.Id,
                    FormId = form.Id,
                    ApplicantId = applicantId
                };
                await _applicationRepository.AddFormSubmissionAsync(formSubmission, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                foreach (var fieldValue in fieldValuesToInsert)
                {
                    fieldValue.FormSubmissionId = formSubmission.Id;
                    await _applicationRepository.AddFormFieldValueAsync(fieldValue, cancellationToken);
                }
            }

            // Create ApplicationStatusHistory row
            var statusHistory = new ApplicationStatusHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = application.Id,
                Status = status,
                Remarks = status == ApplicationStatus.Submitted ? "Initial submission" : "Draft created",
                Timestamp = DateTime.UtcNow,
                UserId = submitterUserId
            };
            await _applicationRepository.AddApplicationStatusHistoryAsync(statusHistory, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            string successMessage = status == ApplicationStatus.Draft
                ? "Application draft saved successfully."
                : "Application submitted successfully.";

            return ApiResponse<Guid>.Success(application.Id, successMessage);
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return ApiResponse<Guid>.Fail($"Failed to save application. Error: {ex.Message}");
        }
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }

    private static string NormalizeLabel(string label)
    {
        if (string.IsNullOrEmpty(label)) return string.Empty;
        var sb = new StringBuilder();
        bool makeNextLower = true;
        foreach (char c in label)
        {
            if (char.IsLetterOrDigit(c))
            {
                sb.Append(makeNextLower ? char.ToLowerInvariant(c) : c);
                makeNextLower = false;
            }
            else if (char.IsWhiteSpace(c))
            {
                makeNextLower = false; 
            }
        }
        return sb.ToString().ToLowerInvariant();
    }
}
