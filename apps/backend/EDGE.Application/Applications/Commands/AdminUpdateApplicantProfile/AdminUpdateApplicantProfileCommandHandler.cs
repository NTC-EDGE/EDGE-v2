using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.AdminUpdateApplicantProfile;

public class AdminUpdateApplicantProfileCommandHandler : IRequestHandler<AdminUpdateApplicantProfileCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AdminUpdateApplicantProfileCommandHandler> _logger;

    public AdminUpdateApplicantProfileCommandHandler(
        IApplicationFullRepository applicationRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork,
        ILogger<AdminUpdateApplicantProfileCommandHandler> logger)
    {
        _applicationRepository = applicationRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ApiResponse<Guid>> Handle(AdminUpdateApplicantProfileCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID {request.ApplicationId} was not found.");
        }

        var appApplicant = app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == request.ApplicantId);
        if (appApplicant == null && (request.ApplicantId == app.Id || app.ApplicationApplicants.Count == 1))
        {
            appApplicant = app.ApplicationApplicants.FirstOrDefault();
        }

        if (appApplicant == null || appApplicant.Applicant == null)
        {
            return ApiResponse<Guid>.Fail($"Applicant with ID {request.ApplicantId} was not found on this application.");
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
            // Audit & update First Name
            if (request.FirstName != null && request.FirstName != detail.FirstName)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Applicant Profile",
                    FieldName = "FirstName",
                    OldValue = detail.FirstName ?? string.Empty,
                    NewValue = request.FirstName,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                detail.FirstName = request.FirstName;
            }

            // Audit & update Last Name
            if (request.LastName != null && request.LastName != detail.LastName)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Applicant Profile",
                    FieldName = "LastName",
                    OldValue = detail.LastName ?? string.Empty,
                    NewValue = request.LastName,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                detail.LastName = request.LastName;
            }

            // Audit & update Middle Name
            if (request.MiddleName != null && request.MiddleName != detail.MiddleName)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Applicant Profile",
                    FieldName = "MiddleName",
                    OldValue = detail.MiddleName ?? string.Empty,
                    NewValue = request.MiddleName,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                detail.MiddleName = request.MiddleName;
            }

            // Audit & update Suffix
            if (request.Suffix != null && request.Suffix != detail.Suffix)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Applicant Profile",
                    FieldName = "Suffix",
                    OldValue = detail.Suffix ?? string.Empty,
                    NewValue = request.Suffix,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                detail.Suffix = request.Suffix;
            }

            // Audit & update Contact Number
            if (request.ContactNumber != null && request.ContactNumber != detail.ContactNumber)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Applicant Profile",
                    FieldName = "ContactNumber",
                    OldValue = detail.ContactNumber ?? string.Empty,
                    NewValue = request.ContactNumber,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                detail.ContactNumber = request.ContactNumber;
            }

            // Audit & update Email Address
            if (request.Email != null && request.Email != detail.EmailAddress)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Applicant Profile",
                    FieldName = "EmailAddress",
                    OldValue = detail.EmailAddress ?? string.Empty,
                    NewValue = request.Email,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                detail.EmailAddress = request.Email;
            }

            // Audit & update Address
            if (request.Address != null && request.Address != detail.Address)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Applicant Profile",
                    FieldName = "Address",
                    OldValue = detail.Address ?? string.Empty,
                    NewValue = request.Address,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                detail.Address = request.Address;
            }

            // Audit & update Barangay, City, Province, Region
            if (request.Barangay != null)
            {
                var oldBrgy = detail.Barangay?.Name ?? string.Empty;
                if (request.Barangay != oldBrgy)
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Applicant Profile",
                        FieldName = "Barangay",
                        OldValue = oldBrgy,
                        NewValue = request.Barangay,
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                }
            }

            if (request.City != null)
            {
                var oldCity = detail.Barangay?.Municipality?.Name ?? string.Empty;
                if (request.City != oldCity)
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Applicant Profile",
                        FieldName = "City",
                        OldValue = oldCity,
                        NewValue = request.City,
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                }
            }

            if (request.Province != null)
            {
                var oldProv = detail.Barangay?.Municipality?.Province?.Name ?? string.Empty;
                if (request.Province != oldProv)
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Applicant Profile",
                        FieldName = "Province",
                        OldValue = oldProv,
                        NewValue = request.Province,
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                }
            }

            if (request.Region != null)
            {
                var oldReg = detail.Barangay?.Municipality?.Province?.Region?.Name ?? string.Empty;
                if (request.Region != oldReg)
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Applicant Profile",
                        FieldName = "Region",
                        OldValue = oldReg,
                        NewValue = request.Region,
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                }
            }

            // Audit & update Zip Code
            if (request.ZipCode != null && request.ZipCode != detail.ZipCode)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Applicant Profile",
                    FieldName = "ZipCode",
                    OldValue = detail.ZipCode ?? string.Empty,
                    NewValue = request.ZipCode,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                detail.ZipCode = request.ZipCode;
            }

            // Audit & update Date of Birth (Dob / BirthDate)
            if (request.Dob != null)
            {
                var oldDobStr = detail.BirthDate == default ? string.Empty : detail.BirthDate.ToString("yyyy-MM-dd");
                if (request.Dob != oldDobStr && DateOnly.TryParse(request.Dob, out var parsedDob))
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Applicant Profile",
                        FieldName = "BirthDate",
                        OldValue = oldDobStr,
                        NewValue = request.Dob,
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                    detail.BirthDate = parsedDob;
                }
            }

            // Audit & update Sex
            if (request.Sex != null && request.Sex != detail.Sex)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Applicant Profile",
                    FieldName = "Sex",
                    OldValue = detail.Sex ?? string.Empty,
                    NewValue = request.Sex,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                detail.Sex = request.Sex;
            }

            // Audit & update Civil Status
            if (request.CivilStatus != null)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Applicant Profile",
                    FieldName = "CivilStatus",
                    OldValue = string.Empty,
                    NewValue = request.CivilStatus,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
            }

            // Audit & update Nationality
            if (request.Nationality != null && request.Nationality != detail.Nationality)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Applicant Profile",
                    FieldName = "Nationality",
                    OldValue = detail.Nationality ?? string.Empty,
                    NewValue = request.Nationality,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                detail.Nationality = request.Nationality;
            }

            // Audit & update Education
            if (request.SchoolAttended != null && request.SchoolAttended != detail.SchoolAttended)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Applicant Profile",
                    FieldName = "SchoolAttended",
                    OldValue = detail.SchoolAttended ?? string.Empty,
                    NewValue = request.SchoolAttended,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                detail.SchoolAttended = request.SchoolAttended;
            }

            if (request.CourseTaken != null && request.CourseTaken != detail.CourseTaken)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Applicant Profile",
                    FieldName = "CourseTaken",
                    OldValue = detail.CourseTaken ?? string.Empty,
                    NewValue = request.CourseTaken,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                detail.CourseTaken = request.CourseTaken;
            }

            if (request.YearGraduated != null && request.YearGraduated != detail.YearGraduated)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Applicant Profile",
                    FieldName = "YearGraduated",
                    OldValue = detail.YearGraduated ?? string.Empty,
                    NewValue = request.YearGraduated,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                detail.YearGraduated = request.YearGraduated;
            }

            // Audit & update Applicant Type
            if (!string.IsNullOrEmpty(request.ApplicantType) && Enum.TryParse<EDGE.Domain.Enums.ApplicantType>(request.ApplicantType, true, out var parsedType))
            {
                if (applicant.ApplicantType != parsedType)
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Applicant Profile",
                        FieldName = "ApplicantType",
                        OldValue = applicant.ApplicantType.ToString(),
                        NewValue = parsedType.ToString(),
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                    applicant.ApplicantType = parsedType;
                }
            }

            // Audit & update Company Details if Company
            if (request.CompanyName != null || request.CompanyRegistrationNumber != null || request.CompanyAddress != null || request.CompanyContactNumber != null || request.CompanyEmail != null)
            {
                if (applicant.CompanyDetail == null)
                {
                    var newComp = new CompanyDetail { Id = Guid.NewGuid() };
                    await _applicationRepository.AddCompanyDetailAsync(newComp, cancellationToken);
                    applicant.CompanyDetail = newComp;
                    applicant.CompanyDetailId = newComp.Id;
                }
                var comp = applicant.CompanyDetail;

                if (request.CompanyName != null && request.CompanyName != comp.Name)
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Applicant Company Profile",
                        FieldName = "CompanyName",
                        OldValue = comp.Name ?? string.Empty,
                        NewValue = request.CompanyName,
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                    comp.Name = request.CompanyName;
                }

                if (request.CompanyRegistrationNumber != null && request.CompanyRegistrationNumber != comp.RegistrationNumber)
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Applicant Company Profile",
                        FieldName = "RegistrationNumber",
                        OldValue = comp.RegistrationNumber ?? string.Empty,
                        NewValue = request.CompanyRegistrationNumber,
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                    comp.RegistrationNumber = request.CompanyRegistrationNumber;
                }

                if (request.CompanyAddress != null && request.CompanyAddress != comp.Address)
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Applicant Company Profile",
                        FieldName = "CompanyAddress",
                        OldValue = comp.Address ?? string.Empty,
                        NewValue = request.CompanyAddress,
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                    comp.Address = request.CompanyAddress;
                }

                if (request.CompanyContactNumber != null && request.CompanyContactNumber != comp.ContactNumber)
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Applicant Company Profile",
                        FieldName = "CompanyContactNumber",
                        OldValue = comp.ContactNumber ?? string.Empty,
                        NewValue = request.CompanyContactNumber,
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                    comp.ContactNumber = request.CompanyContactNumber;
                }

                if (request.CompanyEmail != null && request.CompanyEmail != comp.Email)
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Applicant Company Profile",
                        FieldName = "CompanyEmail",
                        OldValue = comp.Email ?? string.Empty,
                        NewValue = request.CompanyEmail,
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                    comp.Email = request.CompanyEmail;
                }
            }

            // Synchronize any matching FormFieldValues on the applicant's FormSubmissions
            var submissions = (app.FormSubmissions ?? Enumerable.Empty<FormSubmission>())
                .Where(fs => fs.ApplicantId == applicant.Id || (app.ApplicationApplicants.Count == 1 && (fs.ApplicantId == Guid.Empty || fs.ApplicantId == app.Id)))
                .ToList();
            if (submissions.Count == 0 && app.ApplicationApplicants.Count == 1 && app.FormSubmissions != null)
            {
                submissions = app.FormSubmissions.ToList();
            }
            if (applicant.FormSubmission != null && !submissions.Contains(applicant.FormSubmission))
            {
                submissions.Add(applicant.FormSubmission);
            }

            var updatedFullName = string.Join(" ", new[] { detail.FirstName, detail.MiddleName, detail.LastName, detail.Suffix }
                .Where(part => !string.IsNullOrWhiteSpace(part))).Trim();

            foreach (var sub in submissions)
            {
                if (sub.FieldValues == null) continue;
                foreach (var fv in sub.FieldValues)
                {
                    var label = (!string.IsNullOrWhiteSpace(fv.Field?.Label) ? fv.Field.Label : fv.CustomLabel ?? string.Empty).Trim().ToLowerInvariant();
                    if (string.IsNullOrEmpty(label)) continue;

                    if (request.FirstName != null && (label == "first name" || label == "given name"))
                        fv.Value = request.FirstName;
                    else if (request.MiddleName != null && (label == "middle name" || label == "middle initial"))
                        fv.Value = request.MiddleName;
                    else if (request.LastName != null && (label == "last name" || label == "surname" || label == "family name"))
                        fv.Value = request.LastName;
                    else if (request.Suffix != null && (label.Contains("suffix") || label.Contains("extension")))
                        fv.Value = request.Suffix;
                    else if (!string.IsNullOrEmpty(updatedFullName) && (label.Contains("full name") || label.Contains("applicant name") || label.Contains("name of applicant")))
                        fv.Value = updatedFullName;
                    else if (request.Email != null && (label.Contains("email") || label.Contains("e-mail")) && !label.Contains("company"))
                        fv.Value = request.Email;
                    else if (request.ContactNumber != null && (label.Contains("contact") || label.Contains("mobile") || label.Contains("phone") || label.Contains("telephone")) && !label.Contains("company"))
                        fv.Value = request.ContactNumber;
                    else if (request.Address != null && (label == "address" || label.Contains("street") || label.Contains("house") || label.Contains("unit no")))
                        fv.Value = request.Address;
                    else if (request.Barangay != null && label.Contains("barangay"))
                        fv.Value = request.Barangay;
                    else if (request.City != null && (label.Contains("city") || label.Contains("municipality")))
                        fv.Value = request.City;
                    else if (request.Province != null && label.Contains("province"))
                        fv.Value = request.Province;
                    else if (request.Region != null && label.Contains("region"))
                        fv.Value = request.Region;
                    else if (request.ZipCode != null && (label.Contains("zip") || label.Contains("postal")))
                        fv.Value = request.ZipCode;
                    else if (request.Dob != null && (label.Contains("birth") || label == "dob"))
                        fv.Value = request.Dob;
                    else if (request.Sex != null && (label.Contains("sex") || label.Contains("gender")))
                        fv.Value = request.Sex;
                    else if (request.CivilStatus != null && (label.Contains("civil") || label.Contains("marital")))
                        fv.Value = request.CivilStatus;
                    else if (request.Nationality != null && (label.Contains("nationality") || label.Contains("citizenship")))
                        fv.Value = request.Nationality;
                }
            }

            await _applicationRepository.UpdateAsync(app, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(applicant.Id, "Applicant profile updated successfully by staff.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update applicant profile for ApplicationId {ApplicationId}, ApplicantId {ApplicantId}", request.ApplicationId, request.ApplicantId);
            try
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            }
            catch (Exception rollbackEx)
            {
                _logger.LogWarning(rollbackEx, "Transaction rollback failed during applicant profile update.");
            }
            return ApiResponse<Guid>.Fail("An unexpected error occurred while updating applicant profile details. Please try again or contact support.");
        }
    }
}
