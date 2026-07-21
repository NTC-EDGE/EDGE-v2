using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Commands.UpdateSchedule;

public class UpdateScheduleCommandHandler : IRequestHandler<UpdateScheduleCommand, ScheduleDto?>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateScheduleCommandHandler(IScheduleRepository scheduleRepository, IUnitOfWork unitOfWork)
    {
        _scheduleRepository = scheduleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ScheduleDto?> Handle(UpdateScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (schedule is null)
        {
            return null;
        }

        schedule.ServiceId = request.ServiceId;
        schedule.TenantId = request.TenantId;
        schedule.Venue = request.Venue;
        schedule.StartDate = request.StartDate;
        schedule.EndDate = request.EndDate;
        schedule.SeatNumber = request.SeatNumber;
        schedule.Remarks = request.Remarks;
        schedule.ApplicationId = request.ApplicationId;

        _scheduleRepository.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ScheduleDto(
            schedule.Id,
            schedule.ServiceId,
            schedule.TenantId,
            schedule.ApplicationId,
            schedule.SeatNumber,
            schedule.Venue,
            schedule.StartDate,
            schedule.EndDate,
            schedule.Remarks,
            schedule.CreatedAt
        );
    }
}
