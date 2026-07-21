using MediatR;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Commands.SetSchedulePublishStatus;

public record PublishScheduleRequest(bool? IsPublished = null);

public record SetSchedulePublishStatusCommand(
    Guid Id,
    bool? IsPublished = null
) : IRequest<ScheduleDto?>;
