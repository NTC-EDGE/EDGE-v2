import { useApi } from './api';
import {
  ExamSchedule,
  CreateExamScheduleCommand,
  UpdateExamScheduleCommand
} from '@edge/api';

export function useScheduleService() {
  const { useQuery, post, put, del } = useApi();

  const useServices = () => {
    const query = useQuery<{ succeeded: boolean; data: { id: string; name: string; code: string }[] }>('/api/v2/services');
    return {
      ...query,
      data: query.data?.data !== undefined && query.data?.data !== null ? query.data.data : []
    };
  };

  const useSchedules = (search?: string, regionId?: string, isPublished?: string) => {
    const params = new URLSearchParams();
    if (search !== undefined && search !== null && search.trim().length > 0) {
      params.append('search', search.trim());
    }
    if (regionId !== undefined && regionId !== null && regionId !== 'ALL' && regionId.trim().length > 0) {
      params.append('regionId', regionId.trim());
    }
    if (isPublished !== undefined && isPublished !== null && isPublished !== 'ALL') {
      params.append('isPublished', isPublished);
    }

    const queryString = params.toString();
    const endpoint = `/api/v2/schedules${queryString.length > 0 ? `?${queryString}` : ''}`;
    return useQuery<ExamSchedule[]>(endpoint);
  };

  const useSchedule = (id: string | null) => {
    return useQuery<ExamSchedule>(id !== null && id.length > 0 ? `/api/v2/schedules/${id}` : null);
  };

  const createSchedule = async (data: CreateExamScheduleCommand): Promise<ExamSchedule> => {
    return post<ExamSchedule, CreateExamScheduleCommand>('/api/v2/schedules', data);
  };

  const updateSchedule = async (id: string, data: UpdateExamScheduleCommand): Promise<ExamSchedule> => {
    return put<ExamSchedule, UpdateExamScheduleCommand>(`/api/v2/schedules/${id}`, data);
  };

  const togglePublishStatus = async (id: string, isPublished: boolean): Promise<ExamSchedule> => {
    return put<ExamSchedule, { isPublished: boolean }>(`/api/v2/schedules/${id}/publish`, { isPublished });
  };

  const deleteSchedule = async (id: string): Promise<void> => {
    return del<void>(`/api/v2/schedules/${id}`);
  };

  return {
    useServices,
    useSchedules,
    useSchedule,
    createSchedule,
    updateSchedule,
    togglePublishStatus,
    deleteSchedule,
  };
}
