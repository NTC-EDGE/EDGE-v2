using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.FinalizeApplicationSubmission;

public class FinalizeApplicationSubmissionCommandHandler : IRequestHandler<FinalizeApplicationSubmissionCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IRequirementRepository _requirementRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ITenantContextService _tenantContextService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserAuthorizationService _userAuthorizationService;
    private readonly ILogger<FinalizeApplicationSubmissionCommandHandler> _logger;
    private readonly ITenantRepository? _tenantRepository;
    private readonly IApplicationEmailNotificationService? _emailNotificationService;

    public FinalizeApplicationSubmissionCommandHandler(
        IApplicationFullRepository applicationRepository,
        IRequirementRepository requirementRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        ITenantContextService tenantContextService,
        IUnitOfWork unitOfWork,
        IUserAuthorizationService userAuthorizationService,
        ILogger<FinalizeApplicationSubmissionCommandHandler> logger,
        ITenantRepository? tenantRepository = null,
        IApplicationEmailNotificationService? emailNotificationService = null)
    {
        _applicationRepository = applicationRepository;
        _requirementRepository = requirementRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _tenantContextService = tenantContextService;
        _unitOfWork = unitOfWork;
        _userAuthorizationService = userAuthorizationService;
        _logger = logger;
        _tenantRepository = tenantRepository;
        _emailNotificationService = emailNotificationService;
    }

    public async Task<ApiResponse<Guid>> Handle(FinalizeApplicationSubmissionCommand request, CancellationToken cancellationToken)
    {
        if (!await _userAuthorizationService.CanSubmitApplicationAsync(cancellationToken))
        {
            return ApiResponse<Guid>.Fail(
                "403 Forbidden: Your internal staff account does not have permission to submit service applications. Please request application submission access from your administrator.");
        }

        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID {request.Id} was not found.");
        }

        if (app.Status != ApplicationStatus.Draft && app.Status != ApplicationStatus.Returned)
        {
            return ApiResponse<Guid>.Fail("Application has already been submitted or is not in Draft state.");
        }

        if (_tenantRepository != null && app.TenantId != Guid.Empty)
        {
            var targetTenant = await _tenantRepository.GetByIdAsync(app.TenantId, cancellationToken);
            if (targetTenant != null && (!targetTenant.IsActive || targetTenant.IsDeleted))
            {
                return ApiResponse<Guid>.Fail(
                    $"Validation Error: The selected Regional Office '{targetTenant.Name}' is currently inactive and cannot accept application submissions.");
            }
        }

        // Verify authorization: caller must be an active tenant member, superadmin, or the creator/applicant
        var isMember = await _tenantContextService.IsUserActiveMemberAsync(app.TenantId, cancellationToken);
        var isSuperAdmin = await _tenantContextService.IsCurrentUserSuperAdminAsync(cancellationToken);
        var currentUserIdStr = _currentUserService.UserId;
        var isOwner = false;

        if (!string.IsNullOrWhiteSpace(currentUserIdStr))
        {
            if (string.Equals(app.CreatedBy, currentUserIdStr, StringComparison.OrdinalIgnoreCase))
            {
                isOwner = true;
            }
            else if (Guid.TryParse(currentUserIdStr, out var parsedGuid) && app.UserId.HasValue && app.UserId.Value == parsedGuid)
            {
                isOwner = true;
            }
            else
            {
                var dbUser = await _userRepository.GetByAuthUserIdAsync(currentUserIdStr, cancellationToken)
                             ?? await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken);
                if (dbUser != null && app.UserId.HasValue && app.UserId.Value == dbUser.Id)
                {
                    isOwner = true;
                }
                else if ((app.Status == ApplicationStatus.Draft || app.Status == ApplicationStatus.Returned) && !app.UserId.HasValue)
                {
                    isOwner = true;
                }
            }
        }

        if (!isMember && !isSuperAdmin && !isOwner)
        {
            return ApiResponse<Guid>.Fail(
                "You do not have permission to finalize this application.");
        }

        // 1. Strict Validation: Verify mandatory fields on linked applicants
        var orderedApplicants = app.ApplicationApplicants
            .OrderBy(aa => aa.SequenceOrder)
            .ToList();

        var fallbackServiceId = orderedApplicants
            .Select(aa => aa.Applicant?.ServiceId)
            .FirstOrDefault(id => id.HasValue && id.Value != Guid.Empty);

        var fallbackVariantId = orderedApplicants
            .Select(aa => aa.Applicant?.ServiceVariantId)
            .FirstOrDefault(id => id.HasValue && id.Value != Guid.Empty);

        foreach (var aa in orderedApplicants)
        {
            var a = aa.Applicant;
            if (a?.ApplicantDetail == null)
            {
                return ApiResponse<Guid>.Fail($"Submission rejected: Applicant record #{aa.SequenceOrder} is missing biographical details.");
            }

            var ad = a.ApplicantDetail;
            if (string.IsNullOrWhiteSpace(ad.FirstName) || string.IsNullOrWhiteSpace(ad.LastName))
            {
                return ApiResponse<Guid>.Fail($"Submission rejected: Applicant #{aa.SequenceOrder} ({ad.FirstName} {ad.LastName}) is missing mandatory name fields.");
            }

            if (string.IsNullOrWhiteSpace(ad.ContactNumber))
            {
                return ApiResponse<Guid>.Fail($"Submission rejected: Applicant #{aa.SequenceOrder} ({ad.FirstName} {ad.LastName}) is missing contact number.");
            }

            // Verify requirement attachments for each applicant if mandatory requirements exist
            var effectiveServiceId = (a.ServiceId.HasValue && a.ServiceId.Value != Guid.Empty)
                ? a.ServiceId
                : fallbackServiceId;
            var effectiveVariantId = (a.ServiceVariantId.HasValue && a.ServiceVariantId.Value != Guid.Empty)
                ? a.ServiceVariantId
                : fallbackVariantId;

            if (effectiveServiceId.HasValue && effectiveServiceId.Value != Guid.Empty)
            {
                var svrList = await _requirementRepository.GetServiceVariantRequirementsAsync(
                    effectiveServiceId.Value, effectiveVariantId, cancellationToken);
                var distinctSvr = svrList
                    .GroupBy(svr => svr.RequirementId)
                    .Select(g => g.OrderByDescending(x => x.IsRequired).First())
                    .ToList();
                var mandatorySvr = distinctSvr.Where(r => r.IsRequired).ToList();
                if (mandatorySvr.Any())
                {
                    var matchingReqs = app.ApplicationRequirements
                        .Where(r =>
                            (r.StoredFileId.HasValue || !string.IsNullOrWhiteSpace(r.Url)) &&
                            (r.ApplicantId == a.Id ||
                             r.ApplicantId == aa.Id ||
                             (orderedApplicants.Count == 1 && (r.ApplicantId == app.Id || r.ApplicantId == Guid.Empty))))
                        .ToList();

                    var uploadedReqIds = new HashSet<Guid>();
                    foreach (var r in matchingReqs)
                    {
                        if (r.ServiceVariantRequirementId.HasValue && r.ServiceVariantRequirementId.Value != Guid.Empty)
                        {
                            uploadedReqIds.Add(r.ServiceVariantRequirementId.Value);
                        }
                        if (r.RequirementId != Guid.Empty)
                        {
                            uploadedReqIds.Add(r.RequirementId);
                        }
                    }

                    var missing = mandatorySvr
                        .Where(m => !uploadedReqIds.Contains(m.Id) && !uploadedReqIds.Contains(m.RequirementId))
                        .ToList();

                    if (missing.Any())
                    {
                        return ApiResponse<Guid>.Fail($"Submission rejected: Applicant #{aa.SequenceOrder} ({ad.FirstName} {ad.LastName}) is lacking required document uploads.");
                    }
                }
            }
        }

        // 2. Transition status to Submitted (or Evaluating if resubmitting to an active owning evaluator) & generate ApplicationNumber
        var previousStatus = app.Status;
        var isResubmission = previousStatus == ApplicationStatus.Returned;
        var targetAppNumber = !string.IsNullOrWhiteSpace(app.ApplicationNumber)
            ? app.ApplicationNumber
            : $"APP-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
        var trackedApp = await _applicationRepository.GetByIdAsync(app.Id, cancellationToken);
        if (trackedApp == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID '{request.Id}' was not found.");
        }

        string? retainedEvaluatorName = null;
        if (isResubmission && app.Histories != null && app.Histories.Any())
        {
            var orderedHistories = app.Histories.OrderByDescending(h => h.Timestamp).ToList();
            foreach (var h in orderedHistories)
            {
                var act = h.Action ?? string.Empty;
                var rem = h.Remarks ?? string.Empty;
                var role = h.StaffRole ?? string.Empty;

                // If the evaluator explicitly released the application back to the queue, do not auto-retain
                bool isRelease = act.Contains("Released", StringComparison.OrdinalIgnoreCase) ||
                                 act.Contains("Returned to Queue", StringComparison.OrdinalIgnoreCase) ||
                                 rem.Contains("Released by", StringComparison.OrdinalIgnoreCase) ||
                                 rem.Contains("Returned to queue", StringComparison.OrdinalIgnoreCase);
                if (isRelease && !role.Contains("Accountant", StringComparison.OrdinalIgnoreCase) && !role.Contains("Cashier", StringComparison.OrdinalIgnoreCase))
                {
                    break;
                }

                bool isEvaluatorTouch =
                    !string.IsNullOrWhiteSpace(h.StaffName) &&
                    !role.Contains("Accountant", StringComparison.OrdinalIgnoreCase) &&
                    !role.Contains("Cashier", StringComparison.OrdinalIgnoreCase) &&
                    !role.Contains("Applicant", StringComparison.OrdinalIgnoreCase) &&
                    (role.Contains("Evaluator", StringComparison.OrdinalIgnoreCase) ||
                     role.Contains("Engineer", StringComparison.OrdinalIgnoreCase) ||
                     role.Contains("Return Officer", StringComparison.OrdinalIgnoreCase) ||
                     role.Contains("Officer", StringComparison.OrdinalIgnoreCase) ||
                     role.Contains("Chief", StringComparison.OrdinalIgnoreCase) ||
                     role.Contains("Director", StringComparison.OrdinalIgnoreCase) ||
                     role.Contains("Legal", StringComparison.OrdinalIgnoreCase) ||
                     act.Contains("Evaluation", StringComparison.OrdinalIgnoreCase) ||
                     act.Contains("Returned with Notice", StringComparison.OrdinalIgnoreCase) ||
                     h.ToStatus == ApplicationStatus.Evaluating ||
                     (h.ToStatus == ApplicationStatus.Returned && !act.Contains("Accountant", StringComparison.OrdinalIgnoreCase) && !act.Contains("Cashier", StringComparison.OrdinalIgnoreCase)));

                if (isEvaluatorTouch)
                {
                    retainedEvaluatorName = h.StaffName!.Trim();
                    break;
                }
            }
        }

        var targetStatus = (isResubmission && !string.IsNullOrWhiteSpace(retainedEvaluatorName))
            ? ApplicationStatus.Evaluating
            : ApplicationStatus.Submitted;

        trackedApp.Status = targetStatus;
        if (isResubmission)
        {
            trackedApp.Remarks = !string.IsNullOrWhiteSpace(retainedEvaluatorName)
                ? $"Application updated and resubmitted by applicant. Returned to {retainedEvaluatorName} for continued evaluation."
                : "Application updated and resubmitted by applicant.";
        }
        if (string.IsNullOrWhiteSpace(trackedApp.ApplicationNumber))
        {
            trackedApp.ApplicationNumber = targetAppNumber;
        }

        foreach (var aa in app.ApplicationApplicants)
        {
            if (aa.Applicant != null && aa.Applicant.Status == ApplicantStatus.Incomplete)
            {
                aa.Applicant.Status = ApplicantStatus.Complete;
            }
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            await _applicationRepository.UpdateAsync(trackedApp, cancellationToken);

            await _applicationRepository.AddApplicationStatusHistoryAsync(
                new ApplicationStatusHistory
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = trackedApp.Id,
                    Status = targetStatus,
                    Remarks = isResubmission
                        ? (!string.IsNullOrWhiteSpace(retainedEvaluatorName)
                            ? $"Application resubmitted after return. Assigned to {retainedEvaluatorName} for continued evaluation."
                            : "Application resubmitted after return")
                        : "Application finalized and submitted",
                    Timestamp = DateTime.UtcNow,
                    UserId = trackedApp.UserId
                }, cancellationToken);

            var firstApplicant = app.ApplicationApplicants.FirstOrDefault()?.Applicant?.ApplicantDetail;
            var submitterName = firstApplicant != null && !string.IsNullOrWhiteSpace($"{firstApplicant.FirstName} {firstApplicant.LastName}".Trim())
                ? $"{firstApplicant.FirstName} {firstApplicant.LastName}".Trim()
                : "Applicant";
            await _applicationRepository.AddApplicationHistoryAsync(
                new ApplicationHistory
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = trackedApp.Id,
                    Action = isResubmission ? "Application resubmitted by applicant" : "Application submitted by applicant",
                    FromStatus = previousStatus,
                    ToStatus = targetStatus,
                    PerformedByUserId = trackedApp.UserId,
                    StaffName = submitterName,
                    StaffRole = "Applicant",
                    Remarks = isResubmission
                        ? (!string.IsNullOrWhiteSpace(retainedEvaluatorName)
                            ? $"Application resubmitted with updated details/requirements. Continued evaluation by {retainedEvaluatorName}."
                            : "Application resubmitted with updated details/requirements")
                        : "Application submission finalized",
                    Timestamp = DateTime.UtcNow
                }, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            if (_emailNotificationService != null)
            {
                await _emailNotificationService.SendApplicationSubmittedAsync(trackedApp.Id, cancellationToken);
            }

            return ApiResponse<Guid>.Success(trackedApp.Id, "Application finalized and submitted successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to finalize application submission for ApplicationId '{ApplicationId}'.", request.Id);
            try
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            }
            catch (Exception rollbackEx)
            {
                _logger.LogWarning(rollbackEx, "Transaction rollback failed during application finalization for ApplicationId '{ApplicationId}'.", request.Id);
            }
            return ApiResponse<Guid>.Fail("An unexpected error occurred while finalizing the application. Please try again later.");
        }
    }
}
