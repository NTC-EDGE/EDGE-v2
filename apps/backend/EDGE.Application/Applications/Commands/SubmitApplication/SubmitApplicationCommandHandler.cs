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
        IUserRepository userRepository)
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
    }

    public async Task<ApiResponse<Guid>> Handle(
        SubmitApplicationCommand request, CancellationToken cancellationToken)
    {
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
            if (form != null && !request.IsDraft)
            {
                var validFieldIds = form.Sections
                    .SelectMany(s => s.SectionFields)
                    .Select(sf => sf.FieldId)
                    .ToHashSet();

                foreach (var applicantDto in request.Applicants)
                {
                    var unknownFields = applicantDto.FormFieldValues
                        .Where(fv => fv.FieldId.HasValue && fv.FieldId.Value != Guid.Empty && !validFieldIds.Contains(fv.FieldId.Value))
                        .Select(fv => fv.FieldId!.Value)
                        .ToList();

                    if (unknownFields.Any())
                        return ApiResponse<Guid>.Fail(
                            $"Validation Error: Unknown FieldId(s): {string.Join(", ", unknownFields)}");
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
                    LastName = string.IsNullOrWhiteSpace(dto.LastName) ? (request.IsDraft ? "Applicant" : "") : dto.LastName,
                    EmailAddress = string.IsNullOrWhiteSpace(dto.Email) ? (request.IsDraft ? "draft@example.com" : null) : dto.Email,
                    ContactNumber = dto.ContactNumber ?? "",
                    Address = dto.Address ?? "",
                    BirthDate = (!dto.BirthDate.HasValue || dto.BirthDate.Value == default) ? new DateOnly(2000, 1, 1) : dto.BirthDate.Value
                };
                await _applicantRepository.AddApplicantDetailAsync(detail, cancellationToken);

                // Create Applicant
                var applicant = new Applicant
                {
                    Id = Guid.NewGuid(),
                    TenantId = request.TenantId,
                    UserId = submitterUserId,
                    IsGuest = isGuest,
                    ApplicantType = isBulk ? ApplicantType.Company : ApplicantType.Individual,
                    ApplicantDetailId = detail.Id,
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

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(
                application.Id,
                status == ApplicationStatus.Draft
                    ? "Application draft saved successfully."
                    : "Application submitted successfully.");
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
}