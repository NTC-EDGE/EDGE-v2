using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Queries.GetAvailableSchedules;

public class GetAvailableSchedulesQueryHandler : IRequestHandler<GetAvailableSchedulesQuery, List<ClientScheduleDto>>
{
    private readonly IScheduleRepository _scheduleRepository;

    public GetAvailableSchedulesQueryHandler(IScheduleRepository scheduleRepository)
    {
        _scheduleRepository = scheduleRepository;
    }

    public async Task<List<ClientScheduleDto>> Handle(GetAvailableSchedulesQuery request, CancellationToken cancellationToken)
    {
        var schedules = await _scheduleRepository.GetAvailableSchedulesAsync(
            request.ServiceId,
            request.TenantId,
            request.Date,
            cancellationToken
        );

        return schedules.Select(s => new ClientScheduleDto(
            s.Id,
            s.ServiceId,
            s.TenantId,
            s.SeatNumber,
            s.Venue,
            s.StartDate,
            s.EndDate,
            s.StartApplication,
            s.EndApplication,
            s.IsPublished,
            s.Remarks
        )).ToList();
    }
}
