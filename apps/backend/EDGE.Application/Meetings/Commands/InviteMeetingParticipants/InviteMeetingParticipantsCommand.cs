using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Meetings.DTOs;

namespace EDGE.Application.Meetings.Commands.InviteMeetingParticipants;

public record InviteMeetingParticipantsCommand(
    string MeetingCode,
    List<Guid> UserIds
) : IRequest<MeetingDto>;
