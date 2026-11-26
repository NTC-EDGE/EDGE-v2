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
    private readonly INumberingSeriesService? _numberingSeriesService;
    private readonly IApplicationEmailNotificationService? _emailNotificationService;
    private readonly ISystemConfigRepository? _systemConfigRepository;

    public UpdateApplicationStatusCommandHandler(
        IApplicationFullRepository applicationRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ILogger<UpdateApplicationStatusCommandHandler> logger,
        INumberingSeriesService? numberingSeriesService = null,
        IApplicationEmailNotificationService? emailNotificationService = null,
        ISystemConfigRepository? systemConfigRepository = null)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _logger = logger;
        _numberingSeriesService = numberingSeriesService;
        _emailNotificationService = emailNotificationService;
        _systemConfigRepository = systemConfigRepository;
    }

    public async Task<ApiResponse<Guid>> Handle(UpdateApplicationStatusCommand request, CancellationToken cancellationToken)
    {
        if (_systemConfigRepository != null)
        {
            var maintCfg = await _systemConfigRepository.GetByKeyAsync("MAINTENANCE_MODE", cancellationToken);
            var internalMaintCfg = await _systemConfigRepository.GetByKeyAsync("INTERNAL_MAINTENANCE_MODE", cancellationToken);
            if ((maintCfg != null && string.Equals(maintCfg.Value?.Trim(), "true", StringComparison.OrdinalIgnoreCase)) ||
                (internalMaintCfg != null && string.Equals(internalMaintCfg.Value?.Trim(), "true", StringComparison.OrdinalIgnoreCase)))
            {
                return ApiResponse<Guid>.Fail(
                    "Internal Officer Portal is currently under scheduled maintenance. Officer evaluation actions and account interactions are temporarily disabled.");
            }
        }

        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken)
                  ?? await _applicationRepository.GetByIdAsync(request.Id, cancellationToken);
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

        bool isAssessmentCompletion = app.Intent == ApplicationIntent.AssessmentOnly &&
            (newStatus == ApplicationStatus.ForAccountant || newStatus == ApplicationStatus.Completed || newStatus == ApplicationStatus.Approved);

        if (isAssessmentCompletion)
        {
            newStatus = ApplicationStatus.Completed;
            app.AssessedAt = DateTime.UtcNow;
        }
        else if (newStatus == ApplicationStatus.ForIssuance &&
                 app.OrdersOfPayment != null &&
                 app.OrdersOfPayment.Any(o => o.Status == OpStatus.Billed || o.Status == OpStatus.Processing))
        {
            // Prevent premature transition to ForIssuance when a bulk application still has unpaid Orders of Payment
            newStatus = ApplicationStatus.PendingPayment;
        }

        app.Status = newStatus;
        if (!string.IsNullOrWhiteSpace(request.Remarks))
        {
            app.Remarks = request.Remarks;
        }
        else if (isAssessmentCompletion)
        {
            app.Remarks = "Pre-Assessment completed by Evaluator. Statement of Account released to Applicant.";
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
                : (isAssessmentCompletion ? "Evaluating Officer" :
                   newStatus == ApplicationStatus.Evaluating ? "Evaluating Officer" :
                   newStatus == ApplicationStatus.ForAccountant ? "Evaluating Officer" :
                   newStatus == ApplicationStatus.PendingPayment ? "Accountant" :
                   newStatus == ApplicationStatus.Completed ? "Cashier" :
                   newStatus == ApplicationStatus.Returned ? "Return Officer" : "NTC Engineer");

            if (isAssessmentCompletion && (string.IsNullOrWhiteSpace(request.Action) || request.Action.Contains("Accountant")))
            {
                actionTitle = "Assessment Approved & SOA Released to Client";
            }

            // When Evaluator approves Assessment application:
            // Complete application and release SOA directly to client (no Order of Payment or Accountant review needed)
            if (isAssessmentCompletion)
            {
                var latestSoa = app.StatementsOfAccount?.OrderByDescending(s => s.CreatedAt).FirstOrDefault();
                if (latestSoa != null)
                {
                    var prevSoaStatus = latestSoa.Status;
                    latestSoa.Status = SoaStatus.Approved;
                    latestSoa.ApprovedByUserId = actingUserId;
                    latestSoa.ApprovedAt = DateTime.UtcNow;

                    await _applicationRepository.AddSoaHistoryAsync(new SoaHistory
                    {
                        Id = Guid.NewGuid(),
                        StatementOfAccountId = latestSoa.Id,
                        Action = "Assessment approved by Evaluator. Statement of Account released to Client.",
                        FromStatus = prevSoaStatus,
                        ToStatus = SoaStatus.Approved,
                        PerformedByUserId = actingUserId,
                        StaffName = staffName,
                        StaffRole = staffRole,
                        Remarks = request.Remarks ?? "Assessment SOA approved and released to Client",
                        Timestamp = DateTime.UtcNow
                    }, cancellationToken);
                }

                // If any dangling Orders of Payment exist from prior transitions (e.g. if the application transitioned back from an accountant or prior cycle),
                // withdraw them to prevent active billing in cashier queues
                if (app.OrdersOfPayment != null)
                {
                    foreach (var op in app.OrdersOfPayment.Where(o => o.Status == OpStatus.Billed || o.Status == OpStatus.Processing))
                    {
                        var prevOpStatus = op.Status;
                        op.Status = OpStatus.Returned;
                        op.Remarks = "Withdrawn: Completed as Pre-Assessment without Order of Payment.";
                        await _applicationRepository.AddOpHistoryAsync(new OpHistory
                        {
                            Id = Guid.NewGuid(),
                            OrderOfPaymentId = op.Id,
                            Action = "Order of Payment withdrawn. Assessment released directly without payment.",
                            FromStatus = prevOpStatus,
                            ToStatus = OpStatus.Returned,
                            PerformedByUserId = actingUserId,
                            StaffName = staffName,
                            StaffRole = staffRole,
                            Remarks = op.Remarks,
                            Timestamp = DateTime.UtcNow
                        }, cancellationToken);
                    }
                }
            }
            // When Evaluator approves official application:
            // SOA status changes to FOR Order of Payment.
            // Note: Order of Payment (OP) series number is NOT generated here — it is generated ONLY after Accountant approval
            // so that OP series numbers follow the chronological order of Accountant approvals independently of SOA series numbers.
            else if (newStatus == ApplicationStatus.ForAccountant)
            {
                var activeSoas = app.StatementsOfAccount?
                    .Where(s => !s.IsDeleted)
                    .OrderBy(s => s.CreatedAt)
                    .ToList() ?? new System.Collections.Generic.List<StatementOfAccount>();

                foreach (var targetSoa in activeSoas)
                {
                    var prevSoaStatus = targetSoa.Status;
                    targetSoa.Status = SoaStatus.ForOrderOfPayment;

                    await _applicationRepository.AddSoaHistoryAsync(new SoaHistory
                    {
                        Id = Guid.NewGuid(),
                        StatementOfAccountId = targetSoa.Id,
                        Action = "Assessment approved by Evaluator. SOA endorsed FOR Order of Payment.",
                        FromStatus = prevSoaStatus,
                        ToStatus = SoaStatus.ForOrderOfPayment,
                        PerformedByUserId = actingUserId,
                        StaffName = staffName,
                        StaffRole = staffRole,
                        Remarks = request.Remarks ?? "Endorsed for Order of Payment review",
                        Timestamp = DateTime.UtcNow
                    }, cancellationToken);

                    // Only update an existing OP if one already exists from a prior Accountant return cycle.
                    // Do NOT create a new OP or allocate an OpNumber before Accountant approval.
                    var existingOp = app.OrdersOfPayment?.FirstOrDefault(o => o.StatementOfAccountId == targetSoa.Id)
                                     ?? (activeSoas.Count == 1
                                         ? app.OrdersOfPayment?.OrderByDescending(o => o.CreatedAt).FirstOrDefault(o => o.Status == OpStatus.Billed || o.Status == OpStatus.Processing || o.Status == OpStatus.Returned)
                                         : null);

                    if (existingOp != null)
                    {
                        var prevOpStatus = existingOp.Status;
                        existingOp.Status = OpStatus.Billed;
                        existingOp.AmountDue = targetSoa.TotalAmount;
                        existingOp.AmountReceived = 0;
                        existingOp.PaymentMethod = null;
                        existingOp.CheckNumber = null;
                        existingOp.CheckBank = null;
                        existingOp.CheckDate = null;
                        existingOp.PaidAt = null;
                        existingOp.OfficialReceiptNumber = null;
                        existingOp.Remarks = request.Remarks;

                        await _applicationRepository.AddOpHistoryAsync(new OpHistory
                        {
                            Id = Guid.NewGuid(),
                            OrderOfPaymentId = existingOp.Id,
                            Action = "Order of Payment re-submitted for Accountant review.",
                            FromStatus = prevOpStatus,
                            ToStatus = OpStatus.Billed,
                            PerformedByUserId = actingUserId,
                            StaffName = staffName,
                            StaffRole = staffRole,
                            Remarks = request.Remarks ?? "Re-submitted for Order of Payment review",
                            Timestamp = DateTime.UtcNow
                        }, cancellationToken);
                    }
                }
            }
            else if (newStatus == ApplicationStatus.PendingPayment)
            {
                var activeSoas = app.StatementsOfAccount?
                    .Where(s => !s.IsDeleted && s.Status != SoaStatus.Returned)
                    .OrderBy(s => s.CreatedAt)
                    .ToList() ?? new System.Collections.Generic.List<StatementOfAccount>();

                foreach (var targetSoa in activeSoas)
                {
                    if (targetSoa.Status != SoaStatus.Approved)
                    {
                        var prevSoaStatus = targetSoa.Status;
                        targetSoa.Status = SoaStatus.Approved;
                        targetSoa.ApprovedByUserId = actingUserId;
                        targetSoa.ApprovedAt = DateTime.UtcNow;

                        await _applicationRepository.AddSoaHistoryAsync(new SoaHistory
                        {
                            Id = Guid.NewGuid(),
                            StatementOfAccountId = targetSoa.Id,
                            Action = "SOA approved for payment.",
                            FromStatus = prevSoaStatus,
                            ToStatus = SoaStatus.Approved,
                            PerformedByUserId = actingUserId,
                            StaffName = staffName,
                            StaffRole = staffRole,
                            Remarks = request.Remarks ?? "SOA approved and ready for payment",
                            Timestamp = DateTime.UtcNow
                        }, cancellationToken);
                    }

                    var existingOp = app.OrdersOfPayment?.FirstOrDefault(o => o.StatementOfAccountId == targetSoa.Id && o.Status != OpStatus.Returned);
                    if (existingOp == null)
                    {
                        var opNumber = _numberingSeriesService != null
                            ? await _numberingSeriesService.GenerateOpNumberAsync(app.TenantId, cancellationToken)
                            : $"OP-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

                        var newOp = new OrderOfPayment
                        {
                            Id = Guid.NewGuid(),
                            ApplicationId = app.Id,
                            StatementOfAccountId = targetSoa.Id,
                            OpNumber = opNumber,
                            AmountDue = targetSoa.TotalAmount,
                            AmountReceived = 0m,
                            Status = OpStatus.Billed,
                            Remarks = request.Remarks ?? "Order of Payment issued. Ready for client payment.",
                            CreatedAt = DateTime.UtcNow
                        };
                        await _applicationRepository.AddOpAsync(newOp, cancellationToken);

                        await _applicationRepository.AddOpHistoryAsync(new OpHistory
                        {
                            Id = Guid.NewGuid(),
                            OrderOfPaymentId = newOp.Id,
                            Action = "Order of Payment issued.",
                            ToStatus = OpStatus.Billed,
                            PerformedByUserId = actingUserId,
                            StaffName = staffName,
                            StaffRole = staffRole,
                            Timestamp = DateTime.UtcNow
                        }, cancellationToken);
                    }
                }
            }

            await _applicationRepository.AddApplicationHistoryAsync(new ApplicationHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                Action = actionTitle,
                ToStatus = newStatus,
                PerformedByUserId = actingUserId,
                StaffName = staffName,
                StaffRole = staffRole,
                Remarks = request.Remarks,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            if (_emailNotificationService != null)
            {
                if (newStatus == ApplicationStatus.Returned)
                {
                    await _emailNotificationService.SendApplicationReturnedForComplianceAsync(app.Id, request.Remarks, cancellationToken);
                }
                else if (newStatus == ApplicationStatus.ForAccountant || isAssessmentCompletion)
                {
                    await _emailNotificationService.SendApplicationUnderAccountingReviewAsync(app.Id, cancellationToken);
                }
                else if (newStatus == ApplicationStatus.PendingPayment)
                {
                    await _emailNotificationService.SendApplicationReadyForPaymentAsync(app.Id, null, cancellationToken);
                }
                else if (newStatus == ApplicationStatus.Completed && !isAssessmentCompletion)
                {
                    await _emailNotificationService.SendApplicationCompletedAsync(app.Id, null, cancellationToken);
                }
            }

            return ApiResponse<Guid>.Success(app.Id, $"Application status updated to '{newStatus}' successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update application status for ApplicationId '{ApplicationId}' to '{Status}'.", request.Id, request.Status);
            try
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            }
            catch (Exception rollbackEx)
            {
                _logger.LogWarning(rollbackEx, "Transaction rollback failed during application status update for ApplicationId '{ApplicationId}'.", request.Id);
            }
            return ApiResponse<Guid>.Fail("An unexpected error occurred while updating the application status. Please try again later.");
        }
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
