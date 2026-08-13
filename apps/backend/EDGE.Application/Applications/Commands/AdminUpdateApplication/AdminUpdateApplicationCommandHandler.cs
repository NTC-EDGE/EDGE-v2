using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.AdminUpdateApplication;

public class AdminUpdateApplicationCommandHandler : IRequestHandler<AdminUpdateApplicationCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AdminUpdateApplicationCommandHandler> _logger;

    public AdminUpdateApplicationCommandHandler(
        IApplicationFullRepository applicationRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork,
        ILogger<AdminUpdateApplicationCommandHandler> logger)
    {
        _applicationRepository = applicationRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ApiResponse<Guid>> Handle(AdminUpdateApplicationCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID {request.Id} was not found.");
        }

        var staffName = _currentUserService.UserId ?? "NTC Agency Staff";

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            // Audit & update ReferenceNumber
            if (!string.IsNullOrEmpty(request.ReferenceNumber) && request.ReferenceNumber != app.ReferenceNumber)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Application Header",
                    FieldName = "ReferenceNumber",
                    OldValue = app.ReferenceNumber ?? string.Empty,
                    NewValue = request.ReferenceNumber,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                app.ReferenceNumber = request.ReferenceNumber;
            }

            // Audit & update ApplicationNumber (Permit Number)
            if (!string.IsNullOrEmpty(request.PermitNumber) && request.PermitNumber != app.ApplicationNumber)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Application Header",
                    FieldName = "ApplicationNumber",
                    OldValue = app.ApplicationNumber ?? string.Empty,
                    NewValue = request.PermitNumber,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                app.ApplicationNumber = request.PermitNumber;
            }

            // Audit & update Remarks / Note
            if (request.Note != null && request.Note != app.Remarks)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Application Header",
                    FieldName = "Remarks",
                    OldValue = app.Remarks ?? string.Empty,
                    NewValue = request.Note,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                app.Remarks = request.Note;
            }

            // Audit & update Office
            if (request.Office != null && request.Office != app.Office)
            {
                await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                {
                    ApplicationId = app.Id,
                    Category = "Application Header",
                    FieldName = "Office",
                    OldValue = app.Office ?? string.Empty,
                    NewValue = request.Office,
                    CorrectedByStaff = staffName,
                    CorrectedAt = DateTime.UtcNow
                }, cancellationToken);
                app.Office = request.Office;
            }

            // Find primary applicant on the application (if any)
            var primaryAppApplicant = app.ApplicationApplicants.FirstOrDefault();
            var primaryApplicant = primaryAppApplicant?.Applicant;

            // Process ContactDetails, BasicInfo, Address on Primary Applicant's ApplicantDetail
            if (primaryApplicant != null && (request.ContactDetails != null || request.BasicInfo != null || request.Address != null))
            {
                if (primaryApplicant.ApplicantDetail == null)
                {
                    primaryApplicant.ApplicantDetail = new ApplicantDetail { Id = Guid.NewGuid() };
                }
                var detail = primaryApplicant.ApplicantDetail;

                if (request.ContactDetails != null)
                {
                    if (request.ContactDetails.Email != null && request.ContactDetails.Email != detail.EmailAddress)
                    {
                        await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                        {
                            ApplicationId = app.Id,
                            Category = "Contact Details",
                            FieldName = "EmailAddress",
                            OldValue = detail.EmailAddress ?? string.Empty,
                            NewValue = request.ContactDetails.Email,
                            CorrectedByStaff = staffName,
                            CorrectedAt = DateTime.UtcNow
                        }, cancellationToken);
                        detail.EmailAddress = request.ContactDetails.Email;
                    }

                    if (request.ContactDetails.ContactNumber != null && request.ContactDetails.ContactNumber != detail.ContactNumber)
                    {
                        await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                        {
                            ApplicationId = app.Id,
                            Category = "Contact Details",
                            FieldName = "ContactNumber",
                            OldValue = detail.ContactNumber ?? string.Empty,
                            NewValue = request.ContactDetails.ContactNumber,
                            CorrectedByStaff = staffName,
                            CorrectedAt = DateTime.UtcNow
                        }, cancellationToken);
                        detail.ContactNumber = request.ContactDetails.ContactNumber;
                    }
                }

                if (request.BasicInfo != null)
                {
                    if (request.BasicInfo.FirstName != null && request.BasicInfo.FirstName != detail.FirstName)
                    {
                        await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                        {
                            ApplicationId = app.Id,
                            Category = "Basic Info",
                            FieldName = "FirstName",
                            OldValue = detail.FirstName ?? string.Empty,
                            NewValue = request.BasicInfo.FirstName,
                            CorrectedByStaff = staffName,
                            CorrectedAt = DateTime.UtcNow
                        }, cancellationToken);
                        detail.FirstName = request.BasicInfo.FirstName;
                    }

                    if (request.BasicInfo.LastName != null && request.BasicInfo.LastName != detail.LastName)
                    {
                        await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                        {
                            ApplicationId = app.Id,
                            Category = "Basic Info",
                            FieldName = "LastName",
                            OldValue = detail.LastName ?? string.Empty,
                            NewValue = request.BasicInfo.LastName,
                            CorrectedByStaff = staffName,
                            CorrectedAt = DateTime.UtcNow
                        }, cancellationToken);
                        detail.LastName = request.BasicInfo.LastName;
                    }

                    if (request.BasicInfo.MiddleName != null && request.BasicInfo.MiddleName != detail.MiddleName)
                    {
                        await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                        {
                            ApplicationId = app.Id,
                            Category = "Basic Info",
                            FieldName = "MiddleName",
                            OldValue = detail.MiddleName ?? string.Empty,
                            NewValue = request.BasicInfo.MiddleName,
                            CorrectedByStaff = staffName,
                            CorrectedAt = DateTime.UtcNow
                        }, cancellationToken);
                        detail.MiddleName = request.BasicInfo.MiddleName;
                    }
                }

                if (request.Address != null)
                {
                    if (request.Address.ZipCode != null && request.Address.ZipCode != detail.ZipCode)
                    {
                        await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                        {
                            ApplicationId = app.Id,
                            Category = "Address Details",
                            FieldName = "ZipCode",
                            OldValue = detail.ZipCode ?? string.Empty,
                            NewValue = request.Address.ZipCode,
                            CorrectedByStaff = staffName,
                            CorrectedAt = DateTime.UtcNow
                        }, cancellationToken);
                        detail.ZipCode = request.Address.ZipCode;
                    }
                }
            }

            // Process CompanyDetails on Primary Applicant's CompanyDetail
            if (primaryApplicant != null && request.CompanyDetails != null)
            {
                if (primaryApplicant.CompanyDetail == null)
                {
                    var newComp = new CompanyDetail { Id = Guid.NewGuid() };
                    await _applicationRepository.AddCompanyDetailAsync(newComp, cancellationToken);
                    primaryApplicant.CompanyDetail = newComp;
                    primaryApplicant.CompanyDetailId = newComp.Id;
                }
                var comp = primaryApplicant.CompanyDetail;

                if (request.CompanyDetails.Name != null && request.CompanyDetails.Name != comp.Name)
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Company Details",
                        FieldName = "Name",
                        OldValue = comp.Name ?? string.Empty,
                        NewValue = request.CompanyDetails.Name,
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                    comp.Name = request.CompanyDetails.Name;
                }

                if (request.CompanyDetails.RegistrationNumber != null && request.CompanyDetails.RegistrationNumber != comp.RegistrationNumber)
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Company Details",
                        FieldName = "RegistrationNumber",
                        OldValue = comp.RegistrationNumber ?? string.Empty,
                        NewValue = request.CompanyDetails.RegistrationNumber,
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                    comp.RegistrationNumber = request.CompanyDetails.RegistrationNumber;
                }

                if (request.CompanyDetails.Address != null && request.CompanyDetails.Address != comp.Address)
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Company Details",
                        FieldName = "Address",
                        OldValue = comp.Address ?? string.Empty,
                        NewValue = request.CompanyDetails.Address,
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                    comp.Address = request.CompanyDetails.Address;
                }

                if (request.CompanyDetails.ContactNumber != null && request.CompanyDetails.ContactNumber != comp.ContactNumber)
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Company Details",
                        FieldName = "ContactNumber",
                        OldValue = comp.ContactNumber ?? string.Empty,
                        NewValue = request.CompanyDetails.ContactNumber,
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                    comp.ContactNumber = request.CompanyDetails.ContactNumber;
                }

                if (request.CompanyDetails.Email != null && request.CompanyDetails.Email != comp.Email)
                {
                    await _applicationRepository.AddCorrectionAuditTrailAsync(new CorrectionAuditTrail
                    {
                        ApplicationId = app.Id,
                        Category = "Company Details",
                        FieldName = "Email",
                        OldValue = comp.Email ?? string.Empty,
                        NewValue = request.CompanyDetails.Email,
                        CorrectedByStaff = staffName,
                        CorrectedAt = DateTime.UtcNow
                    }, cancellationToken);
                    comp.Email = request.CompanyDetails.Email;
                }
            }

            await _applicationRepository.UpdateAsync(app, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(app.Id, "Application administrative correction updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to record administrative correction for ApplicationId {ApplicationId}", request.Id);
            try
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            }
            catch (Exception rollbackEx)
            {
                _logger.LogWarning(rollbackEx, "Transaction rollback failed during application administrative correction.");
            }
            return ApiResponse<Guid>.Fail("An unexpected error occurred while recording application corrections. Please try again or contact support.");
        }
    }
}
