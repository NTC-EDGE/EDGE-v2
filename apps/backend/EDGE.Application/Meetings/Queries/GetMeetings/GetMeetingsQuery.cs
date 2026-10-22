using MediatR;
using System.Text.Json;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.DTOs;

namespace EDGE.Application.Meetings.Queries.GetMeetings;

public record GetMeetingsQuery(Guid? TenantId = null, string? Filter = null) : IRequest<List<MeetingDto>>;

public class GetMeetingsQueryHandler : IRequestHandler<GetMeetingsQuery, List<MeetingDto>>
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly IMeetingRepository _meetingRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetMeetingsQueryHandler(
        IMeetingRepository meetingRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService)
    {
        _meetingRepository = meetingRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<MeetingDto>> Handle(GetMeetingsQuery request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var meetings = await _meetingRepository.GetMeetingsAsync(currentUser.Id, request.TenantId, request.Filter, cancellationToken);

        return meetings.Select(m => new MeetingDto
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
                Options = ParsePollOptions(p.OptionsJson),
                IsClosed = p.IsClosed,
                IsAnonymous = p.IsAnonymous,
                Votes = p.Votes.Select(v => new MeetingPollVoteDto
                {
                    UserId = v.UserId,
                    SelectedOptionIndex = v.SelectedOptionIndex
                }).ToList()
            }).ToList()
        }).ToList();
    }

    private static List<string> ParsePollOptions(string? optionsJson)
    {
        if (string.IsNullOrWhiteSpace(optionsJson)) return new List<string>();
        try
        {
            return JsonSerializer.Deserialize<List<string>>(optionsJson, JsonOptions) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }
}
