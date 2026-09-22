using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Queries.GetScheduleById;

public class GetScheduleByIdQueryHandler : IRequestHandler<GetScheduleByIdQuery, ScheduleDto?>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly ITenantContextService _tenantContextService;

    public GetScheduleByIdQueryHandler(
        IScheduleRepository scheduleRepository,
        ITenantContextService tenantContextService)
    {
        _scheduleRepository = scheduleRepository;
        _tenantContextService = tenantContextService;
    }

    public async Task<ScheduleDto?> Handle(GetScheduleByIdQuery request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.Id, asNoTracking: true, cancellationToken);
        if (schedule is null)
        {
            return null;
        }

        var isMember = await _tenantContextService.IsUserActiveMemberAsync(schedule.TenantId, cancellationToken);
        if (!isMember)
        {
            return null;
        }

        return new ScheduleDto(
            schedule.Id,
            schedule.ServiceId,
            schedule.Service?.Name,
            schedule.Service?.Code,
            schedule.TenantId,
            schedule.Venue,
            schedule.StartDate,
            schedule.EndDate,
            schedule.StartApplication,
            schedule.EndApplication,
            schedule.IsPublished,
            schedule.MaximumSlots,
            schedule.Remarks,
            schedule.CreatedAt,
            schedule.StartTime,
            schedule.EndTime
        );
    }
}
