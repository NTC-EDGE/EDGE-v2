using MediatR;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Queries.GetSchedules;

public record GetSchedulesQuery(Guid? TenantId = null, Guid? ServiceId = null) : IRequest<List<ScheduleDto>>;
