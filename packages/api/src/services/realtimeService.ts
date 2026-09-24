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

  public onReceiveMessage(handler: (message: ChatMessage) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getChatConnection().then((conn) => {
      conn.on('ReceiveMessage', handler);
      unsubs = () => conn.off('ReceiveMessage', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onUserTyping(handler: (conversationId: string, userId: string, userName: string) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getChatConnection().then((conn) => {
      conn.on('UserTyping', handler);
      unsubs = () => conn.off('UserTyping', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onUserStoppedTyping(handler: (conversationId: string, userId: string) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getChatConnection().then((conn) => {
      conn.on('UserStoppedTyping', handler);
      unsubs = () => conn.off('UserStoppedTyping', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onConversationUpdated(handler: (conversationId: string) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getChatConnection().then((conn) => {
      conn.on('ConversationUpdated', handler);
      unsubs = () => conn.off('ConversationUpdated', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
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
    let unsubs: (() => void) | null = null;
    void this.getMeetConnection().then((conn) => {
      conn.on('OnParticipantJoined', handler);
      unsubs = () => conn.off('OnParticipantJoined', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onJoinRequested(handler: (request: { connectionId: string; userId: string; userName: string; avatarUrl?: string; meetingCode: string }) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getMeetConnection().then((conn) => {
      conn.on('OnJoinRequested', handler);
      unsubs = () => conn.off('OnJoinRequested', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onJoinRequestPending(handler: (meetingCode: string) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getMeetConnection().then((conn) => {
      conn.on('OnJoinRequestPending', handler);
      unsubs = () => conn.off('OnJoinRequestPending', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onJoinRequestAdmitted(handler: (meetingCode: string) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getMeetConnection().then((conn) => {
      conn.on('OnJoinRequestAdmitted', handler);
      unsubs = () => conn.off('OnJoinRequestAdmitted', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onJoinRequestDenied(handler: (meetingCode: string, reason: string) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getMeetConnection().then((conn) => {
      conn.on('OnJoinRequestDenied', handler);
      unsubs = () => conn.off('OnJoinRequestDenied', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onParticipantLeft(handler: (userId: string) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getMeetConnection().then((conn) => {
      conn.on('OnParticipantLeft', handler);
      unsubs = () => conn.off('OnParticipantLeft', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onReceiveMeetingChatMessage(handler: (message: { id?: string; senderName: string; content: string; timestamp: string }) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getMeetConnection().then((conn) => {
      conn.on('ReceiveMeetingChatMessage', handler);
      unsubs = () => conn.off('ReceiveMeetingChatMessage', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onReceiveMeetingChatEdited(handler: (payload: { messageId: string; content: string }) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getMeetConnection().then((conn) => {
      conn.on('ReceiveMeetingChatEdited', handler);
      unsubs = () => conn.off('ReceiveMeetingChatEdited', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onReceiveMeetingChatUnsent(handler: (payload: { messageId: string }) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getMeetConnection().then((conn) => {
      conn.on('ReceiveMeetingChatUnsent', handler);
      unsubs = () => conn.off('ReceiveMeetingChatUnsent', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onReceiveMeetingChatReaction(handler: (payload: { messageId: string; emoji: string; userName: string }) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getMeetConnection().then((conn) => {
      conn.on('ReceiveMeetingChatReaction', handler);
      unsubs = () => conn.off('ReceiveMeetingChatReaction', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onReactionReceived(handler: (userId: string, emoji: string) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getMeetConnection().then((conn) => {
      conn.on('OnReactionReceived', handler);
      unsubs = () => conn.off('OnReactionReceived', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onReceiveWebRtcOffer(handler: (senderConnectionId: string, sdp: string) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getMeetConnection().then((conn) => {
      conn.on('ReceiveWebRtcOffer', handler);
      unsubs = () => conn.off('ReceiveWebRtcOffer', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onReceiveWebRtcAnswer(handler: (senderConnectionId: string, sdp: string) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getMeetConnection().then((conn) => {
      conn.on('ReceiveWebRtcAnswer', handler);
      unsubs = () => conn.off('ReceiveWebRtcAnswer', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }

  public onReceiveIceCandidate(handler: (senderConnectionId: string, candidateJson: string) => void): () => void {
    let unsubs: (() => void) | null = null;
    void this.getMeetConnection().then((conn) => {
      conn.on('ReceiveIceCandidate', handler);
      unsubs = () => conn.off('ReceiveIceCandidate', handler);
    });
    return () => {
      if (unsubs) unsubs();
    };
  }
}

export const realTimeService = new RealTimeManager();
