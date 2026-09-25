using System.Collections.Concurrent;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Hubs;

[Authorize]
public class MeetingHub : AuthenticatedHub<IMeetingClient>
{
    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> ConnectionMeetings = new();
    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<Guid, string>> MeetingActiveUserConnections = new();
    private readonly IMeetingRepository _meetingRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MeetingHub(
        IMeetingRepository meetingRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
        : base(userRepository)
    {
        _meetingRepository = meetingRepository;
        _unitOfWork = unitOfWork;
    }

    public override async Task OnConnectedAsync()
    {
        var resolvedUserId = await ResolveUserIdAsync();
        if (resolvedUserId.HasValue)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{resolvedUserId.Value}");
        }
        await base.OnConnectedAsync();
    }

    public async Task JoinMeeting(string meetingCode)
    {
        if (string.IsNullOrWhiteSpace(meetingCode))
        {
            throw new HubException("Invalid meeting code.");
        }

        var meeting = await _meetingRepository.GetByCodeAsync(meetingCode);
        if (meeting == null)
        {
            throw new HubException("Meeting not found.");
        }

        var resolvedUserId = await ResolveUserIdAsync();
        var userId = resolvedUserId ?? Guid.Empty;

        var isAuthorized = meeting.Scope == Domain.Enums.ConversationScope.InterRegional ||
                           meeting.AllowExternalGuests ||
                           (resolvedUserId.HasValue && (meeting.HostUserId == userId || meeting.Participants.Any(p => p.UserId == userId && !p.IsDeleted)));

        if (!isAuthorized && !meeting.AllowExternalGuests)
        {
            throw new HubException("Access denied: You are not authorized to join this meeting room.");
        }

        if (resolvedUserId.HasValue && resolvedUserId.Value != Guid.Empty)
        {
            var userConns = MeetingActiveUserConnections.GetOrAdd(meetingCode, _ => new ConcurrentDictionary<Guid, string>());
            if (userConns.TryGetValue(resolvedUserId.Value, out var existingConnId) && existingConnId != Context.ConnectionId)
            {
                await Clients.Caller.OnExistingSessionDetected(meetingCode, existingConnId);
                return;
            }
            userConns[resolvedUserId.Value] = Context.ConnectionId;
        }

        var groupName = $"meet_{meetingCode}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        var meetings = ConnectionMeetings.GetOrAdd(Context.ConnectionId, _ => new ConcurrentDictionary<string, byte>());
        meetings.TryAdd(meetingCode, 0);

        await Clients.OthersInGroup(groupName).OnParticipantJoined(new { connectionId = Context.ConnectionId, userId });
    }

    public async Task SwitchDevice(string meetingCode)
    {
        if (string.IsNullOrWhiteSpace(meetingCode)) return;

        var resolvedUserId = await ResolveUserIdAsync();
        if (resolvedUserId.HasValue && MeetingActiveUserConnections.TryGetValue(meetingCode, out var userConns))
        {
            if (userConns.TryGetValue(resolvedUserId.Value, out var oldConnId) && oldConnId != Context.ConnectionId)
            {
                await Clients.Client(oldConnId).OnSessionSwitchedToAnotherDevice(meetingCode);
                var oldMeetings = ConnectionMeetings.GetOrAdd(oldConnId, _ => new ConcurrentDictionary<string, byte>());
                oldMeetings.TryRemove(meetingCode, out _);
                await Groups.RemoveFromGroupAsync(oldConnId, $"meet_{meetingCode}");
            }
            userConns[resolvedUserId.Value] = Context.ConnectionId;
        }

        var groupName = $"meet_{meetingCode}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        var meetings = ConnectionMeetings.GetOrAdd(Context.ConnectionId, _ => new ConcurrentDictionary<string, byte>());
        meetings.TryAdd(meetingCode, 0);

        var userId = resolvedUserId ?? Guid.Empty;
        await Clients.OthersInGroup(groupName).OnParticipantJoined(new { connectionId = Context.ConnectionId, userId });
    }

    public async Task RequestJoinMeeting(string meetingCode)
    {
        if (string.IsNullOrWhiteSpace(meetingCode))
        {
            throw new HubException("Invalid meeting code.");
        }

        var meeting = await _meetingRepository.GetByCodeAsync(meetingCode);
        if (meeting == null)
        {
            throw new HubException("Meeting not found.");
        }

        var resolvedUserId = await ResolveUserIdAsync();
        var userId = resolvedUserId ?? Guid.Empty;

        var isAlreadyAuthorized = meeting.Scope == Domain.Enums.ConversationScope.InterRegional ||
                                  meeting.AllowExternalGuests ||
                                  (resolvedUserId.HasValue && (meeting.HostUserId == userId || meeting.Participants.Any(p => p.UserId == userId && !p.IsDeleted)));

        if (isAlreadyAuthorized)
        {
            await JoinMeeting(meetingCode);
            await Clients.Caller.OnJoinRequestAdmitted(meetingCode);
            return;
        }

        // Add to waiting group
        var waitingGroupName = $"meet_waiting_{meetingCode}";
        await Groups.AddToGroupAsync(Context.ConnectionId, waitingGroupName);

        var meetings = ConnectionMeetings.GetOrAdd(Context.ConnectionId, _ => new ConcurrentDictionary<string, byte>());
        meetings.TryAdd(meetingCode, 0);

        var user = resolvedUserId.HasValue ? await UserRepository.GetByIdAsync(resolvedUserId.Value) : null;
        var userName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Guest User";
        var avatarUrl = user?.ProfilePicture;

        // Notify active meeting room participants/host
        var roomGroupName = $"meet_{meetingCode}";
        await Clients.Group(roomGroupName).OnJoinRequested(new
        {
            connectionId = Context.ConnectionId,
            userId = resolvedUserId ?? Guid.Empty,
            userName = string.IsNullOrWhiteSpace(userName) ? "Guest User" : userName,
            avatarUrl,
            meetingCode
        });

        await Clients.Caller.OnJoinRequestPending(meetingCode);
    }

    public async Task AdmitParticipant(string meetingCode, string targetConnectionId, string? targetUserId)
    {
        if (string.IsNullOrWhiteSpace(meetingCode) || string.IsNullOrWhiteSpace(targetConnectionId))
        {
            throw new HubException("Invalid admission request parameters.");
        }

        var meeting = await _meetingRepository.GetByCodeAsync(meetingCode);
        if (meeting == null)
        {
            throw new HubException("Meeting not found.");
        }

        var resolvedUserId = await ResolveUserIdAsync();
        var currentUserId = resolvedUserId ?? Guid.Empty;

        var isHostOrAdmin = meeting.HostUserId == currentUserId ||
                            meeting.Participants.Any(p => p.UserId == currentUserId && (p.Role == Domain.Enums.ParticipantRole.Owner || p.Role == Domain.Enums.ParticipantRole.Admin));

        if (!isHostOrAdmin)
        {
            throw new HubException("Only the meeting host or administrators can admit participants.");
        }

        Guid parsedTargetUserId = Guid.Empty;
        if (!string.IsNullOrWhiteSpace(targetUserId) && Guid.TryParse(targetUserId, out var g))
        {
            parsedTargetUserId = g;
        }

        // Add participant to meeting if not already present
        if (parsedTargetUserId != Guid.Empty)
        {
            var existing = meeting.Participants.FirstOrDefault(p => p.UserId == parsedTargetUserId);
            if (existing != null)
            {
                existing.IsDeleted = false;
            }
            else
            {
                meeting.Participants.Add(new Domain.Entities.MeetingParticipant
                {
                    MeetingId = meeting.Id,
                    UserId = parsedTargetUserId,
                    TenantId = meeting.TenantId,
                    Role = Domain.Enums.ParticipantRole.Member,
                    IsDeleted = false,
                    IsDeletedBy = string.Empty
                });
            }
            await _unitOfWork.SaveChangesAsync();
        }

        var waitingGroupName = $"meet_waiting_{meetingCode}";
        var roomGroupName = $"meet_{meetingCode}";

        await Groups.RemoveFromGroupAsync(targetConnectionId, waitingGroupName);
        await Groups.AddToGroupAsync(targetConnectionId, roomGroupName);

        var targetMeetings = ConnectionMeetings.GetOrAdd(targetConnectionId, _ => new ConcurrentDictionary<string, byte>());
        targetMeetings.TryAdd(meetingCode, 0);

        await Clients.Client(targetConnectionId).OnJoinRequestAdmitted(meetingCode);
        await Clients.Group(roomGroupName).OnParticipantJoined(new { connectionId = targetConnectionId, userId = parsedTargetUserId });
    }

    public async Task DenyParticipant(string meetingCode, string targetConnectionId, string? targetUserId)
    {
        if (string.IsNullOrWhiteSpace(meetingCode) || string.IsNullOrWhiteSpace(targetConnectionId))
        {
            throw new HubException("Invalid parameters.");
        }

        var meeting = await _meetingRepository.GetByCodeAsync(meetingCode);
        if (meeting == null)
        {
            throw new HubException("Meeting not found.");
        }

        var resolvedUserId = await ResolveUserIdAsync();
        var currentUserId = resolvedUserId ?? Guid.Empty;

        var isHostOrAdmin = meeting.HostUserId == currentUserId ||
                            meeting.Participants.Any(p => p.UserId == currentUserId && (p.Role == Domain.Enums.ParticipantRole.Owner || p.Role == Domain.Enums.ParticipantRole.Admin));

        if (!isHostOrAdmin)
        {
            throw new HubException("Only the meeting host or administrators can deny admission.");
        }

        var waitingGroupName = $"meet_waiting_{meetingCode}";
        await Groups.RemoveFromGroupAsync(targetConnectionId, waitingGroupName);

        await Clients.Client(targetConnectionId).OnJoinRequestDenied(meetingCode, "Your request to join the meeting was declined by the host.");
    }

    public async Task LeaveMeeting(string meetingCode)
    {
        var groupName = $"meet_{meetingCode}";
        var waitingGroupName = $"meet_waiting_{meetingCode}";

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, waitingGroupName);

        if (ConnectionMeetings.TryGetValue(Context.ConnectionId, out var meetings))
        {
            meetings.TryRemove(meetingCode, out _);
        }

        var resolvedUserId = await ResolveUserIdAsync();
        if (resolvedUserId.HasValue)
        {
            if (MeetingActiveUserConnections.TryGetValue(meetingCode, out var userConns))
            {
                userConns.TryRemove(resolvedUserId.Value, out _);
            }
            await Clients.OthersInGroup(groupName).OnParticipantLeft(resolvedUserId.Value);

            // If host left, check if other active participants are in room to reassign active host duties
            var meeting = await _meetingRepository.GetByCodeAsync(meetingCode);
            if (meeting != null && meeting.HostUserId == resolvedUserId.Value && userConns != null && !userConns.IsEmpty)
            {
                var remainingUserId = userConns.Keys.FirstOrDefault();
                if (remainingUserId != Guid.Empty)
                {
                    var newHost = await UserRepository.GetByIdAsync(remainingUserId);
                    var newHostName = newHost != null ? $"{newHost.FirstName} {newHost.LastName}".Trim() : "Participant";
                    await Clients.Group(groupName).OnHostChanged(remainingUserId, newHostName);
                }
            }
        }
    }

    public async Task SendWebRtcSignal(string targetConnectionId, string type, string payload)
    {
        var resolvedUserId = await ResolveUserIdAsync();
        var senderUserId = (resolvedUserId ?? Guid.Empty).ToString();

        if (type == "offer")
        {
            await Clients.Client(targetConnectionId).ReceiveWebRtcOffer(Context.ConnectionId, senderUserId, payload);
        }
        else if (type == "answer")
        {
            await Clients.Client(targetConnectionId).ReceiveWebRtcAnswer(Context.ConnectionId, senderUserId, payload);
        }
        else if (type == "ice")
        {
            await Clients.Client(targetConnectionId).ReceiveIceCandidate(Context.ConnectionId, senderUserId, payload);
        }
    }

    public async Task SendReaction(string meetingCode, string emoji)
    {
        if (ConnectionMeetings.TryGetValue(Context.ConnectionId, out var meetings) && meetings.ContainsKey(meetingCode))
        {
            var resolvedUserId = await ResolveUserIdAsync();
            if (resolvedUserId.HasValue)
            {
                await Clients.Group($"meet_{meetingCode}").OnReactionReceived(resolvedUserId.Value, emoji);
            }
        }
    }

    public async Task BroadcastMeetingChatMessage(string meetingCode, object message)
    {
        if (ConnectionMeetings.TryGetValue(Context.ConnectionId, out var meetings) && meetings.ContainsKey(meetingCode))
        {
            await Clients.Group($"meet_{meetingCode}").ReceiveMeetingChatMessage(message);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (ConnectionMeetings.TryRemove(Context.ConnectionId, out var meetings))
        {
            var resolvedUserId = await ResolveUserIdAsync();
            foreach (var meetingCode in meetings.Keys)
            {
                var groupName = $"meet_{meetingCode}";
                var waitingGroupName = $"meet_waiting_{meetingCode}";

                if (resolvedUserId.HasValue)
                {
                    if (MeetingActiveUserConnections.TryGetValue(meetingCode, out var userConns))
                    {
                        userConns.TryRemove(resolvedUserId.Value, out _);
                    }
                    await Clients.OthersInGroup(groupName).OnParticipantLeft(resolvedUserId.Value);
                }
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, waitingGroupName);
            }

            if (resolvedUserId.HasValue)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{resolvedUserId.Value}");
            }
        }

        await base.OnDisconnectedAsync(exception);
    }
}
