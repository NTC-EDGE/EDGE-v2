using MediatR;
using EDGE.Application.Schedules.DTOs;

using EDGE.Application.Common.Models;

namespace EDGE.Application.Schedules.Queries.GetAvailableSchedules;

public record GetAvailableSchedulesQuery(
    Guid ServiceId,
    Guid TenantId,
    DateTime? Date = null,
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<PaginatedApiResponse<ClientScheduleDto>>;
