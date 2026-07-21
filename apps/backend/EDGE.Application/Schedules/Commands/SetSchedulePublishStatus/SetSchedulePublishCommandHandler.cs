using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Commands.SetSchedulePublishStatus;

public class SetSchedulePublishCommandHandler : IRequestHandler<SetSchedulePublishStatusCommand, ScheduleDto?>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SetSchedulePublishCommandHandler(IScheduleRepository scheduleRepository, IUnitOfWork unitOfWork)
    {
        _scheduleRepository = scheduleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ScheduleDto?> Handle(SetSchedulePublishStatusCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (schedule is null)
        {
            return null;
        }

        schedule.IsPublished = request.IsPublished ?? !schedule.IsPublished;

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
            schedule.StartApplication,
            schedule.EndApplication,
            schedule.IsPublished,
            schedule.MaximumSlots,
            schedule.Remarks,
            schedule.CreatedAt
        );
    }
}
