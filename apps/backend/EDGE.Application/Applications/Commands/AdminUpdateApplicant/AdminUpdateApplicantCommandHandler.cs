using System;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Applicants.Dtos;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.AdminUpdateApplicant;

public class AdminUpdateApplicantCommandHandler : IRequestHandler<AdminUpdateApplicantCommand, ApiResponse<ApplicantDto>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AdminUpdateApplicantCommandHandler> _logger;

    public AdminUpdateApplicantCommandHandler(
        IApplicationFullRepository applicationRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork,
        ILogger<AdminUpdateApplicantCommandHandler> logger)
    {
        _applicationRepository = applicationRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ApiResponse<ApplicantDto>> Handle(AdminUpdateApplicantCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<ApplicantDto>.Fail($"Application with ID {request.ApplicationId} was not found.");
        }

        var appApplicant = app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == request.ApplicantId);
        if (appApplicant == null || appApplicant.Applicant == null)
        {
            return ApiResponse<ApplicantDto>.Fail($"Applicant with ID {request.ApplicantId} was not found on this application.");
        }

        var applicant = appApplicant.Applicant;
        var detail = applicant.ApplicantDetail;
        if (detail == null)
        {
            detail = new ApplicantDetail { Id = Guid.NewGuid() };
            applicant.ApplicantDetail = detail;
            applicant.ApplicantDetailId = detail.Id;
        }

        var staffName = _currentUserService.UserId ?? "NTC Agency Staff";

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            // ── 1. Root Applicant Properties ──
            if (!string.IsNullOrWhiteSpace(request.ApplicantType) &&
                Enum.TryParse<ApplicantType>(request.ApplicantType, true, out var parsedType) &&
                applicant.ApplicantType != parsedType)
            {
                await LogAuditAsync(app.Id, "Applicant Root", "ApplicantType", applicant.ApplicantType.ToString(), parsedType.ToString(), staffName, cancellationToken);
                applicant.ApplicantType = parsedType;
            }

            if (!string.IsNullOrWhiteSpace(request.Status) &&
                Enum.TryParse<ApplicantStatus>(request.Status, true, out var parsedStatus) &&
                applicant.Status != parsedStatus)
            {
                await LogAuditAsync(app.Id, "Applicant Root", "Status", applicant.Status.ToString(), parsedStatus.ToString(), staffName, cancellationToken);
                applicant.Status = parsedStatus;
            }

            if (request.EvaluationRemarks != null && request.EvaluationRemarks != applicant.EvaluationRemarks)
            {
                await LogAuditAsync(app.Id, "Applicant Root", "EvaluationRemarks", applicant.EvaluationRemarks ?? string.Empty, request.EvaluationRemarks, staffName, cancellationToken);
                applicant.EvaluationRemarks = request.EvaluationRemarks;
            }

            if (request.ServiceId.HasValue && request.ServiceId.Value != applicant.ServiceId)
            {
                await LogAuditAsync(app.Id, "Applicant Root", "ServiceId", applicant.ServiceId?.ToString() ?? string.Empty, request.ServiceId.Value.ToString(), staffName, cancellationToken);
                applicant.ServiceId = request.ServiceId.Value;
            }

            if (request.ServiceVariantId.HasValue && request.ServiceVariantId.Value != applicant.ServiceVariantId)
            {
                await LogAuditAsync(app.Id, "Applicant Root", "ServiceVariantId", applicant.ServiceVariantId?.ToString() ?? string.Empty, request.ServiceVariantId.Value.ToString(), staffName, cancellationToken);
                applicant.ServiceVariantId = request.ServiceVariantId.Value;
            }

            // ── 2. Applicant Profile Details ──
            var reqDetail = request.Details;

            var newFirstName = reqDetail?.FirstName ?? request.FirstName;
            if (newFirstName != null && newFirstName != detail.FirstName)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "FirstName", detail.FirstName ?? string.Empty, newFirstName, staffName, cancellationToken);
                detail.FirstName = newFirstName;
            }

            var newMiddleName = reqDetail?.MiddleName ?? request.MiddleName;
            if (newMiddleName != null && newMiddleName != detail.MiddleName)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "MiddleName", detail.MiddleName ?? string.Empty, newMiddleName, staffName, cancellationToken);
                detail.MiddleName = newMiddleName;
            }

            var newLastName = reqDetail?.LastName ?? request.LastName;
            if (newLastName != null && newLastName != detail.LastName)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "LastName", detail.LastName ?? string.Empty, newLastName, staffName, cancellationToken);
                detail.LastName = newLastName;
            }

            var newSuffix = reqDetail?.Suffix ?? request.Suffix;
            if (newSuffix != null && newSuffix != detail.Suffix)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "Suffix", detail.Suffix ?? string.Empty, newSuffix, staffName, cancellationToken);
                detail.Suffix = newSuffix;
            }

            var newSex = reqDetail?.Sex ?? request.Sex;
            if (newSex != null && newSex != detail.Sex)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "Sex", detail.Sex ?? string.Empty, newSex, staffName, cancellationToken);
                detail.Sex = newSex;
            }

            var newNationality = reqDetail?.Nationality ?? request.Nationality;
            if (newNationality != null && newNationality != detail.Nationality)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "Nationality", detail.Nationality ?? string.Empty, newNationality, staffName, cancellationToken);
                detail.Nationality = newNationality;
            }

            var newContactNumber = reqDetail?.ContactNumber ?? request.ContactNumber;
            if (newContactNumber != null && newContactNumber != detail.ContactNumber)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "ContactNumber", detail.ContactNumber ?? string.Empty, newContactNumber, staffName, cancellationToken);
                detail.ContactNumber = newContactNumber;
            }

            var newEmail = reqDetail?.EmailAddress ?? request.Email;
            if (newEmail != null && newEmail != detail.EmailAddress)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "EmailAddress", detail.EmailAddress ?? string.Empty, newEmail, staffName, cancellationToken);
                detail.EmailAddress = newEmail;
            }

            var newAddress = reqDetail?.Address ?? request.Address;
            if (newAddress != null && newAddress != detail.Address)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "Address", detail.Address ?? string.Empty, newAddress, staffName, cancellationToken);
                detail.Address = newAddress;
            }

            if (reqDetail?.BarangayId.HasValue == true && reqDetail.BarangayId.Value != detail.BarangayId)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "BarangayId", detail.BarangayId?.ToString() ?? string.Empty, reqDetail.BarangayId.Value.ToString(), staffName, cancellationToken);
                detail.BarangayId = reqDetail.BarangayId.Value;
            }

            var newZipCode = reqDetail?.ZipCode ?? request.ZipCode;
            if (newZipCode != null && newZipCode != detail.ZipCode)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "ZipCode", detail.ZipCode ?? string.Empty, newZipCode, staffName, cancellationToken);
                detail.ZipCode = newZipCode;
            }

            var newHeight = reqDetail?.Height ?? request.Height;
            if (newHeight.HasValue && newHeight.Value != detail.Height)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "Height", detail.Height?.ToString(CultureInfo.InvariantCulture) ?? string.Empty, newHeight.Value.ToString(CultureInfo.InvariantCulture), staffName, cancellationToken);
                detail.Height = newHeight.Value;
            }

            var newWeight = reqDetail?.Weight ?? request.Weight;
            if (newWeight.HasValue && newWeight.Value != detail.Weight)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "Weight", detail.Weight?.ToString(CultureInfo.InvariantCulture) ?? string.Empty, newWeight.Value.ToString(CultureInfo.InvariantCulture), staffName, cancellationToken);
                detail.Weight = newWeight.Value;
            }

            // BirthDate update (handles DateOnly, string Dob)
            DateOnly? resolvedBirthDate = reqDetail?.BirthDate;
            if (!resolvedBirthDate.HasValue)
            {
                var rawDob = reqDetail?.Dob ?? request.Dob;
                if (!string.IsNullOrWhiteSpace(rawDob) && DateOnly.TryParse(rawDob, out var parsedDob))
                {
                    resolvedBirthDate = parsedDob;
                }
            }

            if (resolvedBirthDate.HasValue && resolvedBirthDate.Value != detail.BirthDate)
            {
                var oldDobStr = detail.BirthDate == default ? string.Empty : detail.BirthDate.ToString("yyyy-MM-dd");
                var newDobStr = resolvedBirthDate.Value.ToString("yyyy-MM-dd");
                await LogAuditAsync(app.Id, "Applicant Profile", "BirthDate", oldDobStr, newDobStr, staffName, cancellationToken);
                detail.BirthDate = resolvedBirthDate.Value;
            }

            if (reqDetail?.SchoolAttended != null && reqDetail.SchoolAttended != detail.SchoolAttended)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "SchoolAttended", detail.SchoolAttended ?? string.Empty, reqDetail.SchoolAttended, staffName, cancellationToken);
                detail.SchoolAttended = reqDetail.SchoolAttended;
            }

            if (reqDetail?.CourseTaken != null && reqDetail.CourseTaken != detail.CourseTaken)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "CourseTaken", detail.CourseTaken ?? string.Empty, reqDetail.CourseTaken, staffName, cancellationToken);
                detail.CourseTaken = reqDetail.CourseTaken;
            }

            if (reqDetail?.YearGraduated != null && reqDetail.YearGraduated != detail.YearGraduated)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "YearGraduated", detail.YearGraduated ?? string.Empty, reqDetail.YearGraduated, staffName, cancellationToken);
                detail.YearGraduated = reqDetail.YearGraduated;
            }

            if (reqDetail?.ESignature != null && reqDetail.ESignature != detail.ESignature)
            {
                await LogAuditAsync(app.Id, "Applicant Profile", "ESignature", detail.ESignature ?? string.Empty, reqDetail.ESignature, staffName, cancellationToken);
                detail.ESignature = reqDetail.ESignature;
            }

            // ── 3. Company Details ──
            var reqCompany = request.Company;
            var hasCompanyValues = (reqCompany != null && (
                !string.IsNullOrWhiteSpace(reqCompany.Name) ||
                !string.IsNullOrWhiteSpace(reqCompany.RegistrationNumber) ||
                !string.IsNullOrWhiteSpace(reqCompany.Address) ||
                !string.IsNullOrWhiteSpace(reqCompany.ContactNumber) ||
                !string.IsNullOrWhiteSpace(reqCompany.Email) ||
                !string.IsNullOrWhiteSpace(reqCompany.EntityType) ||
                reqCompany.BarangayId.HasValue
            )) ||
            !string.IsNullOrWhiteSpace(request.CompanyName) ||
            !string.IsNullOrWhiteSpace(request.CompanyRegistrationNumber) ||
            !string.IsNullOrWhiteSpace(request.CompanyAddress) ||
            !string.IsNullOrWhiteSpace(request.CompanyContactNumber) ||
            !string.IsNullOrWhiteSpace(request.CompanyEmail);

            if (hasCompanyValues || applicant.CompanyDetail != null)
            {
                if (applicant.CompanyDetail == null && hasCompanyValues)
                {
                    var newComp = new CompanyDetail { Id = Guid.NewGuid() };
                    await _applicationRepository.AddCompanyDetailAsync(newComp, cancellationToken);
                    applicant.CompanyDetail = newComp;
                    applicant.CompanyDetailId = newComp.Id;
                }

                if (applicant.CompanyDetail != null)
                {
                    var comp = applicant.CompanyDetail;

                var newCompName = reqCompany?.Name ?? request.CompanyName;
                if (newCompName != null && newCompName != comp.Name)
                {
                    await LogAuditAsync(app.Id, "Applicant Company Profile", "CompanyName", comp.Name ?? string.Empty, newCompName, staffName, cancellationToken);
                    comp.Name = newCompName;
                }

                var newCompRegNo = reqCompany?.RegistrationNumber ?? request.CompanyRegistrationNumber;
                if (newCompRegNo != null && newCompRegNo != comp.RegistrationNumber)
                {
                    await LogAuditAsync(app.Id, "Applicant Company Profile", "RegistrationNumber", comp.RegistrationNumber ?? string.Empty, newCompRegNo, staffName, cancellationToken);
                    comp.RegistrationNumber = newCompRegNo;
                }

                var newCompAddress = reqCompany?.Address ?? request.CompanyAddress;
                if (newCompAddress != null && newCompAddress != comp.Address)
                {
                    await LogAuditAsync(app.Id, "Applicant Company Profile", "CompanyAddress", comp.Address ?? string.Empty, newCompAddress, staffName, cancellationToken);
                    comp.Address = newCompAddress;
                }

                if (reqCompany?.BarangayId.HasValue == true && reqCompany.BarangayId.Value != comp.BarangayId)
                {
                    await LogAuditAsync(app.Id, "Applicant Company Profile", "BarangayId", comp.BarangayId?.ToString() ?? string.Empty, reqCompany.BarangayId.Value.ToString(), staffName, cancellationToken);
                    comp.BarangayId = reqCompany.BarangayId.Value;
                }

                var newCompContact = reqCompany?.ContactNumber ?? request.CompanyContactNumber;
                if (newCompContact != null && newCompContact != comp.ContactNumber)
                {
                    await LogAuditAsync(app.Id, "Applicant Company Profile", "CompanyContactNumber", comp.ContactNumber ?? string.Empty, newCompContact, staffName, cancellationToken);
                    comp.ContactNumber = newCompContact;
                }

                var newCompEmail = reqCompany?.Email ?? request.CompanyEmail;
                if (newCompEmail != null && newCompEmail != comp.Email)
                {
                    await LogAuditAsync(app.Id, "Applicant Company Profile", "CompanyEmail", comp.Email ?? string.Empty, newCompEmail, staffName, cancellationToken);
                    comp.Email = newCompEmail;
                }

                if (!string.IsNullOrWhiteSpace(reqCompany?.EntityType) &&
                    Enum.TryParse<CompanyEntityType>(reqCompany.EntityType, true, out var parsedEntityType) &&
                    comp.EntityType != parsedEntityType)
                {
                    await LogAuditAsync(app.Id, "Applicant Company Profile", "EntityType", comp.EntityType?.ToString() ?? string.Empty, parsedEntityType.ToString(), staffName, cancellationToken);
                    comp.EntityType = parsedEntityType;
                }
                }
            }

            await _applicationRepository.UpdateAsync(app, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            // Construct response ApplicantDto
            var resultDto = new ApplicantDto
            {
                Id = applicant.Id,
                TenantId = applicant.TenantId,
                UserId = applicant.UserId,
                IsGuest = applicant.IsGuest,
                ApplicantType = applicant.ApplicantType.ToString(),
                Status = applicant.Status.ToString(),
                EvaluationRemarks = applicant.EvaluationRemarks,
                ServiceId = applicant.ServiceId,
                ServiceName = applicant.Service?.Name,
                ServiceCode = applicant.Service?.Code,
                ServiceVariantId = applicant.ServiceVariantId,
                ServiceVariantName = applicant.ServiceVariant?.Type.ToString(),
                SubmissionId = applicant.FormSubmission?.Id ?? app.FormSubmissions.FirstOrDefault(fs => fs.ApplicantId == applicant.Id)?.Id,
                Details = detail != null ? new ApplicantDetailDto
                {
                    Id = detail.Id,
                    BarangayId = detail.BarangayId ?? Guid.Empty,
                    Address = detail.Address,
                    FirstName = detail.FirstName,
                    MiddleName = detail.MiddleName,
                    LastName = detail.LastName,
                    Suffix = detail.Suffix,
                    Nationality = detail.Nationality,
                    Sex = detail.Sex,
                    Height = detail.Height,
                    Weight = detail.Weight,
                    BirthDate = detail.BirthDate,
                    ContactNumber = detail.ContactNumber,
                    EmailAddress = detail.EmailAddress,
                    ZipCode = detail.ZipCode,
                    SchoolAttended = detail.SchoolAttended,
                    CourseTaken = detail.CourseTaken,
                    YearGraduated = detail.YearGraduated,
                    ESignature = detail.ESignature
                } : null,
                Company = applicant.CompanyDetail != null ? new CompanyDetailDto
                {
                    Id = applicant.CompanyDetail.Id,
                    BarangayId = applicant.CompanyDetail.BarangayId,
                    Address = applicant.CompanyDetail.Address,
                    Name = applicant.CompanyDetail.Name,
                    RegistrationNumber = applicant.CompanyDetail.RegistrationNumber,
                    ContactNumber = applicant.CompanyDetail.ContactNumber,
                    Email = applicant.CompanyDetail.Email,
                    EntityType = applicant.CompanyDetail.EntityType?.ToString()
                } : null
            };

            return ApiResponse<ApplicantDto>.Success(resultDto, "Applicant details updated successfully by staff.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update applicant details for ApplicationId {ApplicationId}, ApplicantId {ApplicantId}", request.ApplicationId, request.ApplicantId);
            try
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            }
            catch (Exception rollbackEx)
            {
                _logger.LogWarning(rollbackEx, "Transaction rollback failed during applicant details update.");
            }
            return ApiResponse<ApplicantDto>.Fail("An unexpected error occurred while updating applicant details. Please try again or contact support.");
        }
    }

    private async Task LogAuditAsync(
        Guid applicationId,
        string category,
        string fieldName,
        string oldValue,
        string newValue,
        string staffName,
        CancellationToken cancellationToken)
    {
        await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
        {
            ApplicationId = applicationId,
            Category = category,
            FieldName = fieldName,
            OldValue = oldValue,
            NewValue = newValue,
            CorrectedByStaff = staffName,
            CorrectedAt = DateTime.UtcNow
        }, cancellationToken);
    }
}
