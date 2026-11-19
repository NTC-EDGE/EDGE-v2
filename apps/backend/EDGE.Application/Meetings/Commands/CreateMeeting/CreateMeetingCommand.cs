using MediatR;
using EDGE.Domain.Enums;
using EDGE.Application.Meetings.DTOs;

namespace EDGE.Application.Meetings.Commands.CreateMeeting;

public record CreateMeetingCommand(
    string Title,
    string? Description,
    ConversationScope Scope,
    Guid? TenantId,
    DateTimeOffset ScheduledStartTime,
    DateTimeOffset? ScheduledEndTime,
    List<Guid>? ParticipantUserIds = null,
    bool IsInstant = false,
    bool RingParticipants = false,
    Guid? LinkedConversationId = null
) : IRequest<MeetingDto>;
