using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Authorization;
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

    public FinalizeApplicationSubmissionCommandHandler(
        IApplicationFullRepository applicationRepository,
        IRequirementRepository requirementRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        ITenantContextService tenantContextService,
        IUnitOfWork unitOfWork,
        IUserAuthorizationService userAuthorizationService)
    {
        _applicationRepository = applicationRepository;
        _requirementRepository = requirementRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _tenantContextService = tenantContextService;
        _unitOfWork = unitOfWork;
        _userAuthorizationService = userAuthorizationService;
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

        if (app.Status != ApplicationStatus.Draft)
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
                var dbUser = await _userRepository.GetByAuthUserIdAsync(currentUserIdStr, cancellationToken);
                if (dbUser != null && app.UserId.HasValue && app.UserId.Value == dbUser.Id)
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
                    var uploadedSvrIds = app.ApplicationRequirements
                        .Where(r => r.ApplicantId == a.Id)
                        .Select(r => r.ServiceVariantRequirementId ?? r.RequirementId)
                        .ToHashSet();

                    var missing = mandatorySvr
                        .Where(m => !uploadedSvrIds.Contains(m.Id) && !uploadedSvrIds.Contains(m.RequirementId))
                        .ToList();

                    if (missing.Any())
                    {
                        return ApiResponse<Guid>.Fail($"Submission rejected: Applicant #{aa.SequenceOrder} ({ad.FirstName} {ad.LastName}) is lacking required document uploads.");
                    }
                }
            }
        }

        // 2. Transition status to Submitted & generate ApplicationNumber
        var targetAppNumber = $"APP-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
        var trackedApp = await _applicationRepository.GetByIdAsync(app.Id, cancellationToken);
        if (trackedApp == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID '{request.Id}' was not found.");
        }

        trackedApp.Status = ApplicationStatus.Submitted;
        trackedApp.ApplicationNumber = targetAppNumber;

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            await _applicationRepository.UpdateAsync(trackedApp, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(trackedApp.Id, "Application finalized and submitted successfully.");
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return ApiResponse<Guid>.Fail($"Failed to finalize application. Error: {ex.Message}");
        }
    }
}
