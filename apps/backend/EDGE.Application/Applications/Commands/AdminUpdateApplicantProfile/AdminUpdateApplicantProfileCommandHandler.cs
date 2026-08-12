using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.AdminUpdateApplicantProfile;

public class AdminUpdateApplicantProfileCommandHandler : IRequestHandler<AdminUpdateApplicantProfileCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public AdminUpdateApplicantProfileCommandHandler(
        IApplicationFullRepository applicationRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(AdminUpdateApplicantProfileCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID {request.ApplicationId} was not found.");
        }

        var appApplicant = app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == request.ApplicantId);
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
        }

        var staffName = _currentUserService.UserId ?? "NTC Agency Staff";

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            // Audit & update First Name
            if (!string.IsNullOrEmpty(request.FirstName) && request.FirstName != detail.FirstName)
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
            if (!string.IsNullOrEmpty(request.LastName) && request.LastName != detail.LastName)
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

            // Audit & update Contact Number
            if (!string.IsNullOrEmpty(request.ContactNumber) && request.ContactNumber != detail.ContactNumber)
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
            if (!string.IsNullOrEmpty(request.Email) && request.Email != detail.EmailAddress)
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
            if (!string.IsNullOrEmpty(request.CompanyName))
            {
                if (applicant.CompanyDetail == null)
                {
                    var newComp = new CompanyDetail { Id = Guid.NewGuid() };
                    await _applicationRepository.AddCompanyDetailAsync(newComp, cancellationToken);
                    applicant.CompanyDetail = newComp;
                    applicant.CompanyDetailId = newComp.Id;
                }
                var comp = applicant.CompanyDetail;

                if (request.CompanyName != comp.Name)
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

                if (!string.IsNullOrEmpty(request.CompanyRegistrationNumber) && request.CompanyRegistrationNumber != comp.RegistrationNumber)
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

                if (!string.IsNullOrEmpty(request.CompanyAddress) && request.CompanyAddress != comp.Address)
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

                if (!string.IsNullOrEmpty(request.CompanyContactNumber) && request.CompanyContactNumber != comp.ContactNumber)
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

                if (!string.IsNullOrEmpty(request.CompanyEmail) && request.CompanyEmail != comp.Email)
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

            await _applicationRepository.UpdateAsync(app, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(applicant.Id, "Applicant profile updated successfully by staff.");
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return ApiResponse<Guid>.Fail($"Failed to update applicant profile. Error: {ex.Message}");
        }
    }
}
