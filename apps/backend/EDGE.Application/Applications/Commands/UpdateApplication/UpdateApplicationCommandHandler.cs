using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.UpdateApplication;

public class UpdateApplicationCommandHandler : IRequestHandler<UpdateApplicationCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IServiceVariantElementRepository _elementRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateApplicationCommandHandler> _logger;

    public UpdateApplicationCommandHandler(
        IApplicationFullRepository applicationRepository,
        IServiceRepository serviceRepository,
        IServiceVariantElementRepository elementRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateApplicationCommandHandler> logger)
    {
        _applicationRepository = applicationRepository;
        _serviceRepository = serviceRepository;
        _elementRepository = elementRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ApiResponse<Guid>> Handle(UpdateApplicationCommand request, CancellationToken cancellationToken)
    {
        var app = await _applicationRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (app == null)
        {
            return ApiResponse<Guid>.Fail($"Application with ID {request.Id} was not found.");
        }

        if (app.Status != ApplicationStatus.Draft)
        {
            return ApiResponse<Guid>.Fail("Cannot update an application that is already submitted.");
        }

        if (request.RegionId.HasValue) app.RegionId = request.RegionId;
        if (request.ScheduleId.HasValue) app.ScheduleId = request.ScheduleId;
        if (!string.IsNullOrEmpty(request.Office)) app.Office = request.Office;

        foreach (var aa in app.ApplicationApplicants)
        {
            var applicant = aa.Applicant;
            if (applicant != null)
            {
                if (request.ServiceVariantId.HasValue && request.ServiceVariantId.Value != Guid.Empty)
                {
                    var variant = await _serviceRepository.GetVariantByIdAsync(request.ServiceVariantId.Value, cancellationToken);
                    if (variant == null || (applicant.ServiceId.HasValue && variant.ServiceId != applicant.ServiceId))
                    {
                        return ApiResponse<Guid>.Fail("Validation Error: The selected service variant is invalid or does not belong to the application's service.");
                    }
                    applicant.ServiceVariantId = variant.Id;
                }
            }
        }

        await _unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            await _applicationRepository.UpdateAsync(app, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ApiResponse<Guid>.Success(app.Id, "Application draft updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update application draft for ApplicationId '{ApplicationId}'.", request.Id);
            try
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            }
            catch (Exception rollbackEx)
            {
                _logger.LogWarning(rollbackEx, "Transaction rollback failed during application update for ApplicationId '{ApplicationId}'.", request.Id);
            }
            return ApiResponse<Guid>.Fail("An unexpected error occurred while updating the application draft. Please try again later.");
        }
    }
}
