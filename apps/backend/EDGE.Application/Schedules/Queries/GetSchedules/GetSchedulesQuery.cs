using MediatR;
using EDGE.Application.Schedules.DTOs;

using EDGE.Application.Common.Models;

namespace EDGE.Application.Schedules.Queries.GetSchedules;

public record GetSchedulesQuery(
    Guid? TenantId = null,
    Guid? ServiceId = null,
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<PaginatedApiResponse<ScheduleDto>>;
