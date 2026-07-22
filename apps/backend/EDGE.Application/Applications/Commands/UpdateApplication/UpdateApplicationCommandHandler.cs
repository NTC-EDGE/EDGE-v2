using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.UpdateApplication;

public class UpdateApplicationCommandHandler : IRequestHandler<UpdateApplicationCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateApplicationCommandHandler(
        IApplicationFullRepository applicationRepository,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
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

        if (!string.IsNullOrEmpty(request.DynamicDataJson) && app.ApplicationServices.Count > 0)
        {
            var appService = app.ApplicationServices.First();
            appService.DynamicDataJson = request.DynamicDataJson;
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
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return ApiResponse<Guid>.Fail($"Failed to update application draft. Error: {ex.Message}");
        }
    }
}
