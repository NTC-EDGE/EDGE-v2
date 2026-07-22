using System;
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
    private readonly IUnitOfWork _unitOfWork;

    public UploadApplicantRequirementCommandHandler(
        IApplicationFullRepository applicationRepository,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Guid>> Handle(UploadApplicantRequirementCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID {request.ApplicationId} was not found.");
        }

        var req = new ApplicationRequirement
        {
            ApplicationId = request.ApplicationId,
            ApplicantId = request.ApplicantId,
            RequirementId = request.RequirementId,
            ServiceVariantRequirementId = request.ServiceVariantRequirementId,
            TenantId = request.TenantId,
            Url = request.Url,
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
