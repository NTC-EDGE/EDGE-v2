import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { getLatestToken } from './tokenManager';
import { ChatMessage, Conversation } from './chatService';

export type RealTimeConnectionStatus = 'Disconnected' | 'Connecting' | 'Connected' | 'Reconnecting';

const getBaseHubUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:5000';
};

class RealTimeManager {
  private chatHub: HubConnection | null = null;
  private meetHub: HubConnection | null = null;
  private chatStatus: RealTimeConnectionStatus = 'Disconnected';
  private meetStatus: RealTimeConnectionStatus = 'Disconnected';
  private statusListeners = new Set<(status: RealTimeConnectionStatus) => void>();

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

  private notifyStatus(status: RealTimeConnectionStatus) {
    this.chatStatus = status;
    this.statusListeners.forEach((l) => l(status));
  }

  // ─── CHAT HUB ─────────────────────────────────────────────────────────────

  public async getChatConnection(): Promise<HubConnection> {
    if (this.chatHub && (this.chatHub.state === HubConnectionState.Connected || this.chatHub.state === HubConnectionState.Connecting)) {
      return this.chatHub;
    }

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
    }

    return connection;
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
    if (this.meetHub && (this.meetHub.state === HubConnectionState.Connected || this.meetHub.state === HubConnectionState.Connecting)) {
      return this.meetHub;
    }

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
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Warning)
      .build();

    this.meetHub = connection;

    try {
      await connection.start();
      this.meetStatus = 'Connected';
    } catch (err) {
      this.meetStatus = 'Disconnected';
      console.warn('[RealTimeManager] Failed to start MeetingHub connection:', err);
    }

    return connection;
  }

  public async joinMeeting(meetingCode: string): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
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

  public async leaveMeeting(meetingCode: string): Promise<void> {
    if (this.meetHub && this.meetHub.state === HubConnectionState.Connected) {
      await this.meetHub.invoke('LeaveMeeting', meetingCode);
    }
  }

  public async sendWebRtcSignal(targetConnectionId: string, type: 'offer' | 'answer' | 'ice', payload: string): Promise<void> {
    if (this.meetHub && this.meetHub.state === HubConnectionState.Connected) {
      await this.meetHub.invoke('SendWebRtcSignal', targetConnectionId, type, payload);
    }
  }

  public async sendMeetingReaction(meetingCode: string, emoji: string): Promise<void> {
    if (this.meetHub && this.meetHub.state === HubConnectionState.Connected) {
      await this.meetHub.invoke('SendReaction', meetingCode, emoji);
    }
  }

  public async broadcastMeetingChat(meetingCode: string, message: { id?: string; senderName: string; content: string; timestamp: string }): Promise<void> {
    if (this.meetHub && this.meetHub.state === HubConnectionState.Connected) {
      await this.meetHub.invoke('BroadcastMeetingChatMessage', meetingCode, message);
    }
  }

  public async broadcastMeetingChatEdited(meetingCode: string, payload: { messageId: string; content: string }): Promise<void> {
    if (this.meetHub && this.meetHub.state === HubConnectionState.Connected) {
      try {
        await this.meetHub.invoke('BroadcastMeetingChatEdited', meetingCode, payload);
      } catch {
        // Fallback
      }
    }
  }

  public async broadcastMeetingChatUnsent(meetingCode: string, payload: { messageId: string }): Promise<void> {
    if (this.meetHub && this.meetHub.state === HubConnectionState.Connected) {
      try {
        await this.meetHub.invoke('BroadcastMeetingChatUnsent', meetingCode, payload);
      } catch {
        // Fallback
      }
    }
  }

  public async broadcastMeetingChatReaction(meetingCode: string, payload: { messageId: string; emoji: string; userName: string }): Promise<void> {
    if (this.meetHub && this.meetHub.state === HubConnectionState.Connected) {
      try {
        await this.meetHub.invoke('BroadcastMeetingChatReaction', meetingCode, payload);
      } catch {
        // Fallback
      }
    }
  }

  public onParticipantJoined(handler: (participant: { connectionId: string; userId: string }) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnParticipantJoined', handler);
  }

  public onJoinRequested(handler: (request: { connectionId: string; userId: string; userName: string; avatarUrl?: string; meetingCode: string }) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnJoinRequested', handler);
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

  public onReceiveMeetingChatMessage(handler: (message: { id?: string; senderName: string; content: string; timestamp: string }) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'ReceiveMeetingChatMessage', handler);
  }

  public onReceiveMeetingChatEdited(handler: (payload: { messageId: string; content: string }) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'ReceiveMeetingChatEdited', handler);
  }

  public onReceiveMeetingChatUnsent(handler: (payload: { messageId: string }) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'ReceiveMeetingChatUnsent', handler);
  }

  public onReceiveMeetingChatReaction(handler: (payload: { messageId: string; emoji: string; userName: string }) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'ReceiveMeetingChatReaction', handler);
  }

  public onReactionReceived(handler: (userId: string, emoji: string) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnReactionReceived', handler);
  }

  public async switchDevice(meetingCode: string): Promise<void> {
    const conn = await this.getMeetConnection();
    if (conn.state === HubConnectionState.Connected) {
      await conn.invoke('SwitchDevice', meetingCode);
    }
  }

  public onIncomingCall(handler: (meeting: unknown) => void): () => void {
    return this.createListener(() => this.getMeetConnection(), 'OnIncomingCall', handler);
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
}

export const realTimeService = new RealTimeManager();
