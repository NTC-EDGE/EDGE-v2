using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.UploadApplicantRequirement;

public class UploadApplicantRequirementCommandHandler
    : IRequestHandler<UploadApplicantRequirementCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IRequirementRepository _requirementRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly ITenantContextService _tenantContext;
    private readonly IUnitOfWork _unitOfWork;

    public UploadApplicantRequirementCommandHandler(
        IApplicationFullRepository applicationRepository,
        IRequirementRepository requirementRepository,
        IServiceRepository serviceRepository,
        ITenantContextService tenantContext,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _requirementRepository = requirementRepository;
        _serviceRepository = serviceRepository;
        _tenantContext = tenantContext;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(
        UploadApplicantRequirementCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Load application with full details (includes FormSubmissions → FieldValues → Field)
        var app = await _applicationRepository.GetByIdWithDetailsAsync(
            request.ApplicationId, cancellationToken);
        if (app == null)
            return ApiResponse<Guid>.Fail(
                $"Application '{request.ApplicationId}' was not found.");

        // 2. Verify the current user is an active member of this application's tenant.
        //    We derive tenant from app.TenantId (the authoritative source) rather than
        //    from a route parameter, so this works on both:
        //      - /applications/{id}/applicants/{applicantId}/requirements
        //      - /tenants/{tenantId}/applications/{appId}/applicants/{applicantId}/requirements
        var isMember = await _tenantContext.IsUserActiveMemberAsync(app.TenantId, cancellationToken);
        if (!isMember)
            return ApiResponse<Guid>.Fail(
                "You do not have permission to upload requirements for this application.");

        // 3. Verify the applicant is a member of this application
        var isApplicantMember = app.ApplicationApplicants
            .Any(a => a.ApplicantId == request.ApplicantId);
        if (!isApplicantMember)
            return ApiResponse<Guid>.Fail(
                $"Applicant '{request.ApplicantId}' is not linked to application '{request.ApplicationId}'.");

        // 5. Resolve RequirementId — prefer ServiceVariantRequirementId (auto-derives RequirementId)
        Guid resolvedRequirementId;
        if (request.ServiceVariantRequirementId.HasValue)
        {
            var svr = await _requirementRepository.GetServiceVariantRequirementByIdAsync(
                request.ServiceVariantRequirementId.Value, cancellationToken);
            if (svr == null)
                return ApiResponse<Guid>.Fail(
                    $"ServiceVariantRequirement '{request.ServiceVariantRequirementId}' was not found.");

            resolvedRequirementId = svr.RequirementId;
        }
        else if (request.RequirementId.HasValue)
        {
            resolvedRequirementId = request.RequirementId.Value;
        }
        else
        {
            return ApiResponse<Guid>.Fail(
                "Either RequirementId or ServiceVariantRequirementId must be provided.");
        }

        // 6. Verify requirement exists in master catalog
        var reqMaster = await _requirementRepository.GetRequirementByIdAsync(
            resolvedRequirementId, cancellationToken);
        if (reqMaster == null)
            return ApiResponse<Guid>.Fail(
                $"Requirement '{resolvedRequirementId}' was not found in the master catalog.");

        // 7. Verify requirement is valid for the applicant's service & variant
        var appApplicant = app.ApplicationApplicants.FirstOrDefault(aa => aa.ApplicantId == request.ApplicantId);
        var applicant = appApplicant?.Applicant;

        if (applicant?.ServiceId != null)
        {
            // Query rules scoped to this applicant's service & variant
            var validRules = await _requirementRepository.GetServiceVariantRequirementsAsync(
                applicant.ServiceId.Value,
                applicant.ServiceVariantId,
                cancellationToken);

            // If rules are configured for this variant, enforce them strictly.
            // If no rules exist yet, remain permissive (graceful degradation).
            if (validRules.Any() &&
                !validRules.Any(r => r.RequirementId == resolvedRequirementId))
            {
                return ApiResponse<Guid>.Fail(
                    $"Requirement '{reqMaster.Name}' is not permitted for this applicant's service variant.");
            }
        }

        // 8. Auto-generate storage URL — never accepted from client
        var url = $"/api/v2/tenants/{app.TenantId}/storage/files/{request.StoredFileId}";

        // 9. Check if an existing submission record exists for this requirement and applicant
        var existingRequirement = app.ApplicationRequirements.FirstOrDefault(ar =>
            ar.ApplicantId == request.ApplicantId &&
            ((request.ServiceVariantRequirementId.HasValue && ar.ServiceVariantRequirementId == request.ServiceVariantRequirementId.Value) ||
             ar.RequirementId == resolvedRequirementId));

        Guid requirementEntityId;

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            if (existingRequirement != null)
            {
                existingRequirement.StoredFileId = request.StoredFileId;
                existingRequirement.ServiceVariantRequirementId = request.ServiceVariantRequirementId ?? existingRequirement.ServiceVariantRequirementId;
                existingRequirement.RequirementId = resolvedRequirementId;
                existingRequirement.Url = url;
                existingRequirement.IsApproved = false;
                requirementEntityId = existingRequirement.Id;
            }
            else
            {
                var entity = new ApplicationRequirement
                {
                    ApplicationId               = request.ApplicationId,
                    ApplicantId                 = request.ApplicantId,
                    RequirementId               = resolvedRequirementId,
                    ServiceVariantRequirementId = request.ServiceVariantRequirementId,
                    StoredFileId                = request.StoredFileId,
                    TenantId                    = app.TenantId,
                    Url                         = url,
                    IsApproved                  = false
                };

                await _applicationRepository.AddApplicationRequirementAsync(
                    entity, cancellationToken);
                requirementEntityId = entity.Id;
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(
                requirementEntityId, "Applicant requirement document uploaded successfully.");
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return ApiResponse<Guid>.Fail($"Failed to upload requirement. Error: {ex.Message}");
        }
    }
}