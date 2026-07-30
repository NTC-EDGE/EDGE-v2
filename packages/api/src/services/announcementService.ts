import { apiClient } from '../apiClient';
import { ApiResponse, SystemAnnouncementDto } from '../types';
import { safeAsync } from '../utils/safeAsync';

export interface CreateAnnouncementRequest {
  title: string;
  message: string;
  type: string;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  targetAudience: string;
}

export const announcementService = {
  /**
   * Fetch all system announcements
   */
  async getAnnouncements() {
    return safeAsync(async () => {
      const response = await apiClient.get<ApiResponse<SystemAnnouncementDto[]>>('/api/v2/announcements');
      return response.data.data ?? [];
    }, 'Failed to fetch announcements');
  },

  /**
   * Create a new system announcement
   */
  async createAnnouncement(data: CreateAnnouncementRequest) {
    return safeAsync(async () => {
      const response = await apiClient.post<SystemAnnouncementDto>('/api/v2/announcements', data);
      return response.data;
    }, 'Failed to create system announcement');
  },

  /**
   * Delete an existing system announcement
   */
  async deleteAnnouncement(id: string) {
    return safeAsync(async () => {
      await apiClient.delete(`/api/v2/announcements/${id}`);
      return true;
    }, 'Failed to delete system announcement');
  },
};
