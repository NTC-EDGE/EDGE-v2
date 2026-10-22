using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.SubmitApplication;

public class SubmitApplicationCommandHandler
    : IRequestHandler<SubmitApplicationCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IApplicantRepository _applicantRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IFormRepository _formRepository;
    private readonly IFieldOfficeRepository _fieldOfficeRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IServiceVariantElementRepository _elementRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUserAuthorizationService _userAuthorizationService;
    private readonly ILogger<SubmitApplicationCommandHandler> _logger;

    public SubmitApplicationCommandHandler(
        IApplicationFullRepository applicationRepository,
        IApplicantRepository applicantRepository,
        IServiceRepository serviceRepository,
        IFormRepository formRepository,
        IFieldOfficeRepository fieldOfficeRepository,
        ITenantRepository tenantRepository,
        IScheduleRepository scheduleRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IServiceVariantElementRepository elementRepository,
        IUserRepository userRepository,
        IUserAuthorizationService userAuthorizationService,
        ILogger<SubmitApplicationCommandHandler> logger)
    {
        _applicationRepository = applicationRepository;
        _applicantRepository = applicantRepository;
        _serviceRepository = serviceRepository;
        _formRepository = formRepository;
        _fieldOfficeRepository = fieldOfficeRepository;
        _tenantRepository = tenantRepository;
        _scheduleRepository = scheduleRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _elementRepository = elementRepository;
        _userRepository = userRepository;
        _userAuthorizationService = userAuthorizationService;
        _logger = logger;
    }

    public async Task<ApiResponse<Guid>> Handle(
        SubmitApplicationCommand request, CancellationToken cancellationToken)
    {
        // 0. Verify Application Submission Permissions
        if (!await _userAuthorizationService.CanSubmitApplicationAsync(cancellationToken))
        {
            return ApiResponse<Guid>.Fail(
                "403 Forbidden: Your internal staff account does not have permission to submit service applications. Please request application submission access from your administrator.");
        }

        bool isBulk = request.SubmissionMode.Equals("Bulk", StringComparison.OrdinalIgnoreCase);

        // 1. Resolve current user
        var currentUserIdStr = _currentUserService.UserId;
        Guid? submitterUserId = null;
        if (!string.IsNullOrEmpty(currentUserIdStr))
        {
            if (Guid.TryParse(currentUserIdStr, out var parsed))
            {
                submitterUserId = parsed;
            }
            else
            {
                var dbUser = await _userRepository.GetByAuthUserIdAsync(currentUserIdStr, cancellationToken);
                if (dbUser != null)
                {
                    submitterUserId = dbUser.Id;
                }
            }
        }
        bool isGuest = submitterUserId == null;

        // 2. Validate service exists
        Service? service = null;
        if (request.ServiceId.HasValue && request.ServiceId.Value != Guid.Empty)
        {
            service = await _serviceRepository.GetByIdAsync(
                request.ServiceId.Value, cancellationToken);
            if (service == null && !request.IsDraft)
            {
                return ApiResponse<Guid>.Fail(
                    $"Validation Error: Service '{request.ServiceId}' does not exist.");
            }
        }
        else if (!request.IsDraft)
        {
            return ApiResponse<Guid>.Fail("Validation Error: Service ID is required.");
        }

        // 2a. Validate FieldOfficeId if provided and inherit RegionId from tenant
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            if (request.IsDraft)
            {
                var allTenants = await _tenantRepository.GetAllAsync(cancellationToken);
                tenant = allTenants.FirstOrDefault();

                if (tenant != null)
                {
                    _logger.LogWarning(
                        "TenantId '{RequestedTenantId}' was not found. " +
                        "Falling back to first available tenant '{FallbackTenantId}' (Name: '{FallbackTenantName}') " +
                        "for draft application save. Verify tenant seed data and configuration.",
                        request.TenantId,
                        tenant.Id,
                        tenant.Name);
                }
            }

            if (tenant == null)
            {
                return ApiResponse<Guid>.Fail(
                    "Validation Error: The specified tenant does not exist.");
            }
        }

        string? officeName = null;
        if (request.FieldOfficeId != null && request.FieldOfficeId != Guid.Empty)
        {
            var office = await _fieldOfficeRepository.GetByIdAsync(request.FieldOfficeId.Value, cancellationToken);
            if (office != null)
            {
                if (office.RegionId == tenant.RegionId || request.IsDraft)
                {
                    officeName = office.Name;
                }
                else if (!request.IsDraft)
                {
                    return ApiResponse<Guid>.Fail(
                        "Validation Error: The selected field office does not belong to the tenant's region.");
                }
            }
        }
        else if (tenant != null && !string.IsNullOrWhiteSpace(tenant.Name))
        {
            officeName = tenant.Name;
        }

        // 2c. Resolve effective scheduleId
        Guid? effectiveScheduleId = request.ScheduleId;
        if (effectiveScheduleId.HasValue && service != null)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(
                effectiveScheduleId.Value, cancellationToken);
            if ((schedule == null || schedule.ServiceId != service.Id) && !request.IsDraft)
            {
                return ApiResponse<Guid>.Fail(
                    "Validation Error: The selected schedule does not belong to the specified service.");
            }
        }

        // 3. Validate bulk is permitted by contract
        if (isBulk && service != null && !request.IsDraft)
        {
            bool allowsBulk = false;
            if (!string.IsNullOrWhiteSpace(service.Contract))
            {
                using var doc = JsonDocument.Parse(service.Contract);
                if (doc.RootElement.TryGetProperty("allowsBulkSubmission", out var bulkProp))
                    allowsBulk = bulkProp.GetBoolean();
            }

            if (!allowsBulk)
                return ApiResponse<Guid>.Fail(
                    "Validation Error: This service does not allow bulk submission.");
        }

        // 4. Validate schedule for Exam category services (only for final submissions)
        if (!request.IsDraft && service?.ServiceCategory?.Type == ServiceCategoryType.Exam)
        {
            if (!effectiveScheduleId.HasValue || effectiveScheduleId == Guid.Empty)
                return ApiResponse<Guid>.Fail(
                    "Validation Error: ScheduleId is required for exam services.");

            var schedule = await _scheduleRepository.GetByIdAsync(
                effectiveScheduleId.Value, cancellationToken);
            if (schedule == null)
                return ApiResponse<Guid>.Fail(
                    $"Validation Error: Examination schedule '{effectiveScheduleId}' does not exist.");
        }

        // 5. Validate all submitted FieldIds exist in the form (only for final submissions)
        Form? form = null;
        if (service != null)
        {
            form = await _formRepository.GetFormByServiceIdAsync(service.Id, cancellationToken);
            if (!request.IsDraft)
            {
                var submittedFieldIds = request.Applicants
                    .SelectMany(a => a.FormFieldValues)
                    .Where(fv => fv.FieldId.HasValue && fv.FieldId.Value != Guid.Empty)
                    .Select(fv => fv.FieldId!.Value)
                    .Distinct()
                    .ToList();

                var existingFieldsInDb = submittedFieldIds.Count > 0
                    ? await _formRepository.GetFieldsByIdsAsync(submittedFieldIds, cancellationToken)
                    : null;
                var validFieldIds = (existingFieldsInDb ?? Enumerable.Empty<Field>()).Select(f => f.Id).ToHashSet();

                if (form != null)
                {
                    foreach (var sf in form.Sections.SelectMany(s => s.SectionFields))
                    {
                        validFieldIds.Add(sf.FieldId);
                    }
                }

                // If form repository has no fields registered for this service and DB lookup yielded no results,
                // do not sanitize to avoid wiping out fields in mock or pre-seeder test environments.
                if (validFieldIds.Count == 0 && form == null)
                {
                    // keep all submitted fields
                }
                else
                {
                    foreach (var applicantDto in request.Applicants)
                    {
                        var invalidFields = applicantDto.FormFieldValues
                            .Where(fv => fv.FieldId.HasValue && fv.FieldId.Value != Guid.Empty && !validFieldIds.Contains(fv.FieldId.Value))
                            .ToList();

                        if (invalidFields.Count > 0)
                        {
                            _logger.LogWarning(
                                "Sanitizing submitted form for applicant: {Count} FormFieldValue(s) with non-existent FieldIds were removed to prevent database foreign key violation. Form '{FormId}', Service '{ServiceId}'. Removed FieldIds: {RemovedFieldIds}",
                                invalidFields.Count,
                                form?.Id ?? Guid.Empty,
                                service.Id,
                                string.Join(", ", invalidFields.Select(f => f.FieldId)));

                            applicantDto.FormFieldValues.RemoveAll(fv => fv.FieldId.HasValue && fv.FieldId.Value != Guid.Empty && !validFieldIds.Contains(fv.FieldId.Value));
                        }
                    }
                }
            }
        }

        // Derive/Resolve ServiceVariantId and ApplicationTypeKey
        string effectiveAppTypeKey = "New";
        Guid? resolvedVariantId = null;

        if (request.ServiceVariantId.HasValue && request.ServiceVariantId.Value != Guid.Empty)
        {
            var selectedVariant = await _serviceRepository.GetVariantByIdAsync(request.ServiceVariantId.Value, cancellationToken);
            if (selectedVariant != null && (service == null || selectedVariant.ServiceId == service.Id))
            {
                resolvedVariantId = selectedVariant.Id;
                effectiveAppTypeKey = selectedVariant.Type.ToString();
            }
            else if (!request.IsDraft)
            {
                return ApiResponse<Guid>.Fail("Validation Error: The selected service variant is invalid or does not belong to the selected service.");
            }
        }
        else if (service != null)
        {
            // Fallback: Derive ApplicationTypeKey from submitted formFieldValues matching a valid ServiceVariantType.
            var firstFormValues = request.Applicants.FirstOrDefault()?.FormFieldValues;
            if (firstFormValues != null)
            {
                var validVariantNames = Enum.GetNames<ServiceVariantType>();
                var matchedValue = firstFormValues
                    .Select(fv => fv.Value?.Trim())
                    .FirstOrDefault(v => !string.IsNullOrWhiteSpace(v) &&
                        validVariantNames.Any(n => n.Equals(v, StringComparison.OrdinalIgnoreCase)));
                if (!string.IsNullOrEmpty(matchedValue))
                {
                    effectiveAppTypeKey = matchedValue;
                }
            }

            resolvedVariantId = service.ServiceVariants?
                .FirstOrDefault(v => v.Type.ToString().Equals(effectiveAppTypeKey, StringComparison.OrdinalIgnoreCase))?.Id;
        }

        // Validate ServiceVariantElementIds if provided
        if (!request.IsDraft && request.ServiceVariantElementIds != null && request.ServiceVariantElementIds.Any())
        {
            if (!resolvedVariantId.HasValue)
            {
                return ApiResponse<Guid>.Fail("Validation Error: Cannot select variant elements without a resolved service variant.");
            }

            var validElements = await _elementRepository.GetAllByVariantAsync(resolvedVariantId.Value, cancellationToken);
            var validElementIds = validElements.Select(e => e.Id).ToHashSet();

            var invalidElementIds = request.ServiceVariantElementIds.Where(id => !validElementIds.Contains(id)).ToList();
            if (invalidElementIds.Any())
            {
                return ApiResponse<Guid>.Fail($"Validation Error: Element ID(s) '{string.Join(", ", invalidElementIds)}' do not belong to the selected variant.");
            }
        }

        // 6. Begin transaction
        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            var submissionMode = isBulk ? SubmissionMode.Bulk : SubmissionMode.Single;
            var intent = request.Intent.Equals("AssessmentOnly", StringComparison.OrdinalIgnoreCase)
                ? ApplicationIntent.AssessmentOnly
                : ApplicationIntent.Regular;
            var status = request.IsDraft
                ? ApplicationStatus.Draft
                : ApplicationStatus.Submitted;

            string? appNumber = status == ApplicationStatus.Submitted
                ? $"APP-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}"
                : null;

            Domain.Entities.Application application;
            if (request.ExistingDraftId.HasValue && request.ExistingDraftId.Value != Guid.Empty)
            {
                var existing = await _applicationRepository.GetByIdAsync(request.ExistingDraftId.Value, cancellationToken);
                if (existing != null && existing.Status == ApplicationStatus.Draft)
                {
                    existing.TenantId = request.TenantId;
                    existing.ScheduleId = effectiveScheduleId;
                    existing.RegionId = tenant.RegionId;
                    existing.Office = officeName;
                    existing.Status = status;
                    existing.Intent = intent;
                    existing.SubmissionMode = submissionMode;
                    if (status == ApplicationStatus.Submitted)
                    {
                        existing.ApplicationNumber = appNumber;
                    }
                    application = existing;
                    await _applicationRepository.UpdateAsync(existing, cancellationToken);
                }
                else
                {
                    application = new Domain.Entities.Application
                    {
                        TenantId = request.TenantId,
                        ScheduleId = effectiveScheduleId,
                        RegionId = tenant.RegionId,
                        Office = officeName,
                        ApplicationNumber = appNumber,
                        ReferenceNumber = $"REF-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
                        Status = status,
                        Intent = intent,
                        SubmissionMode = submissionMode,
                        DataEntryMethod = DataEntryMethod.Manual,
                        UserId = submitterUserId,
                        IsGuest = isGuest
                    };
                    await _applicationRepository.AddAsync(application, cancellationToken);
                }
            }
            else
            {
                // Create Application (inheriting RegionId from Tenant)
                application = new Domain.Entities.Application
                {
                    TenantId = request.TenantId,
                    ScheduleId = effectiveScheduleId,
                    RegionId = tenant.RegionId,
                    Office = officeName,
                    ApplicationNumber = appNumber,
                    ReferenceNumber = $"REF-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
                    Status = status,
                    Intent = intent,
                    SubmissionMode = submissionMode,
                    DataEntryMethod = DataEntryMethod.Manual, // CSV deferred
                    UserId = submitterUserId,
                    IsGuest = isGuest
                };
                await _applicationRepository.AddAsync(application, cancellationToken);
            }
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Loop over applicants — runs once for Single, N times for Bulk
            int sequenceOrder = 1;
            foreach (var dto in request.Applicants)
            {
                // Create ApplicantDetail with safe fallbacks for draft incomplete entries
                var detail = new ApplicantDetail
                {
                    Id = Guid.NewGuid(),
                    FirstName = string.IsNullOrWhiteSpace(dto.FirstName) ? (request.IsDraft ? "Draft" : "") : dto.FirstName,
                    MiddleName = dto.MiddleName,
                    LastName = string.IsNullOrWhiteSpace(dto.LastName) ? (request.IsDraft ? "Applicant" : "") : dto.LastName,
                    Suffix = dto.Suffix,
                    Sex = !string.IsNullOrWhiteSpace(dto.Sex)
                        ? dto.Sex
                        : (dto.FormFieldValues.FirstOrDefault(fv => (fv.FieldLabel ?? "").ToLower().Contains("sex") || (fv.FieldLabel ?? "").ToLower().Contains("gender"))?.Value ?? ""),
                    Nationality = !string.IsNullOrWhiteSpace(dto.Nationality)
                        ? dto.Nationality
                        : (dto.FormFieldValues.FirstOrDefault(fv => (fv.FieldLabel ?? "").ToLower().Contains("nationality") || (fv.FieldLabel ?? "").ToLower().Contains("citizenship"))?.Value ?? "Filipino"),
                    Height = dto.Height,
                    Weight = dto.Weight,
                    ZipCode = !string.IsNullOrWhiteSpace(dto.ZipCode)
                        ? dto.ZipCode
                        : dto.FormFieldValues.FirstOrDefault(fv => (fv.FieldLabel ?? "").ToLower().Contains("zip") || (fv.FieldLabel ?? "").ToLower().Contains("postal"))?.Value,
                    SchoolAttended = !string.IsNullOrWhiteSpace(dto.SchoolAttended)
                        ? dto.SchoolAttended
                        : dto.FormFieldValues.FirstOrDefault(fv => (fv.FieldLabel ?? "").ToLower().Contains("school") || (fv.FieldLabel ?? "").ToLower().Contains("university"))?.Value,
                    CourseTaken = !string.IsNullOrWhiteSpace(dto.CourseTaken)
                        ? dto.CourseTaken
                        : dto.FormFieldValues.FirstOrDefault(fv => (fv.FieldLabel ?? "").ToLower().Contains("course") || (fv.FieldLabel ?? "").ToLower().Contains("degree"))?.Value,
                    YearGraduated = !string.IsNullOrWhiteSpace(dto.YearGraduated)
                        ? dto.YearGraduated
                        : dto.FormFieldValues.FirstOrDefault(fv => (fv.FieldLabel ?? "").ToLower().Contains("graduat"))?.Value,
                    BarangayId = dto.BarangayId,
                    EmailAddress = string.IsNullOrWhiteSpace(dto.Email) ? (request.IsDraft ? "draft@example.com" : null) : dto.Email,
                    ContactNumber = dto.ContactNumber ?? "",
                    Address = dto.Address ?? "",
                    BirthDate = (!dto.BirthDate.HasValue || dto.BirthDate.Value == default) ? new DateOnly(2000, 1, 1) : dto.BirthDate.Value,
                    ESignature = dto.ESignature
                };
                await _applicantRepository.AddApplicantDetailAsync(detail, cancellationToken);

                // Resolve ApplicantType (prefer explicit DTO value, fallback to isBulk ? Company : Individual)
                ApplicantType resolvedApplicantType = isBulk ? ApplicantType.Company : ApplicantType.Individual;
                if (!string.IsNullOrWhiteSpace(dto.ApplicantType) &&
                    Enum.TryParse<ApplicantType>(dto.ApplicantType, true, out var parsedType))
                {
                    resolvedApplicantType = parsedType;
                }

                Guid? companyDetailId = null;
                if (resolvedApplicantType == ApplicantType.Company && !string.IsNullOrWhiteSpace(dto.CompanyName))
                {
                    var companyDetail = new CompanyDetail
                    {
                        Id = Guid.NewGuid(),
                        Name = dto.CompanyName,
                        RegistrationNumber = dto.DtiSecRegistration ?? "",
                        Address = dto.Address ?? "",
                        ContactNumber = dto.ContactNumber ?? "",
                        Email = dto.Email
                    };
                    await _applicantRepository.AddCompanyDetailAsync(companyDetail, cancellationToken);
                    companyDetailId = companyDetail.Id;
                }

                // Create Applicant
                var applicant = new Applicant
                {
                    Id = Guid.NewGuid(),
                    TenantId = request.TenantId,
                    UserId = submitterUserId,
                    IsGuest = isGuest,
                    ApplicantType = resolvedApplicantType,
                    ApplicantDetailId = detail.Id,
                    CompanyDetailId = companyDetailId,
                    Status = request.IsDraft ? ApplicantStatus.Incomplete : ApplicantStatus.Complete
                };
                await _applicantRepository.AddApplicantAsync(applicant, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                // Link Applicant to Application
                var appApplicant = new ApplicationApplicant
                {
                    ApplicationId = application.Id,
                    ApplicantId = applicant.Id,
                    SequenceOrder = sequenceOrder++
                };
                await _applicationRepository.AddApplicationApplicantAsync(
                    appApplicant, cancellationToken);

                // Determine per-applicant service parameters (fallback to root request values if not specified)
                Guid? applicantServiceId = dto.ServiceId.HasValue && dto.ServiceId.Value != Guid.Empty
                    ? dto.ServiceId.Value
                    : service?.Id;

                Guid? applicantVariantId = dto.ServiceVariantId.HasValue && dto.ServiceVariantId.Value != Guid.Empty
                    ? dto.ServiceVariantId.Value
                    : resolvedVariantId;

                applicant.ServiceId = applicantServiceId;
                applicant.ServiceVariantId = applicantVariantId;
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                // Create FormSubmission + FormFieldValue rows tied to Applicant
                Form? applicantForm = null;
                if (applicantServiceId.HasValue && applicantServiceId.Value != Guid.Empty)
                {
                    applicantForm = (service != null && applicantServiceId.Value == service.Id)
                        ? form
                        : await _formRepository.GetFormByServiceIdAsync(applicantServiceId.Value, cancellationToken);
                }

                if (applicantForm != null)
                {
                    var formSubmission = new FormSubmission
                    {
                        Id = Guid.NewGuid(),
                        ApplicationId = application.Id,
                        FormId = applicantForm.Id,
                        ApplicantId = applicant.Id
                    };
                    await _applicationRepository.AddFormSubmissionAsync(
                        formSubmission, cancellationToken);
                    await _unitOfWork.SaveChangesAsync(cancellationToken);

                    var distinctFieldValues = dto.FormFieldValues
                        .Where(fv => fv.FieldId.HasValue && fv.FieldId.Value != Guid.Empty)
                        .GroupBy(fv => fv.FieldId!.Value)
                        .Select(g => g.Last())
                        .ToList();

                    foreach (var fv in distinctFieldValues)
                    {
                        await _applicationRepository.AddFormFieldValueAsync(new FormFieldValue
                        {
                            Id = Guid.NewGuid(),
                            FormSubmissionId = formSubmission.Id,
                            FieldId = fv.FieldId!.Value,
                            Value = fv.Value ?? ""
                        }, cancellationToken);
                    }
                }
            }

            // Create ApplicationStatusHistory
            await _applicationRepository.AddApplicationStatusHistoryAsync(
                new ApplicationStatusHistory
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = application.Id,
                    Status = status,
                    Remarks = status == ApplicationStatus.Submitted
                        ? "Initial submission"
                        : "Draft created",
                    Timestamp = DateTime.UtcNow,
                    UserId = submitterUserId
                }, cancellationToken);

            if (status == ApplicationStatus.Submitted)
            {
                var firstApp = request.Applicants.FirstOrDefault();
                var submitterName = firstApp != null && !string.IsNullOrWhiteSpace($"{firstApp.FirstName} {firstApp.LastName}".Trim())
                    ? $"{firstApp.FirstName} {firstApp.LastName}".Trim()
                    : "Applicant";
                
                var actionName = intent == ApplicationIntent.AssessmentOnly
                    ? "Pre-Assessment submitted by applicant"
                    : "Application submitted by applicant";

                var remarks = intent == ApplicationIntent.AssessmentOnly
                    ? "Application submitted for pre-assessment and SOA estimation"
                    : "Initial application submission";

                await _applicationRepository.AddApplicationHistoryAsync(
                    new ApplicationHistory
                    {
                        Id = Guid.NewGuid(),
                        ApplicationId = application.Id,
                        Action = actionName,
                        FromStatus = null,
                        ToStatus = ApplicationStatus.Submitted,
                        PerformedByUserId = submitterUserId,
                        StaffName = submitterName,
                        StaffRole = "Applicant",
                        Remarks = remarks,
                        Timestamp = DateTime.UtcNow
                    }, cancellationToken);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            string successMessage = status == ApplicationStatus.Draft
                ? "Application draft saved successfully."
                : (intent == ApplicationIntent.AssessmentOnly
                    ? "Pre-assessment request submitted successfully."
                    : "Application submitted successfully.");

            return ApiResponse<Guid>.Success(
                application.Id,
                successMessage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to submit or save application for TenantId '{TenantId}', ExistingDraftId '{ExistingDraftId}'.", request.TenantId, request.ExistingDraftId);
            try
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            }
            catch (Exception rollbackEx)
            {
                _logger.LogWarning(rollbackEx, "Transaction rollback failed during application submission for TenantId '{TenantId}'.", request.TenantId);
            }
            return ApiResponse<Guid>.Fail("An unexpected error occurred while saving the application. Please try again later.");
        }
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}