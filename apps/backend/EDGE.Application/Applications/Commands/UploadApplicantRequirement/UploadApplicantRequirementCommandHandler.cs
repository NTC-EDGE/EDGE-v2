using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.UploadApplicantRequirement;

public class UploadApplicantRequirementCommandHandler : IRequestHandler<UploadApplicantRequirementCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IRequirementRepository _requirementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UploadApplicantRequirementCommandHandler(
        IApplicationFullRepository applicationRepository,
        IRequirementRepository requirementRepository,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _requirementRepository = requirementRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(UploadApplicantRequirementCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID '{request.ApplicationId}' was not found.");
        }

        // 1. Verify master requirement exists
        var reqMaster = await _requirementRepository.GetRequirementByIdAsync(request.RequirementId, cancellationToken);
        if (reqMaster == null)
        {
            return ApiResponse<Guid>.Fail($"Requirement with ID '{request.RequirementId}' was not found in the master catalog.");
        }

        // 2. Validate that requirement belongs to the application's service (if rules exist)
        var primaryService = app.ApplicationServices.FirstOrDefault();
        if (primaryService != null)
        {
            var validRules = await _requirementRepository.GetServiceVariantRequirementsAsync(
                primaryService.ServiceId,
                primaryService.ServiceVariantId,
                primaryService.ApplicationTypeKey,
                cancellationToken);

            // If variant requirement rules exist for this service, ensure the requirement is in the allowed rules
            if (validRules.Any() && !validRules.Any(r => r.RequirementId == request.RequirementId))
            {
                return ApiResponse<Guid>.Fail($"Requirement '{reqMaster.Name}' is not configured for the selected service or examinee type.");
            }
        }

        var req = new ApplicationRequirement
        {
            ApplicationId = request.ApplicationId,
            ApplicantId = request.ApplicantId,
            RequirementId = request.RequirementId,
            ServiceVariantRequirementId = request.ServiceVariantRequirementId,
            StoredFileId = request.StoredFileId,
            TenantId = request.TenantId,
            Url = string.IsNullOrWhiteSpace(request.Url) && request.StoredFileId.HasValue ? $"tenants/{request.TenantId}/requirements/{request.StoredFileId.Value}" : request.Url,
            IsApproved = false
        };

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            await _applicationRepository.AddApplicationRequirementAsync(req, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(req.Id, "Applicant requirement document uploaded successfully.");
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return ApiResponse<Guid>.Fail($"Failed to upload requirement. Error: {ex.Message}");
        }
    }
}
