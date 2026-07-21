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
        bool isCompanyAccount = request.AccountType.Equals("Company", StringComparison.OrdinalIgnoreCase);
        
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

        if (isBulkMode && (isGuest || !isCompanyAccount))
        {
            return ApiResponse<Guid>.Fail("403 Forbidden: Bulk applications are strictly restricted to authenticated Company accounts.");
        }

        if (!isBulkMode && request.Applicants.Count > 1)
        {
            return ApiResponse<Guid>.Fail("Validation Error: Single submission mode does not allow multiple applicants.");
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

        // 4. Validate dynamic contract and unknown fields mapping
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

                // Verify no unknown fields exist
                var form = await _formRepository.GetFormByServiceIdAsync(service.Id, cancellationToken);
                if (form != null)
                {
                    var validKeysPerSection = form.Sections.ToDictionary(
                        fs => fs.Key,
                        fs => fs.SectionFields.Select(sf => {
                            var label = sf.Field?.Label ?? "";
                            return LabelToKeyMap.TryGetValue(label, out var keyVal) ? keyVal : NormalizeLabel(label);
                        }).ToHashSet(StringComparer.OrdinalIgnoreCase),
                        StringComparer.OrdinalIgnoreCase
                    );

                    foreach (var sectionProp in root.EnumerateObject())
                    {
                        var sectionKey = sectionProp.Name;
                        if (!validKeysPerSection.TryGetValue(sectionKey, out var validKeys))
                        {
                            return ApiResponse<Guid>.Fail($"Validation Error: Unknown section '{sectionKey}' is not defined in the service form layout.");
                        }

                        if (sectionProp.Value.ValueKind == JsonValueKind.Object)
                        {
                            foreach (var fieldProp in sectionProp.Value.EnumerateObject())
                            {
                                if (!validKeys.Contains(fieldProp.Name))
                                {
                                    return ApiResponse<Guid>.Fail($"Validation Error: Unknown field '{fieldProp.Name}' under section '{sectionKey}' is not defined in the service form layout.");
                                }
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

        // 5. Begin Database Transaction
        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            var submissionMode = isBulkMode ? SubmissionMode.Bulk : SubmissionMode.Single;
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
            var appService = new ApplicationService
            {
                ApplicationId = application.Id,
                ServiceCategoryId = service.ServiceCategoryId,
                ServiceId = service.Id,
                ServiceVariantId = request.ServiceVariantId,
                ApplicationTypeKey = request.ApplicationTypeKey,
                DynamicDataJson = request.DynamicDataJson ?? "{}"
            };
            await _applicationRepository.AddApplicationServiceAsync(appService, cancellationToken);

            // Process Applicants array
            int sequenceOrder = 1;
            foreach (var appInput in request.Applicants)
            {
                Guid? companyDetailId = null;
                if (appInput.ApplicantType.Equals("Company", StringComparison.OrdinalIgnoreCase) && appInput.Company != null)
                {
                    CompanyEntityType? entityType = null;
                    if (!string.IsNullOrEmpty(appInput.Company.EntityType) &&
                        Enum.TryParse<CompanyEntityType>(appInput.Company.EntityType, true, out var parsedEnum))
                    {
                        entityType = parsedEnum;
                    }

                    var companyDetail = new CompanyDetail
                    {
                        Id = Guid.NewGuid(),
                        BarangayId = appInput.Company.BarangayId ?? Guid.Empty,
                        Address = appInput.Company.Address ?? string.Empty,
                        Name = appInput.Company.Name ?? string.Empty,
                        RegistrationNumber = appInput.Company.RegistrationNumber ?? string.Empty,
                        ContactNumber = appInput.Company.ContactNumber ?? string.Empty,
                        Email = appInput.Company.Email,
                        EntityType = entityType
                    };

                    await _applicantRepository.AddCompanyDetailAsync(companyDetail, cancellationToken);
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                    companyDetailId = companyDetail.Id;
                }

                var applicantDetail = new ApplicantDetail
                {
                    Id = Guid.NewGuid(),
                    BarangayId = appInput.Details.BarangayId ?? Guid.Empty,
                    CompanyDetailId = companyDetailId,
                    Address = appInput.Details.Address ?? string.Empty,
                    FirstName = appInput.Details.FirstName ?? string.Empty,
                    MiddleName = appInput.Details.MiddleName,
                    LastName = appInput.Details.LastName ?? string.Empty,
                    Suffix = appInput.Details.Suffix,
                    Nationality = appInput.Details.Nationality ?? string.Empty,
                    Sex = appInput.Details.Sex ?? string.Empty,
                    Height = appInput.Details.Height,
                    Weight = appInput.Details.Weight,
                    BirthDate = appInput.Details.BirthDate ?? DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-20)),
                    ContactNumber = appInput.Details.ContactNumber ?? string.Empty,
                    ZipCode = appInput.Details.ZipCode,
                    SchoolAttended = appInput.Details.SchoolAttended,
                    CourseTaken = appInput.Details.CourseTaken,
                    YearGraduated = appInput.Details.YearGraduated,
                    ESignature = appInput.Details.ESignature
                };

                await _applicantRepository.AddApplicantDetailAsync(applicantDetail, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                var applicantType = appInput.ApplicantType.Equals("Company", StringComparison.OrdinalIgnoreCase)
                    ? ApplicantType.Company
                    : ApplicantType.Individual;

                var applicant = new Applicant
                {
                    Id = Guid.NewGuid(),
                    TenantId = request.TenantId,
                    UserId = isGuest ? null : submitterUserId,
                    IsGuest = isGuest,
                    ApplicantType = applicantType,
                    ApplicantDetailId = applicantDetail.Id,
                    CompanyDetailId = companyDetailId,
                    Status = ApplicantStatus.Complete
                };

                await _applicantRepository.AddApplicantAsync(applicant, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                var appApplicant = new ApplicationApplicant
                {
                    ApplicationId = application.Id,
                    ApplicantId = applicant.Id,
                    SequenceOrder = sequenceOrder++
                };

                await _applicationRepository.AddApplicationApplicantAsync(appApplicant, cancellationToken);
            }

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
                // Next letter should be capitalized for camelCase (wait, let's keep it lowercase for simple matches)
                makeNextLower = false; 
            }
        }
        return sb.ToString().ToLowerInvariant();
    }
}
