using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Queries.GetScheduleById;

public class GetScheduleByIdQueryHandler : IRequestHandler<GetScheduleByIdQuery, ScheduleDto?>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public GetScheduleByIdQueryHandler(
        IScheduleRepository scheduleRepository,
        ITenantContextService tenantContextService,
        ICurrentUserService currentUserService,
        IUserRepository userRepository)
    {
        _scheduleRepository = scheduleRepository;
        _tenantContextService = tenantContextService;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
    }

    public async Task<ScheduleDto?> Handle(GetScheduleByIdQuery request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.Id, asNoTracking: true, cancellationToken);
        if (schedule is null)
        {
            return null;
        }

        var authUserId = _currentUserService.UserId;
        var user = !string.IsNullOrWhiteSpace(authUserId)
            ? await _userRepository.GetByAuthUserIdAsync(authUserId, cancellationToken)
            : null;

        if (user != null && !user.IsSuperAdmin)
        {
            var isMember = await _tenantContextService.IsUserActiveMemberAsync(schedule.TenantId, cancellationToken);
            if (!isMember)
            {
                return null;
            }
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
            schedule.CreatedAt
        );
    }
}
