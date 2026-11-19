import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { getLatestToken } from './tokenManager';
import { ChatMessage } from './chatService';
import { MeetingPoll } from './meetService';

export type RealTimeConnectionStatus = 'Disconnected' | 'Connecting' | 'Connected' | 'Reconnecting';

export interface ActiveRoomPeerSnapshot {
  connectionId: string;
  userId: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
  role?: 'Member' | 'Admin' | 'Owner' | string;
  isMicMuted?: boolean;
  isVideoMuted?: boolean;
  isScreenSharing?: boolean;
  screenStreamId?: string | null;
  isHandRaised?: boolean;
  handRaiseQueuePosition?: number | null;
  isMutedByHost?: boolean;
  isSpotlighted?: boolean;
}

export interface WaitingRoomRequestItem {
  connectionId: string;
  userId: string;
  userName: string;
  avatarUrl?: string | null;
  meetingCode: string;
}

export interface RoomChatReactionSnapshot {
  emoji: string;
  count: number;
  users: string[];
}

export interface RoomChatMessageSnapshot {
  id: string;
  senderName: string;
  content: string;
  timestamp: string;
  isEdited?: boolean;
  isUnsent?: boolean;
  reactions?: RoomChatReactionSnapshot[];
}

export interface RoomJoinedSnapshot {
  meetingCode: string;
  selfConnectionId: string;
  activePeers: ActiveRoomPeerSnapshot[];
  waitingRequests: WaitingRoomRequestItem[];
  chatMessages: RoomChatMessageSnapshot[];
  isRecording: boolean;
  recordingHostName: string;
}

export interface ParticipantMediaStatePayload {
  connectionId: string;
  userId: string;
  isMicMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  screenStreamId?: string | null;
}

const getBaseHubUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:5000';
};

class RealTimeManager {
  private chatHub: HubConnection | null = null;
  private chatConnectPromise: Promise<HubConnection> | null = null;
  private meetHub: HubConnection | null = null;
  private meetConnectPromise: Promise<HubConnection> | null = null;
  private activeMeetingCodes = new Set<string>();

  private chatStatus: RealTimeConnectionStatus = 'Disconnected';
  private meetStatus: RealTimeConnectionStatus = 'Disconnected';
  private statusListeners = new Set<(status: RealTimeConnectionStatus) => void>();
  private meetStatusListeners = new Set<(status: RealTimeConnectionStatus) => void>();
  private meetReconnectedListeners = new Set<(newConnectionId: string) => void>();

  public getChatStatus(): RealTimeConnectionStatus {
    return this.chatStatus;
  }

  public getMeetStatus(): RealTimeConnectionStatus {
    return this.meetStatus;
  }

  public subscribeStatus(listener: (status: RealTimeConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.chatStatus);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public subscribeMeetStatus(listener: (status: RealTimeConnectionStatus) => void): () => void {
    this.meetStatusListeners.add(listener);
    listener(this.meetStatus);
    return () => {
      this.meetStatusListeners.delete(listener);
    };
  }

  public onMeetReconnected(listener: (newConnectionId: string) => void): () => void {
    this.meetReconnectedListeners.add(listener);
    return () => {
      this.meetReconnectedListeners.delete(listener);
    };
  }

  private notifyStatus(status: RealTimeConnectionStatus) {
    this.chatStatus = status;
    this.statusListeners.forEach((l) => l(status));
  }

  private notifyMeetStatus(status: RealTimeConnectionStatus) {
    this.meetStatus = status;
    this.meetStatusListeners.forEach((l) => l(status));
  }

  // ─── CHAT HUB ─────────────────────────────────────────────────────────────

  public async getChatConnection(): Promise<HubConnection> {
    if (this.chatHub && this.chatHub.state === HubConnectionState.Connected) {
      return this.chatHub;
    }

    if (this.chatConnectPromise !== null) {
      return this.chatConnectPromise;
    }

    this.chatConnectPromise = (async () => {
      if (this.chatHub) {
        try {
          await this.chatHub.stop();
        } catch {
          // Ignore stop error
        }
      }

      const hubUrl = `${getBaseHubUrl()}/hubs/chat`;
      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: async () => {
            const token = await getLatestToken();
            return token ?? '';
          },
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(LogLevel.Warning)
        .build();

      connection.onreconnecting(() => {
        this.notifyStatus('Reconnecting');
      });

      connection.onreconnected(() => {
        this.notifyStatus('Connected');
      });

      connection.onclose(() => {
        this.notifyStatus('Disconnected');
      });

      this.chatHub = connection;
      this.notifyStatus('Connecting');

      try {
        await connection.start();
        this.notifyStatus('Connected');
      } catch (err) {
        this.notifyStatus('Disconnected');
        console.warn('[RealTimeManager] Failed to start ChatHub connection:', err);
      } finally {
        this.chatConnectPromise = null;
      }

      return connection;
    })();

    return this.chatConnectPromise;
  }

  public async joinConversation(conversationId: string): Promise<void> {
    const conn = await this.getChatConnection();
    if (conn.state === HubConnectionState.Connected) {
      await conn.invoke('JoinConversation', conversationId);
    }
  }

  public async leaveConversation(conversationId: string): Promise<void> {
    if (this.chatHub && this.chatHub.state === HubConnectionState.Connected) {
      await this.chatHub.invoke('LeaveConversation', conversationId);
    }
  }

  public async sendTyping(conversationId: string, userName: string): Promise<void> {
    if (this.chatHub && this.chatHub.state === HubConnectionState.Connected) {
      await this.chatHub.invoke('SendTyping', conversationId, userName);
    }
  }

  public async stopTyping(conversationId: string): Promise<void> {
    if (this.chatHub && this.chatHub.state === HubConnectionState.Connected) {
      await this.chatHub.invoke('StopTyping', conversationId);
    }
  }

  private createListener<TArgs extends unknown[]>(
    getConnection: () => Promise<HubConnection>,
    methodName: string,
    handler: (...args: TArgs) => void
  ): () => void {
    let isCancelled = false;
    let registeredConn: HubConnection | null = null;

    void getConnection().then((conn) => {
      if (isCancelled) return;
      registeredConn = conn;
      conn.on(methodName, handler);
    });

    return () => {
      isCancelled = true;
      if (registeredConn) {
        registeredConn.off(methodName, handler);
      }
    };
  }

  public onReceiveMessage(handler: (message: ChatMessage) => void): () => void {
    return this.createListener(() => this.getChatConnection(), 'ReceiveMessage', handler);
  }

  public onUserTyping(handler: (conversationId: string, userId: string, userName: string) => void): () => void {
    return this.createListener(() => this.getChatConnection(), 'UserTyping', handler);
  }

  public onUserStoppedTyping(handler: (conversationId: string, userId: string) => void): () => void {
    return this.createListener(() => this.getChatConnection(), 'UserStoppedTyping', handler);
  }

  public onConversationUpdated(handler: (conversationId: string) => void): () => void {
    return this.createListener(() => this.getChatConnection(), 'ConversationUpdated', handler);
  }

  // ─── MEET HUB ─────────────────────────────────────────────────────────────

  public async getMeetConnection(): Promise<HubConnection> {
    if (this.meetHub && this.meetHub.state === HubConnectionState.Connected) {
      return this.meetHub;
    }

    if (this.meetConnectPromise !== null) {
      return this.meetConnectPromise;
    }

    this.meetConnectPromise = (async () => {
      if (this.meetHub) {
        try {
          await this.meetHub.stop();
        } catch {
          // Ignore stop error
        }
      }

      const hubUrl = `${getBaseHubUrl()}/hubs/meet`;
      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: async () => {
            const token = await getLatestToken();
            return token ?? '';
          },
        })
        .withAutomaticReconnect([0, 1500, 3000, 6000, 12000])
        .configureLogging(LogLevel.Warning)
        .build();

      connection.onreconnecting(() => {
        this.notifyMeetStatus('Reconnecting');
      });

      connection.onreconnected((newConnectionId) => {
        this.notifyMeetStatus('Connected');
        const codes = Array.from(this.activeMeetingCodes);
        for (const code of codes) {
          void connection.invoke('SwitchDevice', code).catch(() => {
            void connection.invoke('JoinMeeting', code).catch(() => {
              // Ignore rejoin error
            });
          });
        }
        this.meetReconnectedListeners.forEach((l) => l(newConnectionId ?? ''));
      });

      connection.onclose(() => {
        this.notifyMeetStatus('Disconnected');
      });

      this.meetHub = connection;
      this.notifyMeetStatus('Connecting');

      try {
        await connection.start();
        this.notifyMeetStatus('Connected');
      } catch (err) {
        this.notifyMeetStatus('Disconnected');
        console.warn('[RealTimeManager] Failed to start MeetingHub connection:', err);
      } finally {
        this.meetConnectPromise = null;
      }

      return connection;
    })();

    return this.meetConnectPromise;
  }

  public async joinMeeting(meetingCode: string): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
      this.activeMeetingCodes.add(meetingCode);
      await conn.invoke('JoinMeeting', meetingCode);
    }
  }

  public async requestJoinMeeting(meetingCode: string): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
      await conn.invoke('RequestJoinMeeting', meetingCode);
    }
  }

  public async admitParticipant(meetingCode: string, targetConnectionId: string, targetUserId: string): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
      await conn.invoke('AdmitParticipant', meetingCode, targetConnectionId, targetUserId);
    }
  }

  public async denyParticipant(meetingCode: string, targetConnectionId: string, targetUserId: string): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
      await conn.invoke('DenyParticipant', meetingCode, targetConnectionId, targetUserId);
    }
  }

  public async declineIncomingCall(meetingCode: string): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
      await conn.invoke('DeclineIncomingCall', meetingCode);
    }
  }

  public async leaveMeeting(meetingCode: string): Promise<void> {
    this.activeMeetingCodes.delete(meetingCode);
    if (this.meetHub && this.meetHub.state === HubConnectionState.Connected) {
      await this.meetHub.invoke('LeaveMeeting', meetingCode);
    }
  }

  public async switchDevice(meetingCode: string): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
      this.activeMeetingCodes.add(meetingCode);
      await conn.invoke('SwitchDevice', meetingCode);
    }
  }

  public async updateMediaState(
    meetingCode: string,
    isMicMuted: boolean,
    isVideoMuted: boolean,
    isScreenSharing: boolean,
    screenStreamId?: string | null
  ): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
      await conn.invoke(
        'UpdateMediaState',
        meetingCode,
        isMicMuted,
        isVideoMuted,
        isScreenSharing,
        screenStreamId ?? null
      );
    }
  }

  public async updateRecordingState(meetingCode: string, isRecording: boolean): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
      await conn.invoke('UpdateRecordingState', meetingCode, isRecording);
    }
  }

  public async sendWebRtcSignal(targetConnectionId: string, type: 'offer' | 'answer' | 'ice', payload: string): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
      await conn.invoke('SendWebRtcSignal', targetConnectionId, type, payload);
    }
  }

  public async sendMeetingReaction(meetingCode: string, emoji: string): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
      await conn.invoke('SendReaction', meetingCode, emoji);
    }
  }

  public async broadcastMeetingChat(
    meetingCode: string,
    message: { id?: string; senderName: string; content: string; timestamp: string }
  ): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
      await conn.invoke('BroadcastMeetingChatMessage', meetingCode, message);
    }
  }

  public async broadcastMeetingChatEdited(
    meetingCode: string,
    payload: { messageId: string; content: string }
  ): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
      try {
        await conn.invoke('BroadcastMeetingChatEdited', meetingCode, payload);
      } catch {
        // Ignore if unsupported
      }
    }
  }

  public async broadcastMeetingChatUnsent(
    meetingCode: string,
    payload: { messageId: string }
  ): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
      try {
        await conn.invoke('BroadcastMeetingChatUnsent', meetingCode, payload);
      } catch {
        // Ignore if unsupported
      }
    }
  }

  public async broadcastMeetingChatReaction(
    meetingCode: string,
    payload: { messageId: string; emoji: string; userName: string }
  ): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
      try {
        await conn.invoke('BroadcastMeetingChatReaction', meetingCode, payload);
      } catch {
        // Ignore if unsupported
      }
    }
  }

  public onRoomJoinedSnapshot(handler: (snapshot: RoomJoinedSnapshot) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnRoomJoinedSnapshot', handler);
  }

  public onParticipantJoined(handler: (participant: ActiveRoomPeerSnapshot) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnParticipantJoined', handler);
  }

  public onParticipantMediaStateChanged(handler: (payload: ParticipantMediaStatePayload) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnParticipantMediaStateChanged', handler);
  }

  public onRecordingStateChanged(handler: (isRecording: boolean, hostUserName: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnRecordingStateChanged', handler);
  }

  public onUserRaisedHand(handler: (userId: string, userName: string, queuePosition: number) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnUserRaisedHand', handler);
  }

  public onUserLoweredHand(handler: (userId: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnUserLoweredHand', handler);
  }

  public onParticipantMuted(handler: (targetUserId: string | null, mutedByUserId: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnParticipantMuted', handler);
  }

  public onSpeakerSpotlighted(handler: (targetUserId: string | null) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnSpeakerSpotlighted', handler);
  }

  public onParticipantKicked(handler: (targetUserId: string, reason: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnParticipantKicked', handler);
  }

  public onPollCreated(handler: (poll: MeetingPoll) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnPollCreated', handler);
  }

  public onPollVoteUpdated(handler: (pollId: string, poll: MeetingPoll) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnPollVoteUpdated', handler);
  }

  public onPollClosed(handler: (pollId: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnPollClosed', handler);
  }

  public onJoinRequested(handler: (request: WaitingRoomRequestItem) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnJoinRequested', handler);
  }

  public onWaitingQueueUpdated(handler: (requests: WaitingRoomRequestItem[]) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnWaitingQueueUpdated', handler);
  }

  public onJoinRequestPending(handler: (meetingCode: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnJoinRequestPending', handler);
  }

  public onJoinRequestAdmitted(handler: (meetingCode: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnJoinRequestAdmitted', handler);
  }

  public onJoinRequestDenied(handler: (meetingCode: string, reason: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnJoinRequestDenied', handler);
  }

  public onParticipantLeft(handler: (userId: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnParticipantLeft', handler);
  }

  public onReceiveMeetingChatMessage(
    handler: (message: { id?: string; senderName: string; content: string; timestamp: string }) => void
  ): () => void {
    return this.createListener(() => this.getMeetConnection(), 'ReceiveMeetingChatMessage', handler);
  }

  public onReceiveMeetingChatEdited(handler: (payload: { messageId: string; content: string }) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'ReceiveMeetingChatEdited', handler);
  }

  public onReceiveMeetingChatUnsent(handler: (payload: { messageId: string }) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'ReceiveMeetingChatUnsent', handler);
  }

  public onReceiveMeetingChatReaction(
    handler: (payload: { messageId: string; emoji: string; userName: string }) => void
  ): () => void {
    return this.createListener(() => this.getMeetConnection(), 'ReceiveMeetingChatReaction', handler);
  }

  public onReactionReceived(handler: (userId: string, emoji: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnReactionReceived', handler);
  }

  public onIncomingCall(handler: (meeting: unknown) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnIncomingCall', handler);
  }

  public onCallDeclined(handler: (meetingCode: string, userId: string, userName: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnCallDeclined', handler);
  }

  public onMeetingEnded(handler: (meetingCode: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnMeetingEnded', handler);
  }

  public onExistingSessionDetected(handler: (meetingCode: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnExistingSessionDetected', handler);
  }

  public onSessionSwitchedToAnotherDevice(handler: (meetingCode: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnSessionSwitchedToAnotherDevice', handler);
  }

  public onReceiveWebRtcOffer(handler: (senderConnectionId: string, senderUserId: string, sdp: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'ReceiveWebRtcOffer', handler);
  }

  public onReceiveWebRtcAnswer(handler: (senderConnectionId: string, senderUserId: string, sdp: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'ReceiveWebRtcAnswer', handler);
  }

  public onReceiveIceCandidate(handler: (senderConnectionId: string, senderUserId: string, candidateJson: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'ReceiveIceCandidate', handler);
  }

  public onHostChanged(handler: (newHostUserId: string, newHostUserName: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnHostChanged', handler);
  }
}

export const realTimeService = new RealTimeManager();
