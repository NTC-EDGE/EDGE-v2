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
            if (!string.IsNullOrEmpty(request.Office) && request.Office != app.Office)
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
