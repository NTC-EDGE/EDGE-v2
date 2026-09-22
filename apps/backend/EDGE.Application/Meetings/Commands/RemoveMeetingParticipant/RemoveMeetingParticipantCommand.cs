using System;
using MediatR;

namespace EDGE.Application.Meetings.Commands.RemoveMeetingParticipant;

public record RemoveMeetingParticipantCommand(
    string MeetingCode,
    Guid UserId
) : IRequest<bool>;
