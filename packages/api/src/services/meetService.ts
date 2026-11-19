import { apiClient } from '../apiClient';

export interface MeetingParticipant {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: 'Member' | 'Admin' | 'Owner';
  isHandRaised: boolean;
  handRaiseQueuePosition?: number | null;
  isMutedByHost: boolean;
  isSpotlighted: boolean;
}

export interface MeetingPollVote {
  userId: string;
  selectedOptionIndex: number;
}

export interface MeetingPoll {
  id: string;
  question: string;
  options: string[];
  isClosed: boolean;
  isAnonymous: boolean;
  votes: MeetingPollVote[];
}

export interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  meetingCode: string;
  scope: 'IntraRegional' | 'InterRegional';
  tenantId?: string | null;
  tenantName?: string | null;
  hostUserId: string;
  hostUserName: string;
  linkedConversationId?: string | null;
  scheduledStartTime: string;
  scheduledEndTime?: string | null;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  status: 'Scheduled' | 'Live' | 'Ended' | 'Cancelled';
  participants: MeetingParticipant[];
  polls: MeetingPoll[];
}

export interface IceServerEntry {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface IceServersResponse {
  iceServers: IceServerEntry[];
}

export interface CreateMeetingPayload {
  title: string;
  description?: string | null;
  scope: 'IntraRegional' | 'InterRegional';
  tenantId?: string | null;
  scheduledStartTime: string;
  scheduledEndTime?: string | null;
  participantUserIds?: string[];
  isInstant?: boolean;
  ringParticipants?: boolean;
  linkedConversationId?: string | null;
}

export interface UpdateMeetingPayload {
  meetingCode: string;
  title: string;
  description?: string | null;
  scope: 'IntraRegional' | 'InterRegional';
  scheduledStartTime: string;
  scheduledEndTime?: string | null;
}

export type MeetingActionTypeName =
  | 'RaiseHand'
  | 'LowerHand'
  | 'EmojiReaction'
  | 'MuteParticipant'
  | 'SpotlightParticipant'
  | 'AdmitFromLobby'
  | 'KickParticipant'
  | 'EndMeeting'
  | 'CancelMeeting'
  | 'LeaveMeeting';

export interface ExecuteMeetingActionPayload {
  meetingCode: string;
  actionType: MeetingActionTypeName;
  targetUserId?: string | null;
  actionPayload?: string | null;
}

export interface CreateMeetingPollPayload {
  meetingCode: string;
  question: string;
  options: string[];
  isAnonymous?: boolean;
}

export interface VoteMeetingPollPayload {
  meetingCode: string;
  pollId: string;
  selectedOptionIndex: number;
}

export const meetService = {
  async getIceServers(): Promise<IceServerEntry[]> {
    const response = await apiClient.get<IceServersResponse>('/api/v2/meetings/ice-servers');
    return Array.isArray(response.data?.iceServers) ? response.data.iceServers : [];
  },

  async getMeetings(tenantId?: string, filter?: string): Promise<Meeting[]> {
    const params: Record<string, string> = {};
    if (tenantId) params.tenantId = tenantId;
    if (filter) params.filter = filter;
    const response = await apiClient.get<Meeting[]>('/api/v2/meetings', {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return response.data;
  },

  async getMeetingByCode(meetingCode: string): Promise<Meeting> {
    const response = await apiClient.get<Meeting>(`/api/v2/meetings/${encodeURIComponent(meetingCode)}`);
    return response.data;
  },

  async createMeeting(payload: CreateMeetingPayload): Promise<Meeting> {
    const response = await apiClient.post<Meeting>('/api/v2/meetings', payload);
    return response.data;
  },

  async updateMeeting(payload: UpdateMeetingPayload): Promise<Meeting> {
    const response = await apiClient.put<Meeting>(
      `/api/v2/meetings/${encodeURIComponent(payload.meetingCode)}`,
      payload
    );
    return response.data;
  },

  async inviteParticipants(
    meetingCode: string,
    userIds: string[],
    ringNewParticipants = false
  ): Promise<Meeting> {
    const response = await apiClient.post<Meeting>(
      `/api/v2/meetings/${encodeURIComponent(meetingCode)}/participants`,
      {
        meetingCode,
        userIds,
        ringNewParticipants,
      }
    );
    return response.data;
  },

  async removeParticipant(meetingCode: string, userId: string): Promise<boolean> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/api/v2/meetings/${encodeURIComponent(meetingCode)}/participants/${encodeURIComponent(userId)}`
    );
    return response.data.success;
  },

  async executeAction(payload: ExecuteMeetingActionPayload): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>(
      `/api/v2/meetings/${encodeURIComponent(payload.meetingCode)}/actions`,
      payload
    );
    return response.data.success;
  },

  async createPoll(payload: CreateMeetingPollPayload): Promise<MeetingPoll> {
    const response = await apiClient.post<MeetingPoll>(
      `/api/v2/meetings/${encodeURIComponent(payload.meetingCode)}/polls`,
      payload
    );
    return response.data;
  },

  async votePoll(payload: VoteMeetingPollPayload): Promise<MeetingPoll> {
    const response = await apiClient.post<MeetingPoll>(
      `/api/v2/meetings/${encodeURIComponent(payload.meetingCode)}/polls/${encodeURIComponent(payload.pollId)}/votes`,
      payload
    );
    return response.data;
  },

  async closePoll(meetingCode: string, pollId: string): Promise<MeetingPoll> {
    const response = await apiClient.post<MeetingPoll>(
      `/api/v2/meetings/${encodeURIComponent(meetingCode)}/polls/${encodeURIComponent(pollId)}/close`,
      {}
    );
    return response.data;
  },
};
