using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Enums;

namespace EDGE.Infrastructure.Hubs;

public sealed class ActiveRoomPeerState
{
    public string ConnectionId { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string Role { get; set; } = "Member";
    public bool IsMicMuted { get; set; }
    public bool IsVideoMuted { get; set; }
    public bool IsScreenSharing { get; set; }
    public string? ScreenStreamId { get; set; }
    public bool IsHandRaised { get; set; }
    public int? HandRaiseQueuePosition { get; set; }
    public bool IsMutedByHost { get; set; }
    public bool IsSpotlighted { get; set; }
}

public sealed class WaitingRoomEntry
{
    public string ConnectionId { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = "Guest User";
    public string? AvatarUrl { get; set; }
    public string MeetingCode { get; set; } = string.Empty;
    public DateTimeOffset RequestedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class RoomRecordingInfo
{
    public bool IsRecording { get; set; }
    public string HostConnectionId { get; set; } = string.Empty;
    public string HostUserName { get; set; } = string.Empty;
}

public sealed class RoomChatReactionEntry
{
    public string Emoji { get; set; } = string.Empty;
    public List<string> Users { get; set; } = new();
}

public sealed class RoomChatMessageEntry
{
    public string Id { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Timestamp { get; set; } = string.Empty;
    public bool IsEdited { get; set; }
    public bool IsUnsent { get; set; }
    public List<RoomChatReactionEntry> Reactions { get; set; } = new();
}

[Authorize]
public class MeetingHub : AuthenticatedHub<IMeetingClient>
{
    private const int MaxRoomChatHistory = 100;

    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> ConnectionMeetings = new();
    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<Guid, string>> MeetingActiveUserConnections = new();
    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, ActiveRoomPeerState>> RoomActivePeers = new();
    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, WaitingRoomEntry>> RoomWaitingQueues = new();
    private static readonly ConcurrentDictionary<string, RoomRecordingInfo> RoomRecordings = new();
    private static readonly ConcurrentDictionary<string, List<RoomChatMessageEntry>> RoomChatHistories = new();

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

    public static void ClearRoomState(string meetingCode)
    {
        if (string.IsNullOrWhiteSpace(meetingCode)) return;
        MeetingActiveUserConnections.TryRemove(meetingCode, out _);
        RoomActivePeers.TryRemove(meetingCode, out _);
        RoomWaitingQueues.TryRemove(meetingCode, out _);
        RoomRecordings.TryRemove(meetingCode, out _);
        RoomChatHistories.TryRemove(meetingCode, out _);
    }

    public static List<string> EvictUserConnections(string meetingCode, Guid targetUserId)
    {
        var evicted = new List<string>();
        if (MeetingActiveUserConnections.TryGetValue(meetingCode, out var userConns) &&
            userConns.TryRemove(targetUserId, out var connId))
        {
            evicted.Add(connId);
        }

        if (RoomActivePeers.TryGetValue(meetingCode, out var peers))
        {
            foreach (var kv in peers.Where(p => p.Value.UserId == targetUserId).ToList())
            {
                if (peers.TryRemove(kv.Key, out _) && !evicted.Contains(kv.Key))
                {
                    evicted.Add(kv.Key);
                }
            }
        }

        return evicted;
    }

    public static void SyncHandRaiseState(string meetingCode, Guid userId, bool isRaised, int? queuePos)
    {
        if (!RoomActivePeers.TryGetValue(meetingCode, out var peers)) return;
        foreach (var peer in peers.Values.Where(p => p.UserId == userId))
        {
            peer.IsHandRaised = isRaised;
            peer.HandRaiseQueuePosition = queuePos;
        }
    }

    public static void SyncHostMuteState(string meetingCode, Guid? targetUserId, Guid mutedByUserId)
    {
        if (!RoomActivePeers.TryGetValue(meetingCode, out var peers)) return;
        foreach (var peer in peers.Values)
        {
            if (targetUserId.HasValue)
            {
                if (peer.UserId == targetUserId.Value)
                {
                    peer.IsMutedByHost = true;
                    peer.IsMicMuted = true;
                }
            }
            else if (peer.UserId != mutedByUserId)
            {
                peer.IsMutedByHost = true;
                peer.IsMicMuted = true;
            }
        }
    }

    public static void SyncSpotlightState(string meetingCode, Guid? targetUserId)
    {
        if (!RoomActivePeers.TryGetValue(meetingCode, out var peers)) return;
        foreach (var peer in peers.Values)
        {
            peer.IsSpotlighted = targetUserId.HasValue && peer.UserId == targetUserId.Value;
        }
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

        if (meeting.Status == MeetingStatus.Ended || meeting.Status == MeetingStatus.Cancelled)
        {
            throw new HubException("This meeting has already ended.");
        }

        var resolvedUserId = await ResolveUserIdAsync();
        var userId = resolvedUserId ?? Guid.Empty;

        var dbParticipant = resolvedUserId.HasValue
            ? meeting.Participants.FirstOrDefault(p => p.UserId == userId && !p.IsDeleted)
            : null;

        var isAuthorized = meeting.Scope == ConversationScope.InterRegional ||
                           meeting.AllowExternalGuests ||
                           (resolvedUserId.HasValue && (meeting.HostUserId == userId || dbParticipant != null));

        if (!isAuthorized)
        {
            throw new HubException("Access denied: You are not authorized to join this meeting room.");
        }

        if (resolvedUserId.HasValue && resolvedUserId.Value != Guid.Empty)
        {
            var userConns = MeetingActiveUserConnections.GetOrAdd(meetingCode, _ => new ConcurrentDictionary<Guid, string>());
            if (userConns.TryGetValue(resolvedUserId.Value, out var existingConnId) && existingConnId != Context.ConnectionId)
            {
                if (RoomActivePeers.TryGetValue(meetingCode, out var checkPeers) && checkPeers.ContainsKey(existingConnId))
                {
                    await Clients.Caller.OnExistingSessionDetected(meetingCode, existingConnId);
                    return;
                }
            }
            userConns[resolvedUserId.Value] = Context.ConnectionId;
        }

        // Transition Scheduled -> Live when first participant enters
        var needsSave = false;
        if (meeting.Status == MeetingStatus.Scheduled)
        {
            meeting.Status = MeetingStatus.Live;
            meeting.ActualStartTime ??= DateTimeOffset.UtcNow;
            needsSave = true;
        }

        if (dbParticipant != null && dbParticipant.JoinedAt == null)
        {
            dbParticipant.JoinedAt = DateTimeOffset.UtcNow;
            dbParticipant.LeftAt = null;
            needsSave = true;
        }
        else if (dbParticipant == null && resolvedUserId.HasValue && resolvedUserId.Value != Guid.Empty)
        {
            dbParticipant = new Domain.Entities.MeetingParticipant
            {
                MeetingId = meeting.Id,
                UserId = userId,
                TenantId = meeting.TenantId,
                Role = meeting.HostUserId == userId ? ParticipantRole.Owner : ParticipantRole.Member,
                JoinedAt = DateTimeOffset.UtcNow,
                IsDeleted = false,
                IsDeletedBy = string.Empty
            };
            meeting.Participants.Add(dbParticipant);
            needsSave = true;
        }

        if (needsSave)
        {
            await _unitOfWork.SaveChangesAsync();
        }

        await CompleteRoomJoinAsync(meeting, userId, dbParticipant);
    }

    private async Task CompleteRoomJoinAsync(Domain.Entities.Meeting meeting, Guid userId, Domain.Entities.MeetingParticipant? dbParticipant)
    {
        var meetingCode = meeting.MeetingCode;
        var user = userId != Guid.Empty ? await UserRepository.GetByIdAsync(userId) : null;
        var fullName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Participant";
        if (string.IsNullOrWhiteSpace(fullName)) fullName = "Participant";

        var roleName = meeting.HostUserId == userId
            ? ParticipantRole.Owner.ToString()
            : (dbParticipant?.Role.ToString() ?? ParticipantRole.Member.ToString());

        var peerState = new ActiveRoomPeerState
        {
            ConnectionId = Context.ConnectionId,
            UserId = userId,
            FullName = fullName,
            Email = user?.Email ?? string.Empty,
            AvatarUrl = user?.ProfilePicture,
            Role = roleName,
            IsMicMuted = dbParticipant?.IsMutedByHost ?? false,
            IsVideoMuted = false,
            IsScreenSharing = false,
            IsHandRaised = dbParticipant?.IsHandRaised ?? false,
            HandRaiseQueuePosition = dbParticipant?.HandRaiseQueuePosition,
            IsMutedByHost = dbParticipant?.IsMutedByHost ?? false,
            IsSpotlighted = dbParticipant?.IsSpotlighted ?? false
        };

        var peers = RoomActivePeers.GetOrAdd(meetingCode, _ => new ConcurrentDictionary<string, ActiveRoomPeerState>());
        // Remove any stale peer entries for this same user
        if (userId != Guid.Empty)
        {
            foreach (var stale in peers.Where(kv => kv.Value.UserId == userId && kv.Key != Context.ConnectionId).ToList())
            {
                peers.TryRemove(stale.Key, out _);
            }
        }
        peers[Context.ConnectionId] = peerState;

        var groupName = $"meet_{meetingCode}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        var meetings = ConnectionMeetings.GetOrAdd(Context.ConnectionId, _ => new ConcurrentDictionary<string, byte>());
        meetings.TryAdd(meetingCode, 0);

        var isHostOrAdmin = meeting.HostUserId == userId ||
                            roleName == ParticipantRole.Owner.ToString() ||
                            roleName == ParticipantRole.Admin.ToString();

        var existingPeers = peers.Values
            .Where(p => p.ConnectionId != Context.ConnectionId)
            .ToList();

        var waitingList = isHostOrAdmin && RoomWaitingQueues.TryGetValue(meetingCode, out var wq)
            ? wq.Values.OrderBy(w => w.RequestedAt).ToList()
            : new List<WaitingRoomEntry>();

        List<object> chatSnapshot;
        if (RoomChatHistories.TryGetValue(meetingCode, out var history))
        {
            lock (history)
            {
                chatSnapshot = history.Select(ToChatPayload).ToList();
            }
        }
        else
        {
            chatSnapshot = new List<object>();
        }

        RoomRecordings.TryGetValue(meetingCode, out var recInfo);

        await Clients.Caller.OnRoomJoinedSnapshot(new
        {
            meetingCode,
            selfConnectionId = Context.ConnectionId,
            activePeers = existingPeers,
            waitingRequests = waitingList,
            chatMessages = chatSnapshot,
            isRecording = recInfo?.IsRecording ?? false,
            recordingHostName = recInfo?.HostUserName ?? string.Empty
        });

        await Clients.OthersInGroup(groupName).OnParticipantJoined(new
        {
            connectionId = peerState.ConnectionId,
            userId = peerState.UserId,
            fullName = peerState.FullName,
            email = peerState.Email,
            avatarUrl = peerState.AvatarUrl,
            role = peerState.Role,
            isMicMuted = peerState.IsMicMuted,
            isVideoMuted = peerState.IsVideoMuted,
            isScreenSharing = peerState.IsScreenSharing,
            screenStreamId = peerState.ScreenStreamId,
            isHandRaised = peerState.IsHandRaised,
            handRaiseQueuePosition = peerState.HandRaiseQueuePosition,
            isMutedByHost = peerState.IsMutedByHost,
            isSpotlighted = peerState.IsSpotlighted
        });
    }

    public async Task SwitchDevice(string meetingCode)
    {
        if (string.IsNullOrWhiteSpace(meetingCode)) return;

        var meeting = await _meetingRepository.GetByCodeAsync(meetingCode);
        if (meeting == null) return;

        var resolvedUserId = await ResolveUserIdAsync();
        var userId = resolvedUserId ?? Guid.Empty;

        if (resolvedUserId.HasValue && MeetingActiveUserConnections.TryGetValue(meetingCode, out var userConns))
        {
            if (userConns.TryGetValue(resolvedUserId.Value, out var oldConnId) && oldConnId != Context.ConnectionId)
            {
                await Clients.Client(oldConnId).OnSessionSwitchedToAnotherDevice(meetingCode);
                if (ConnectionMeetings.TryGetValue(oldConnId, out var oldMeetings))
                {
                    oldMeetings.TryRemove(meetingCode, out _);
                }
                if (RoomActivePeers.TryGetValue(meetingCode, out var peers))
                {
                    peers.TryRemove(oldConnId, out _);
                }
                await Groups.RemoveFromGroupAsync(oldConnId, $"meet_{meetingCode}");
            }
            userConns[resolvedUserId.Value] = Context.ConnectionId;
        }

        var dbParticipant = resolvedUserId.HasValue
            ? meeting.Participants.FirstOrDefault(p => p.UserId == userId && !p.IsDeleted)
            : null;

        await CompleteRoomJoinAsync(meeting, userId, dbParticipant);
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

        var isAlreadyAuthorized = meeting.Scope == ConversationScope.InterRegional ||
                                  meeting.AllowExternalGuests ||
                                  (resolvedUserId.HasValue && (meeting.HostUserId == userId || meeting.Participants.Any(p => p.UserId == userId && !p.IsDeleted)));

        if (isAlreadyAuthorized)
        {
            await JoinMeeting(meetingCode);
            await Clients.Caller.OnJoinRequestAdmitted(meetingCode);
            return;
        }

        var waitingGroupName = $"meet_waiting_{meetingCode}";
        await Groups.AddToGroupAsync(Context.ConnectionId, waitingGroupName);

        var meetings = ConnectionMeetings.GetOrAdd(Context.ConnectionId, _ => new ConcurrentDictionary<string, byte>());
        meetings.TryAdd(meetingCode, 0);

        var user = resolvedUserId.HasValue ? await UserRepository.GetByIdAsync(resolvedUserId.Value) : null;
        var userName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Guest User";
        if (string.IsNullOrWhiteSpace(userName)) userName = "Guest User";
        var avatarUrl = user?.ProfilePicture;

        var entry = new WaitingRoomEntry
        {
            ConnectionId = Context.ConnectionId,
            UserId = userId,
            UserName = userName,
            AvatarUrl = avatarUrl,
            MeetingCode = meetingCode,
            RequestedAt = DateTimeOffset.UtcNow
        };

        var queue = RoomWaitingQueues.GetOrAdd(meetingCode, _ => new ConcurrentDictionary<string, WaitingRoomEntry>());
        queue[Context.ConnectionId] = entry;

        var roomGroupName = $"meet_{meetingCode}";
        await Clients.Group(roomGroupName).OnJoinRequested(new
        {
            connectionId = entry.ConnectionId,
            userId = entry.UserId,
            userName = entry.UserName,
            avatarUrl = entry.AvatarUrl,
            meetingCode
        });

        await Clients.Group(roomGroupName).OnWaitingQueueUpdated(queue.Values.OrderBy(w => w.RequestedAt).ToList());
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
                            meeting.Participants.Any(p => p.UserId == currentUserId && !p.IsDeleted && (p.Role == ParticipantRole.Owner || p.Role == ParticipantRole.Admin));

        if (!isHostOrAdmin)
        {
            throw new HubException("Only the meeting host or administrators can admit participants.");
        }

        Guid parsedTargetUserId = Guid.Empty;
        if (!string.IsNullOrWhiteSpace(targetUserId) && Guid.TryParse(targetUserId, out var g))
        {
            parsedTargetUserId = g;
        }

        WaitingRoomEntry? waitingEntry = null;
        if (RoomWaitingQueues.TryGetValue(meetingCode, out var queue))
        {
            queue.TryRemove(targetConnectionId, out waitingEntry);
        }

        if (parsedTargetUserId == Guid.Empty && waitingEntry != null)
        {
            parsedTargetUserId = waitingEntry.UserId;
        }

        if (parsedTargetUserId != Guid.Empty)
        {
            var existing = meeting.Participants.FirstOrDefault(p => p.UserId == parsedTargetUserId);
            if (existing != null)
            {
                existing.IsDeleted = false;
                existing.LeftAt = null;
            }
            else
            {
                meeting.Participants.Add(new Domain.Entities.MeetingParticipant
                {
                    MeetingId = meeting.Id,
                    UserId = parsedTargetUserId,
                    TenantId = meeting.TenantId,
                    Role = ParticipantRole.Member,
                    IsDeleted = false,
                    IsDeletedBy = string.Empty
                });
            }
            await _unitOfWork.SaveChangesAsync();

            var userConns = MeetingActiveUserConnections.GetOrAdd(meetingCode, _ => new ConcurrentDictionary<Guid, string>());
            userConns[parsedTargetUserId] = targetConnectionId;
        }

        var waitingGroupName = $"meet_waiting_{meetingCode}";
        var roomGroupName = $"meet_{meetingCode}";

        await Groups.RemoveFromGroupAsync(targetConnectionId, waitingGroupName);

        var updatedQueue = queue != null ? queue.Values.OrderBy(w => w.RequestedAt).ToList() : new List<WaitingRoomEntry>();
        await Clients.Group(roomGroupName).OnWaitingQueueUpdated(updatedQueue);

        // Notify admitted client so they invoke JoinMeeting (receiving full room snapshot + broadcasting their full profile)
        await Clients.Client(targetConnectionId).OnJoinRequestAdmitted(meetingCode);
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
                            meeting.Participants.Any(p => p.UserId == currentUserId && !p.IsDeleted && (p.Role == ParticipantRole.Owner || p.Role == ParticipantRole.Admin));

        if (!isHostOrAdmin)
        {
            throw new HubException("Only the meeting host or administrators can deny admission.");
        }

        WaitingRoomEntry? removed = null;
        if (RoomWaitingQueues.TryGetValue(meetingCode, out var queue))
        {
            queue.TryRemove(targetConnectionId, out removed);
        }

        var waitingGroupName = $"meet_waiting_{meetingCode}";
        var roomGroupName = $"meet_{meetingCode}";
        await Groups.RemoveFromGroupAsync(targetConnectionId, waitingGroupName);

        var updatedQueue = queue != null ? queue.Values.OrderBy(w => w.RequestedAt).ToList() : new List<WaitingRoomEntry>();
        await Clients.Group(roomGroupName).OnWaitingQueueUpdated(updatedQueue);

        await Clients.Client(targetConnectionId).OnJoinRequestDenied(meetingCode, "Your request to join the meeting was declined by the host.");
    }

    public async Task DeclineIncomingCall(string meetingCode)
    {
        if (string.IsNullOrWhiteSpace(meetingCode)) return;

        var resolvedUserId = await ResolveUserIdAsync();
        var userId = resolvedUserId ?? Guid.Empty;
        var user = resolvedUserId.HasValue ? await UserRepository.GetByIdAsync(resolvedUserId.Value) : null;
        var userName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Colleague";
        if (string.IsNullOrWhiteSpace(userName)) userName = "Colleague";

        var meeting = await _meetingRepository.GetByCodeAsync(meetingCode);
        await Clients.Group($"meet_{meetingCode}").OnCallDeclined(meetingCode, userId, userName);
        if (meeting != null)
        {
            await Clients.Group($"user_{meeting.HostUserId}").OnCallDeclined(meetingCode, userId, userName);
        }
    }

    public async Task UpdateMediaState(string meetingCode, bool isMicMuted, bool isVideoMuted, bool isScreenSharing, string? screenStreamId)
    {
        if (string.IsNullOrWhiteSpace(meetingCode)) return;

        var resolvedUserId = await ResolveUserIdAsync();
        var userId = resolvedUserId ?? Guid.Empty;

        if (RoomActivePeers.TryGetValue(meetingCode, out var peers) &&
            peers.TryGetValue(Context.ConnectionId, out var peer))
        {
            peer.IsMicMuted = isMicMuted;
            peer.IsVideoMuted = isVideoMuted;
            peer.IsScreenSharing = isScreenSharing;
            peer.ScreenStreamId = isScreenSharing ? screenStreamId : null;
            if (!isMicMuted)
            {
                peer.IsMutedByHost = false;
            }
        }

        await Clients.Group($"meet_{meetingCode}").OnParticipantMediaStateChanged(new
        {
            connectionId = Context.ConnectionId,
            userId,
            isMicMuted,
            isVideoMuted,
            isScreenSharing,
            screenStreamId = isScreenSharing ? screenStreamId : null
        });
    }

    public async Task UpdateRecordingState(string meetingCode, bool isRecording)
    {
        if (string.IsNullOrWhiteSpace(meetingCode)) return;

        var resolvedUserId = await ResolveUserIdAsync();
        var userId = resolvedUserId ?? Guid.Empty;
        var user = resolvedUserId.HasValue ? await UserRepository.GetByIdAsync(resolvedUserId.Value) : null;
        var hostName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : "Host";
        if (string.IsNullOrWhiteSpace(hostName)) hostName = "Host";

        if (isRecording)
        {
            RoomRecordings[meetingCode] = new RoomRecordingInfo
            {
                IsRecording = true,
                HostConnectionId = Context.ConnectionId,
                HostUserName = hostName
            };
        }
        else
        {
            RoomRecordings.TryRemove(meetingCode, out _);
        }

        await Clients.Group($"meet_{meetingCode}").OnRecordingStateChanged(isRecording, hostName);
    }

    public async Task LeaveMeeting(string meetingCode)
    {
        if (string.IsNullOrWhiteSpace(meetingCode)) return;

        var groupName = $"meet_{meetingCode}";
        var waitingGroupName = $"meet_waiting_{meetingCode}";

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, waitingGroupName);

        if (ConnectionMeetings.TryGetValue(Context.ConnectionId, out var meetings))
        {
            meetings.TryRemove(meetingCode, out _);
        }

        if (RoomActivePeers.TryGetValue(meetingCode, out var peers))
        {
            peers.TryRemove(Context.ConnectionId, out _);
        }

        if (RoomWaitingQueues.TryGetValue(meetingCode, out var queue) &&
            queue.TryRemove(Context.ConnectionId, out _))
        {
            await Clients.Group(groupName).OnWaitingQueueUpdated(queue.Values.OrderBy(w => w.RequestedAt).ToList());
        }

        if (RoomRecordings.TryGetValue(meetingCode, out var recInfo) && recInfo.HostConnectionId == Context.ConnectionId)
        {
            RoomRecordings.TryRemove(meetingCode, out _);
            await Clients.Group(groupName).OnRecordingStateChanged(false, recInfo.HostUserName);
        }

        var resolvedUserId = await ResolveUserIdAsync();
        if (resolvedUserId.HasValue)
        {
            if (MeetingActiveUserConnections.TryGetValue(meetingCode, out var userConns))
            {
                userConns.TryRemove(new KeyValuePair<Guid, string>(resolvedUserId.Value, Context.ConnectionId));
            }
            await Clients.OthersInGroup(groupName).OnParticipantLeft(resolvedUserId.Value);

            var meeting = await _meetingRepository.GetByCodeAsync(meetingCode);
            if (meeting != null && meeting.HostUserId == resolvedUserId.Value &&
                MeetingActiveUserConnections.TryGetValue(meetingCode, out var activeConns) && !activeConns.IsEmpty)
            {
                var remainingUserId = activeConns.Keys.FirstOrDefault();
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
            var parsed = ParseIncomingChatMessage(message);
            if (parsed != null)
            {
                var history = RoomChatHistories.GetOrAdd(meetingCode, _ => new List<RoomChatMessageEntry>());
                lock (history)
                {
                    history.Add(parsed);
                    if (history.Count > MaxRoomChatHistory)
                    {
                        history.RemoveAt(0);
                    }
                }
            }

            await Clients.Group($"meet_{meetingCode}").ReceiveMeetingChatMessage(message);
        }
    }

    public async Task BroadcastMeetingChatEdited(string meetingCode, object payload)
    {
        if (ConnectionMeetings.TryGetValue(Context.ConnectionId, out var meetings) && meetings.ContainsKey(meetingCode))
        {
            if (TryReadJsonProps(payload, out var doc) && doc != null)
            {
                using (doc)
                {
                    var root = doc.RootElement;
                    var msgId = TryGetString(root, "messageId");
                    var newContent = TryGetString(root, "content");
                    if (!string.IsNullOrEmpty(msgId) && newContent != null &&
                        RoomChatHistories.TryGetValue(meetingCode, out var history))
                    {
                        lock (history)
                        {
                            var found = history.FirstOrDefault(m => m.Id == msgId);
                            if (found != null && !found.IsUnsent)
                            {
                                found.Content = newContent;
                                found.IsEdited = true;
                            }
                        }
                    }
                }
            }

            await Clients.Group($"meet_{meetingCode}").ReceiveMeetingChatEdited(payload);
        }
    }

    public async Task BroadcastMeetingChatUnsent(string meetingCode, object payload)
    {
        if (ConnectionMeetings.TryGetValue(Context.ConnectionId, out var meetings) && meetings.ContainsKey(meetingCode))
        {
            if (TryReadJsonProps(payload, out var doc) && doc != null)
            {
                using (doc)
                {
                    var msgId = TryGetString(doc.RootElement, "messageId");
                    if (!string.IsNullOrEmpty(msgId) &&
                        RoomChatHistories.TryGetValue(meetingCode, out var history))
                    {
                        lock (history)
                        {
                            var found = history.FirstOrDefault(m => m.Id == msgId);
                            if (found != null)
                            {
                                found.Content = "This message was unsent";
                                found.IsUnsent = true;
                            }
                        }
                    }
                }
            }

            await Clients.Group($"meet_{meetingCode}").ReceiveMeetingChatUnsent(payload);
        }
    }

    public async Task BroadcastMeetingChatReaction(string meetingCode, object payload)
    {
        if (ConnectionMeetings.TryGetValue(Context.ConnectionId, out var meetings) && meetings.ContainsKey(meetingCode))
        {
            if (TryReadJsonProps(payload, out var doc) && doc != null)
            {
                using (doc)
                {
                    var root = doc.RootElement;
                    var msgId = TryGetString(root, "messageId");
                    var emoji = TryGetString(root, "emoji");
                    var userName = TryGetString(root, "userName");
                    if (!string.IsNullOrEmpty(msgId) && !string.IsNullOrEmpty(emoji) && !string.IsNullOrEmpty(userName) &&
                        RoomChatHistories.TryGetValue(meetingCode, out var history))
                    {
                        lock (history)
                        {
                            var found = history.FirstOrDefault(m => m.Id == msgId);
                            if (found != null)
                            {
                                var reaction = found.Reactions.FirstOrDefault(r => r.Emoji == emoji);
                                if (reaction != null)
                                {
                                    if (reaction.Users.Contains(userName))
                                    {
                                        reaction.Users.Remove(userName);
                                        if (reaction.Users.Count == 0) found.Reactions.Remove(reaction);
                                    }
                                    else
                                    {
                                        reaction.Users.Add(userName);
                                    }
                                }
                                else
                                {
                                    found.Reactions.Add(new RoomChatReactionEntry { Emoji = emoji, Users = new List<string> { userName } });
                                }
                            }
                        }
                    }
                }
            }

            await Clients.Group($"meet_{meetingCode}").ReceiveMeetingChatReaction(payload);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var resolvedUserId = await ResolveUserIdAsync();

        if (ConnectionMeetings.TryRemove(Context.ConnectionId, out var meetings))
        {
            foreach (var meetingCode in meetings.Keys)
            {
                var groupName = $"meet_{meetingCode}";
                var waitingGroupName = $"meet_waiting_{meetingCode}";

                if (RoomActivePeers.TryGetValue(meetingCode, out var peers))
                {
                    peers.TryRemove(Context.ConnectionId, out _);
                }

                if (RoomWaitingQueues.TryGetValue(meetingCode, out var queue) &&
                    queue.TryRemove(Context.ConnectionId, out _))
                {
                    await Clients.Group(groupName).OnWaitingQueueUpdated(queue.Values.OrderBy(w => w.RequestedAt).ToList());
                }

                if (RoomRecordings.TryGetValue(meetingCode, out var recInfo) && recInfo.HostConnectionId == Context.ConnectionId)
                {
                    RoomRecordings.TryRemove(meetingCode, out _);
                    await Clients.Group(groupName).OnRecordingStateChanged(false, recInfo.HostUserName);
                }

                if (resolvedUserId.HasValue)
                {
                    var wasActiveConnection = true;
                    if (MeetingActiveUserConnections.TryGetValue(meetingCode, out var userConns))
                    {
                        wasActiveConnection = userConns.TryRemove(new KeyValuePair<Guid, string>(resolvedUserId.Value, Context.ConnectionId));
                    }
                    if (wasActiveConnection)
                    {
                        await Clients.OthersInGroup(groupName).OnParticipantLeft(resolvedUserId.Value);
                    }
                }

                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, waitingGroupName);
            }
        }

        if (resolvedUserId.HasValue)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{resolvedUserId.Value}");
        }

        await base.OnDisconnectedAsync(exception);
    }

    private static RoomChatMessageEntry? ParseIncomingChatMessage(object message)
    {
        if (!TryReadJsonProps(message, out var doc) || doc == null) return null;
        using (doc)
        {
            var root = doc.RootElement;
            var content = TryGetString(root, "content");
            if (string.IsNullOrWhiteSpace(content)) return null;
            return new RoomChatMessageEntry
            {
                Id = TryGetString(root, "id") ?? $"{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                SenderName = TryGetString(root, "senderName") ?? "Participant",
                Content = content,
                Timestamp = TryGetString(root, "timestamp") ?? DateTimeOffset.UtcNow.ToString("t")
            };
        }
    }

    private static object ToChatPayload(RoomChatMessageEntry entry) => new
    {
        id = entry.Id,
        senderName = entry.SenderName,
        content = entry.Content,
        timestamp = entry.Timestamp,
        isEdited = entry.IsEdited,
        isUnsent = entry.IsUnsent,
        reactions = entry.Reactions.Select(r => new
        {
            emoji = r.Emoji,
            count = r.Users.Count,
            users = r.Users
        }).ToList()
    };

    private static bool TryReadJsonProps(object payload, out JsonDocument? doc)
    {
        doc = null;
        try
        {
            if (payload is JsonElement je && je.ValueKind == JsonValueKind.Object)
            {
                doc = JsonDocument.Parse(je.GetRawText());
                return true;
            }
            var raw = JsonSerializer.Serialize(payload);
            doc = JsonDocument.Parse(raw);
            return doc.RootElement.ValueKind == JsonValueKind.Object;
        }
        catch
        {
            return false;
        }
    }

    private static string? TryGetString(JsonElement root, string propName)
    {
        if (root.TryGetProperty(propName, out var el) && el.ValueKind == JsonValueKind.String)
        {
            return el.GetString();
        }
        return null;
    }
}
