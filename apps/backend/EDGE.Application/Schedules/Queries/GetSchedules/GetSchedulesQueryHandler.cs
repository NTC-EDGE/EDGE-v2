using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Queries.GetSchedules;

public class GetSchedulesQueryHandler : IRequestHandler<GetSchedulesQuery, PaginatedApiResponse<ScheduleDto>>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public GetSchedulesQueryHandler(
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

    public async Task<PaginatedApiResponse<ScheduleDto>> Handle(GetSchedulesQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var authUserId = _currentUserService.UserId;
        var user = !string.IsNullOrWhiteSpace(authUserId)
            ? await _userRepository.GetByAuthUserIdAsync(authUserId, cancellationToken)
            : null;

        Guid? effectiveTenantId = request.TenantId;
        if (user != null && !user.IsSuperAdmin)
        {
            var activeTenantId = _tenantContextService.TenantId;
            if (request.TenantId.HasValue)
            {
                var isMember = await _tenantContextService.IsUserActiveMemberAsync(request.TenantId.Value, cancellationToken);
                if (!isMember)
                {
                    return new PaginatedApiResponse<ScheduleDto>([], pageNumber, pageSize, 0);
                }
                effectiveTenantId = request.TenantId.Value;
            }
            else if (activeTenantId.HasValue)
            {
                effectiveTenantId = activeTenantId.Value;
            }
        }

        var (schedules, totalCount) = await _scheduleRepository.GetAllAsync(
            effectiveTenantId,
            request.ServiceId,
            pageNumber,
            pageSize,
            cancellationToken);

        var scheduleDtos = schedules.Select(s => new ScheduleDto(
            s.Id,
            s.ServiceId,
            s.Service?.Name,
            s.Service?.Code,
            s.TenantId,
            s.Venue,
            s.StartDate,
            s.EndDate,
            s.StartApplication,
            s.EndApplication,
            s.IsPublished,
            s.MaximumSlots,
            s.Remarks,
            s.CreatedAt
        )).ToList();

        return new PaginatedApiResponse<ScheduleDto>(scheduleDtos, pageNumber, pageSize, totalCount);
    }
}
