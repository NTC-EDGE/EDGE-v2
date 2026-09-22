using MediatR;
using EDGE.Domain.Enums;

namespace EDGE.Application.Meetings.Commands.ExecuteMeetingAction;

public record ExecuteMeetingActionCommand(
    string MeetingCode,
    MeetingActionType ActionType,
    Guid? TargetUserId = null,
    string? ActionPayload = null
) : IRequest<bool>;
