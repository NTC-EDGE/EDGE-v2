using MediatR;

namespace EDGE.Application.Schedules.Commands.DeleteSchedule;

public record DeleteScheduleCommand(Guid Id) : IRequest<bool>;
