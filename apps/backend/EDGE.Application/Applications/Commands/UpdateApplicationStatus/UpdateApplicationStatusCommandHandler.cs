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

using Microsoft.Extensions.Logging;

namespace EDGE.Application.Applications.Commands.UpdateApplicationStatus;

public class UpdateApplicationStatusCommandHandler : IRequestHandler<UpdateApplicationStatusCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UpdateApplicationStatusCommandHandler> _logger;

    public UpdateApplicationStatusCommandHandler(
        IApplicationFullRepository applicationRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ILogger<UpdateApplicationStatusCommandHandler> logger)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<ApiResponse<Guid>> Handle(UpdateApplicationStatusCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdAsync(request.Id, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID '{request.Id}' was not found.");
        }

        if (!Enum.TryParse<ApplicationStatus>(request.Status, true, out var newStatus))
        {
            return ApiResponse<Guid>.Fail($"Invalid application status '{request.Status}'.");
        }

        var currentUserIdStr = _currentUserService.UserId;
        Guid? actingUserId = null;
        if (!string.IsNullOrEmpty(currentUserIdStr))
        {
            var parsed = Guid.TryParse(currentUserIdStr, out var g) ? g : CreateGuidFromString(currentUserIdStr);
            if (await _applicationRepository.UserExistsAsync(parsed, cancellationToken))
            {
                actingUserId = parsed;
            }
            else
            {
                _logger.LogWarning("Acting user ID '{UserIdRaw}' (parsed as '{ParsedUserId}') was provided in current context but could not be found in user database. History entry logged without user association.", currentUserIdStr, parsed);
            }
        }

        app.Status = newStatus;
        if (!string.IsNullOrWhiteSpace(request.Remarks))
        {
            app.Remarks = request.Remarks;
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            await _applicationRepository.UpdateAsync(app, cancellationToken);

            var statusHistory = new ApplicationStatusHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                Status = newStatus,
                Remarks = request.Remarks ?? $"Status updated to {newStatus}",
                Timestamp = DateTime.UtcNow,
                UserId = actingUserId
            };
            await _applicationRepository.AddApplicationStatusHistoryAsync(statusHistory, cancellationToken);

            var actionTitle = !string.IsNullOrWhiteSpace(request.Action)
                ? request.Action
                : $"Status updated to {newStatus}";

            var staffName = !string.IsNullOrWhiteSpace(request.StaffName)
                ? request.StaffName
                : (_currentUserService.Email ?? currentUserIdStr ?? "Authorized Officer");

            var staffRole = !string.IsNullOrWhiteSpace(request.StaffRole)
                ? request.StaffRole
                : (newStatus == ApplicationStatus.Evaluating ? "Evaluating Officer" :
                   newStatus == ApplicationStatus.ForAccountant ? "Evaluating Officer" :
                   newStatus == ApplicationStatus.PendingPayment ? "Accountant" :
                   newStatus == ApplicationStatus.Completed ? "Cashier" :
                   newStatus == ApplicationStatus.Returned ? "Return Officer" : "NTC Engineer");

            await _applicationRepository.AddApplicationHistoryAsync(new ApplicationHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                Action = actionTitle,
                ToStatus = newStatus,
                PerformedByUserId = actingUserId ?? Guid.Empty,
                StaffName = staffName,
                StaffRole = staffRole,
                Remarks = request.Remarks,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(app.Id, $"Application status updated to '{newStatus}' successfully.");
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return ApiResponse<Guid>.Fail($"Failed to update application status. Error: {ex.Message}");
        }
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
