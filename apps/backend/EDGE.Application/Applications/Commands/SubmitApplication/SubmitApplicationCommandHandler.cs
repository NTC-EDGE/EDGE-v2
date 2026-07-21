using System;
using System.Security.Cryptography;
using System.Text;
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
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public SubmitApplicationCommandHandler(
        IApplicationFullRepository applicationRepository,
        IApplicantRepository applicantRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        _applicationRepository = applicationRepository;
        _applicantRepository = applicantRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<Guid>> Handle(SubmitApplicationCommand request, CancellationToken cancellationToken)
    {
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

        // 1. Strict Mode Guardrail: Bulk applications are restricted strictly to authenticated Company accounts
        bool isBulkMode = request.SubmissionMode.Equals("Bulk", StringComparison.OrdinalIgnoreCase);
        bool isCompanyAccount = request.AccountType.Equals("Company", StringComparison.OrdinalIgnoreCase);

        if (isBulkMode && (isGuest || !isCompanyAccount))
        {
            return ApiResponse<Guid>.Fail("403 Forbidden: Bulk applications are strictly restricted to authenticated Company accounts.");
        }

        var submissionMode = isBulkMode ? SubmissionMode.Bulk : SubmissionMode.Single;
        var dataEntryMethod = string.Equals(request.DataEntryMethod, "CSV", StringComparison.OrdinalIgnoreCase)
            ? DataEntryMethod.CSV
            : DataEntryMethod.Manual;
        var status = string.Equals(request.Status, "Submitted", StringComparison.OrdinalIgnoreCase)
            ? ApplicationStatus.Submitted
            : ApplicationStatus.Draft;

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            // 2. Create Application Root Header
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

            // 3. Create ApplicationService Link
            var appService = new ApplicationService
            {
                ApplicationId = application.Id,
                ServiceCategoryId = request.ServiceCategoryId,
                ServiceId = request.ServiceId,
                ServiceVariantId = request.ServiceVariantId,
                ApplicationTypeKey = request.ApplicationTypeKey,
                DynamicDataJson = request.DynamicDataJson
            };
            await _applicationRepository.AddApplicationServiceAsync(appService, cancellationToken);

            // 4. Process Applicants Array
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
                    TenantId = request.TenantId,
                    UserId = isGuest ? null : submitterUserId,
                    IsGuest = isGuest,
                    ApplicantType = applicantType,
                    ApplicantDetailId = applicantDetail.Id
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
}
