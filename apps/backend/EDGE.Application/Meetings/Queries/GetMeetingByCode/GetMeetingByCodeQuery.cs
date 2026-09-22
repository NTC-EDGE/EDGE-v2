using MediatR;
using System.Text.Json;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.DTOs;

namespace EDGE.Application.Meetings.Queries.GetMeetingByCode;

public record GetMeetingByCodeQuery(string MeetingCode) : IRequest<MeetingDto?>;

public class GetMeetingByCodeQueryHandler : IRequestHandler<GetMeetingByCodeQuery, MeetingDto?>
{
    private readonly IMeetingRepository _meetingRepository;

    public GetMeetingByCodeQueryHandler(IMeetingRepository meetingRepository)
    {
        _meetingRepository = meetingRepository;
    }

    public async Task<MeetingDto?> Handle(GetMeetingByCodeQuery request, CancellationToken cancellationToken)
    {
        var m = await _meetingRepository.GetByCodeAsync(request.MeetingCode, cancellationToken);
        if (m == null) return null;

        return new MeetingDto
        {
            Id = m.Id,
            Title = m.Title,
            Description = m.Description,
            MeetingCode = m.MeetingCode,
            Scope = m.Scope,
            TenantId = m.TenantId,
            TenantName = m.Tenant?.Name,
            HostUserId = m.HostUserId,
            HostUserName = $"{m.HostUser?.FirstName} {m.HostUser?.LastName}".Trim(),
            ScheduledStartTime = m.ScheduledStartTime,
            ScheduledEndTime = m.ScheduledEndTime,
            Status = m.Status,
            Participants = m.Participants.Select(p => new MeetingParticipantDto
            {
                UserId = p.UserId,
                FullName = $"{p.User?.FirstName} {p.User?.LastName}".Trim(),
                Email = p.User?.Email ?? string.Empty,
                AvatarUrl = p.User?.ProfilePicture,
                Role = p.Role,
                IsHandRaised = p.IsHandRaised,
                HandRaiseQueuePosition = p.HandRaiseQueuePosition,
                IsMutedByHost = p.IsMutedByHost,
                IsSpotlighted = p.IsSpotlighted
            }).ToList(),
            Polls = m.Polls.Select(p => new MeetingPollDto
            {
                Id = p.Id,
                Question = p.Question,
                Options = JsonSerializer.Deserialize<List<string>>(p.OptionsJson) ?? new(),
                IsClosed = p.IsClosed,
                IsAnonymous = p.IsAnonymous,
                Votes = p.Votes.Select(v => new MeetingPollVoteDto
                {
                    UserId = v.UserId,
                    SelectedOptionIndex = v.SelectedOptionIndex
                }).ToList()
            }).ToList()
        };
    }
}
