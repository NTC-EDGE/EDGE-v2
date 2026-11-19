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

    public FinalizeApplicationSubmissionCommandHandler(
        IApplicationFullRepository applicationRepository,
        IRequirementRepository requirementRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        ITenantContextService tenantContextService,
        IUnitOfWork unitOfWork,
        IUserAuthorizationService userAuthorizationService,
        ILogger<FinalizeApplicationSubmissionCommandHandler> logger)
    {
        _applicationRepository = applicationRepository;
        _requirementRepository = requirementRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _tenantContextService = tenantContextService;
        _unitOfWork = unitOfWork;
        _userAuthorizationService = userAuthorizationService;
        _logger = logger;
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
        foreach (var aa in app.ApplicationApplicants)
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
            if (a.ServiceId.HasValue && a.ServiceId.Value != Guid.Empty)
            {
                var svrList = await _requirementRepository.GetServiceVariantRequirementsAsync(
                    a.ServiceId.Value, a.ServiceVariantId, cancellationToken);
                var mandatorySvr = svrList.Where(r => r.IsRequired).ToList();
                if (mandatorySvr.Any())
                {
                    var matchingReqs = app.ApplicationRequirements
                        .Where(r =>
                            (r.StoredFileId.HasValue || !string.IsNullOrWhiteSpace(r.Url)) &&
                            (r.ApplicantId == a.Id ||
                             r.ApplicantId == aa.Id ||
                             (app.ApplicationApplicants.Count == 1 && (r.ApplicantId == app.Id || r.ApplicantId == Guid.Empty))))
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

        // 2. Transition status to Submitted & generate ApplicationNumber
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

        trackedApp.Status = ApplicationStatus.Submitted;
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
                    Status = ApplicationStatus.Submitted,
                    Remarks = isResubmission ? "Application resubmitted after return" : "Application finalized and submitted",
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
                    ToStatus = ApplicationStatus.Submitted,
                    PerformedByUserId = trackedApp.UserId,
                    StaffName = submitterName,
                    StaffRole = "Applicant",
                    Remarks = isResubmission ? "Application resubmitted with updated details/requirements" : "Application submission finalized",
                    Timestamp = DateTime.UtcNow
                }, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

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
