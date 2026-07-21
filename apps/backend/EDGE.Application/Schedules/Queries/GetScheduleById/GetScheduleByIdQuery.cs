using MediatR;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Queries.GetScheduleById;

public record GetScheduleByIdQuery(Guid Id) : IRequest<ScheduleDto?>;
