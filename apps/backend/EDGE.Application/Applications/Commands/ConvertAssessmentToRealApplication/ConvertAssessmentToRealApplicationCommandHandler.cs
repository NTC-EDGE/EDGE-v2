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

namespace EDGE.Application.Applications.Commands.ConvertAssessmentToRealApplication;

public class ConvertAssessmentToRealApplicationCommandHandler
    : IRequestHandler<ConvertAssessmentToRealApplicationCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ConvertAssessmentToRealApplicationCommandHandler> _logger;

    public ConvertAssessmentToRealApplicationCommandHandler(
        IApplicationFullRepository applicationRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ILogger<ConvertAssessmentToRealApplicationCommandHandler> logger)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<ApiResponse<Guid>> Handle(
        ConvertAssessmentToRealApplicationCommand request,
        CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID '{request.ApplicationId}' was not found.");
        }

        if (app.Intent == ApplicationIntent.Regular)
        {
            return ApiResponse<Guid>.Fail("This application is already filed as an official/real application.");
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
            app.Intent = ApplicationIntent.Regular;
            app.ConvertedToRegularAt = DateTime.UtcNow;

            if (string.IsNullOrWhiteSpace(app.ApplicationNumber))
            {
                app.ApplicationNumber = $"APP-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
            }

            // If SOA was already generated, advance to accountant / pending payment, otherwise keep current status
            if (app.StatementsOfAccount.Any(s => s.Status == SoaStatus.Approved))
            {
                app.Status = ApplicationStatus.PendingPayment;
            }
            else if (app.StatementsOfAccount.Any(s => s.Status == SoaStatus.Pending))
            {
                app.Status = ApplicationStatus.ForAccountant;
            }

            await _applicationRepository.UpdateAsync(app, cancellationToken);

            var historyRemarks = !string.IsNullOrWhiteSpace(request.Remarks)
                ? request.Remarks
                : "Application converted from Pre-Assessment to Official Application by Client";

            var history = new ApplicationHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                Action = "Converted to Real Application",
                FromStatus = previousStatus,
                ToStatus = app.Status,
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
                "Application successfully submitted as an official application.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to convert assessment application '{ApplicationId}' to real application.", request.ApplicationId);
            try
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            }
            catch (Exception rollbackEx)
            {
                _logger.LogWarning(rollbackEx, "Transaction rollback failed during application conversion for ApplicationId '{ApplicationId}'.", request.ApplicationId);
            }
            return ApiResponse<Guid>.Fail("An unexpected error occurred while converting the application. Please try again later.");
        }
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
