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
  scheduledStartTime: string;
  scheduledEndTime?: string | null;
  status: 'Scheduled' | 'Live' | 'Ended' | 'Cancelled';
  participants: MeetingParticipant[];
  polls: MeetingPoll[];
}

export interface CreateMeetingPayload {
  title: string;
  description?: string | null;
  scope: 'IntraRegional' | 'InterRegional';
  tenantId?: string | null;
  scheduledStartTime: string;
  scheduledEndTime?: string | null;
  participantUserIds?: string[];
}

export interface ExecuteMeetingActionPayload {
  meetingCode: string;
  actionType: 'RaiseHand' | 'LowerHand' | 'EmojiReaction' | 'MuteParticipant' | 'SpotlightParticipant' | 'AdmitFromLobby' | 'KickParticipant';
  targetUserId?: string | null;
  actionPayload?: string | null;
}

export interface CreateMeetingPollPayload {
  meetingCode: string;
  question: string;
  options: string[];
  isAnonymous?: boolean;
}

export const meetService = {
  async getMeetings(tenantId?: string): Promise<Meeting[]> {
    const params = tenantId ? { tenantId } : undefined;
    const response = await apiClient.get<Meeting[]>('/api/v2/meetings', { params });
    return response.data;
  },

  async getMeetingByCode(meetingCode: string): Promise<Meeting> {
    const response = await apiClient.get<Meeting>(`/api/v2/meetings/${meetingCode}`);
    return response.data;
  },

  async createMeeting(payload: CreateMeetingPayload): Promise<Meeting> {
    const response = await apiClient.post<Meeting>('/api/v2/meetings', payload);
    return response.data;
  },

  async inviteParticipants(meetingCode: string, userIds: string[]): Promise<Meeting> {
    const response = await apiClient.post<Meeting>(`/api/v2/meetings/${meetingCode}/participants`, {
      meetingCode,
      userIds,
    });
    return response.data;
  },

  async removeParticipant(meetingCode: string, userId: string): Promise<boolean> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/api/v2/meetings/${meetingCode}/participants/${userId}`
    );
    return response.data.success;
  },

  async executeAction(payload: ExecuteMeetingActionPayload): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>(
      `/api/v2/meetings/${payload.meetingCode}/actions`,
      payload
    );
    return response.data.success;
  },

  async createPoll(payload: CreateMeetingPollPayload): Promise<MeetingPoll> {
    const response = await apiClient.post<MeetingPoll>(
      `/api/v2/meetings/${payload.meetingCode}/polls`,
      payload
    );
    return response.data;
  },
};
