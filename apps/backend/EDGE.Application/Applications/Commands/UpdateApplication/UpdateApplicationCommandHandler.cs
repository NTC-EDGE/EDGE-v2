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
    private readonly IServiceRepository _serviceRepository;
    private readonly IServiceVariantElementRepository _elementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateApplicationCommandHandler(
        IApplicationFullRepository applicationRepository,
        IServiceRepository serviceRepository,
        IServiceVariantElementRepository elementRepository,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _serviceRepository = serviceRepository;
        _elementRepository = elementRepository;
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

        if (app.ApplicationServices.Count > 0)
        {
            foreach (var appService in app.ApplicationServices)
            {
                if (request.ServiceVariantId.HasValue && request.ServiceVariantId.Value != Guid.Empty)
                {
                    var variant = await _serviceRepository.GetVariantByIdAsync(request.ServiceVariantId.Value, cancellationToken);
                    if (variant == null || (appService.ServiceId.HasValue && variant.ServiceId != appService.ServiceId))
                    {
                        return ApiResponse<Guid>.Fail("Validation Error: The selected service variant is invalid or does not belong to the application's service.");
                    }
                    appService.ServiceVariantId = variant.Id;
                }

                if (request.ServiceVariantElementIds != null)
                {
                    var variantId = appService.ServiceVariantId;
                    if (!variantId.HasValue)
                    {
                        return ApiResponse<Guid>.Fail("Validation Error: Cannot update variant elements without a resolved service variant.");
                    }

                    var validElements = await _elementRepository.GetAllByVariantAsync(variantId.Value, cancellationToken);
                    var validElementIds = validElements.Select(e => e.Id).ToHashSet();

                    var invalidElementIds = request.ServiceVariantElementIds.Where(id => !validElementIds.Contains(id)).ToList();
                    if (invalidElementIds.Any())
                    {
                        return ApiResponse<Guid>.Fail($"Validation Error: Element ID(s) '{string.Join(", ", invalidElementIds)}' do not belong to the selected variant.");
                    }
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
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return ApiResponse<Guid>.Fail($"Failed to update application draft. Error: {ex.Message}");
        }
    }
}
