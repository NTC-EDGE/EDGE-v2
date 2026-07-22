using MediatR;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Queries.GetAvailableSchedules;

public record GetAvailableSchedulesQuery(
    Guid ServiceId,
    Guid TenantId,
    DateTime? Date = null
) : IRequest<List<ClientScheduleDto>>;
