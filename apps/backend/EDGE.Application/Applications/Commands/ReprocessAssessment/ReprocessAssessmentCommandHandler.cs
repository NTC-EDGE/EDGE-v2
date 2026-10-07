using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.ReprocessAssessment;

public class ReprocessAssessmentCommandHandler
    : IRequestHandler<ReprocessAssessmentCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ReprocessAssessmentCommandHandler> _logger;

    public ReprocessAssessmentCommandHandler(
        IApplicationFullRepository applicationRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ILogger<ReprocessAssessmentCommandHandler> logger)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<ApiResponse<Guid>> Handle(
        ReprocessAssessmentCommand request,
        CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID '{request.ApplicationId}' was not found.");
        }

        var currentUserIdStr = _currentUserService.UserId;
        Guid? actingUserId = null;
        if (!string.IsNullOrEmpty(currentUserIdStr))
        {
            if (Guid.TryParse(currentUserIdStr, out var parsed))
            {
                actingUserId = parsed;
            }
            else
            {
                actingUserId = CreateGuidFromString(currentUserIdStr);
            }
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            var previousStatus = app.Status;
            app.AssessmentVersion += 1;
            app.AssessmentRemarks = request.Remarks;
            app.Status = ApplicationStatus.Evaluating;

            await _applicationRepository.UpdateAsync(app, cancellationToken);

            var historyRemarks = !string.IsNullOrWhiteSpace(request.Remarks)
                ? $"Re-assessment requested (Cycle #{app.AssessmentVersion}): {request.Remarks}"
                : $"Re-assessment requested by applicant (Cycle #{app.AssessmentVersion})";

            var history = new ApplicationHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                Action = "Re-assessment Requested",
                FromStatus = previousStatus,
                ToStatus = ApplicationStatus.Evaluating,
                PerformedByUserId = actingUserId,
                StaffName = _currentUserService.Email ?? "Applicant",
                StaffRole = "Applicant",
                Remarks = historyRemarks,
                Timestamp = DateTime.UtcNow
            };

            await _applicationRepository.AddApplicationHistoryAsync(history, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(
                app.Id,
                "Re-assessment request submitted successfully.");
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            _logger.LogError(ex, "Failed to request re-assessment for application '{ApplicationId}'.", request.ApplicationId);
            return ApiResponse<Guid>.Fail($"Failed to request re-assessment: {ex.Message}");
        }
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
