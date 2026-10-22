namespace EDGE.Infrastructure.Hubs;

public interface IMeetingClient
{
    Task ReceiveWebRtcOffer(string senderConnectionId, string senderUserId, string sdp);
    Task ReceiveWebRtcAnswer(string senderConnectionId, string senderUserId, string sdp);
    Task ReceiveIceCandidate(string senderConnectionId, string senderUserId, string candidateJson);

    Task OnUserRaisedHand(Guid userId, string userName, int queuePosition);
    Task OnUserLoweredHand(Guid userId);
    Task OnReactionReceived(Guid userId, string emoji);
    Task ReceiveMeetingChatMessage(object message);

    Task OnPollCreated(object poll);
    Task OnPollVoteUpdated(Guid pollId, object results);
    Task OnPollClosed(Guid pollId);

    Task OnParticipantMuted(Guid targetUserId, Guid mutedByUserId);
    Task OnSpeakerSpotlighted(Guid targetUserId);
    Task OnParticipantJoined(object participant);
    Task OnParticipantLeft(Guid userId);

    Task OnJoinRequested(object request);
    Task OnJoinRequestPending(string meetingCode);
    Task OnJoinRequestAdmitted(string meetingCode);
    Task OnJoinRequestDenied(string meetingCode, string reason);

    Task OnIncomingCall(object incomingCallInfo);
    Task OnMeetingEnded(string meetingCode);
    Task OnExistingSessionDetected(string meetingCode, string existingConnectionId);
    Task OnSessionSwitchedToAnotherDevice(string meetingCode);
    Task OnHostChanged(Guid newHostUserId, string newHostUserName);
}

