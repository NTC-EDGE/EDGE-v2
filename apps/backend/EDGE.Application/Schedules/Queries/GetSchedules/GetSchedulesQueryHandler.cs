using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Queries.GetSchedules;

public class GetSchedulesQueryHandler : IRequestHandler<GetSchedulesQuery, List<ScheduleDto>>
{
    private readonly IScheduleRepository _scheduleRepository;

    public GetSchedulesQueryHandler(IScheduleRepository scheduleRepository)
    {
        _scheduleRepository = scheduleRepository;
    }

    public async Task<List<ScheduleDto>> Handle(GetSchedulesQuery request, CancellationToken cancellationToken)
    {
        var schedules = await _scheduleRepository.GetAllAsync(request.TenantId, request.ServiceId, cancellationToken);

        return schedules.Select(s => new ScheduleDto(
            s.Id,
            s.ServiceId,
            s.TenantId,
            s.ApplicationId,
            s.SeatNumber,
            s.Venue,
            s.StartDate,
            s.EndDate,
            s.StartApplication,
            s.EndApplication,
            s.IsPublished,
            s.Remarks,
            s.CreatedAt
        )).ToList();
    }
}
