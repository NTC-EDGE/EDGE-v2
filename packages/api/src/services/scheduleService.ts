import { apiClient } from '../apiClient';
import {
  PaginatedApiResponse,
  ScheduleItemDto,
  CreateSchedulePayload,
  UpdateSchedulePayload,
  PublishSchedulePayload,
} from '../types';
import { safeAsync } from '../utils/safeAsync';

export interface GetSchedulesParams {
  tenantId?: string;
  serviceId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export const scheduleService = {
  /**
   * Fetch paginated list of schedules with optional filtering
   */
  async getSchedules(params?: GetSchedulesParams) {
    return safeAsync(async () => {
      const searchParams = new URLSearchParams();
      if (params?.tenantId !== undefined && params.tenantId !== null && params.tenantId.trim().length > 0) {
        searchParams.append('tenantId', params.tenantId.trim());
      }
      if (params?.serviceId !== undefined && params.serviceId !== null && params.serviceId.trim().length > 0) {
        searchParams.append('serviceId', params.serviceId.trim());
      }
      if (params?.pageNumber !== undefined && params.pageNumber !== null && params.pageNumber > 0) {
        searchParams.append('pageNumber', params.pageNumber.toString());
      }
      if (params?.pageSize !== undefined && params.pageSize !== null && params.pageSize > 0) {
        searchParams.append('pageSize', params.pageSize.toString());
      }

      const queryString = searchParams.toString();
      const endpoint = `/api/v2/schedules${queryString.length > 0 ? `?${queryString}` : ''}`;
      const response = await apiClient.get<PaginatedApiResponse<ScheduleItemDto>>(endpoint);
      return response.data;
    }, 'Failed to fetch schedules');
  },

  /**
   * Fetch single schedule by ID
   */
  async getScheduleById(id: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<ScheduleItemDto>(`/api/v2/schedules/${id}`);
      return response.data;
    }, 'Failed to fetch schedule details');
  },

  /**
   * Create a new appointment/operations schedule
   */
  async createSchedule(payload: CreateSchedulePayload) {
    return safeAsync(async () => {
      const response = await apiClient.post<ScheduleItemDto>('/api/v2/schedules', payload);
      return response.data;
    }, 'Failed to create schedule');
  },

  /**
   * Update an existing schedule
   */
  async updateSchedule(id: string, payload: UpdateSchedulePayload) {
    return safeAsync(async () => {
      const response = await apiClient.put<ScheduleItemDto>(`/api/v2/schedules/${id}`, payload);
      return response.data;
    }, 'Failed to update schedule');
  },

  /**
   * Set or toggle the published status of a schedule
   */
  async togglePublish(id: string, isPublished: boolean) {
    return safeAsync(async () => {
      const payload: PublishSchedulePayload = { isPublished };
      const response = await apiClient.patch<ScheduleItemDto>(`/api/v2/schedules/${id}/publish`, payload);
      return response.data;
    }, `Failed to ${isPublished ? 'publish' : 'unpublish'} schedule`);
  },

  /**
   * Delete a schedule
   */
  async deleteSchedule(id: string) {
    return safeAsync(async () => {
      await apiClient.delete(`/api/v2/schedules/${id}`);
      return true;
    }, 'Failed to delete schedule');
  },
};
