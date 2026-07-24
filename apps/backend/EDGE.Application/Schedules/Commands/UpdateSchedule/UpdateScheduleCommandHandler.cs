using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Commands.UpdateSchedule;

public class UpdateScheduleCommandHandler : IRequestHandler<UpdateScheduleCommand, ScheduleDto?>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateScheduleCommandHandler(
        IScheduleRepository scheduleRepository,
        IServiceRepository serviceRepository,
        IUnitOfWork unitOfWork)
    {
        _scheduleRepository = scheduleRepository;
        _serviceRepository = serviceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ScheduleDto?> Handle(UpdateScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (schedule is null)
        {
            return null;
        }

        var service = await _serviceRepository.GetByIdAsync(request.ServiceId, cancellationToken);
        if (service == null)
        {
            throw new InvalidOperationException($"Service with ID '{request.ServiceId}' does not exist.");
        }

        schedule.ServiceId = request.ServiceId;
        schedule.TenantId = request.TenantId;
        schedule.Venue = request.Venue;
        schedule.StartDate = request.StartDate;
        schedule.EndDate = request.EndDate;
        schedule.StartApplication = request.StartApplication;
        schedule.EndApplication = request.EndApplication;
        schedule.IsPublished = request.IsPublished;
        schedule.MaximumSlots = request.MaximumSlots;
        schedule.SeatNumber = request.SeatNumber;
        schedule.Remarks = request.Remarks;
        schedule.ApplicationId = request.ApplicationId;

        _scheduleRepository.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ScheduleDto(
            schedule.Id,
            schedule.ServiceId,
            service.Name,
            service.Code,
            schedule.TenantId,
            schedule.ApplicationId,
            schedule.SeatNumber,
            schedule.Venue,
            schedule.StartDate,
            schedule.EndDate,
            schedule.StartApplication,
            schedule.EndApplication,
            schedule.IsPublished,
            schedule.MaximumSlots,
            schedule.Remarks,
            schedule.CreatedAt
        );
    }
}
