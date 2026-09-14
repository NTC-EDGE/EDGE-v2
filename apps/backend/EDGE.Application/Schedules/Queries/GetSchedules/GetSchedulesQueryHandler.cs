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

    public GetSchedulesQueryHandler(
        IScheduleRepository scheduleRepository,
        ITenantContextService tenantContextService)
    {
        _scheduleRepository = scheduleRepository;
        _tenantContextService = tenantContextService;
    }

    public async Task<PaginatedApiResponse<ScheduleDto>> Handle(GetSchedulesQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var isSuperAdmin = await _tenantContextService.IsCurrentUserSuperAdminAsync(cancellationToken);
        Guid? effectiveTenantId = request.TenantId;

        if (!isSuperAdmin)
        {
            if (request.TenantId.HasValue)
            {
                var isMember = await _tenantContextService.IsUserActiveMemberAsync(request.TenantId.Value, cancellationToken);
                if (!isMember)
                {
                    return new PaginatedApiResponse<ScheduleDto>([], pageNumber, pageSize, 0);
                }
                effectiveTenantId = request.TenantId.Value;
            }
            else if (_tenantContextService.TenantId.HasValue)
            {
                var isMember = await _tenantContextService.IsUserActiveMemberOfCurrentTenantAsync(cancellationToken);
                if (!isMember)
                {
                    return new PaginatedApiResponse<ScheduleDto>([], pageNumber, pageSize, 0);
                }
                effectiveTenantId = _tenantContextService.TenantId.Value;
            }
            else
            {
                // Fallback: If neither request.TenantId nor ambient TenantId is present, resolve user's assigned active tenants
                var activeTenantIds = await _tenantContextService.GetUserActiveTenantIdsAsync(cancellationToken);
                if (activeTenantIds.Count == 0)
                {
                    return new PaginatedApiResponse<ScheduleDto>([], pageNumber, pageSize, 0);
                }
                effectiveTenantId = activeTenantIds[0];
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
