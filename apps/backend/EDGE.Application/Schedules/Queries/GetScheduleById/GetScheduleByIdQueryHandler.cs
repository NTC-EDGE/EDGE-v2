using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Queries.GetScheduleById;

public class GetScheduleByIdQueryHandler : IRequestHandler<GetScheduleByIdQuery, ScheduleDto?>
{
    private readonly IScheduleRepository _scheduleRepository;

    public GetScheduleByIdQueryHandler(IScheduleRepository scheduleRepository)
    {
        _scheduleRepository = scheduleRepository;
    }

    public async Task<ScheduleDto?> Handle(GetScheduleByIdQuery request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (schedule is null)
        {
            return null;
        }

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
