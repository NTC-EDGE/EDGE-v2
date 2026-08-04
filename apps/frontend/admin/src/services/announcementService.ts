import { useApi } from './api';

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  targetAudience: string;
  createdAt: string;
}

export interface PaginatedApiResponse<T> {
  succeeded: boolean;
  message?: string;
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface CreateAnnouncementRequest {
  title: string;
  message: string;
  type: string;
  isActive: boolean;
  targetAudience: string;
}

export interface UpdateAnnouncementRequest {
  title: string;
  message: string;
  type: string;
  isActive: boolean;
  targetAudience: string;
}

export function useAnnouncementService() {
  const { useQuery, post, put, patch, del } = useApi();

  const useAnnouncements = (pageNumber = 1, pageSize = 50, searchTerm?: string, type?: string) => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (searchTerm !== undefined && searchTerm !== null && searchTerm.trim().length > 0) {
      params.append('searchTerm', searchTerm.trim());
    }
    if (type !== undefined && type !== null && type !== 'ALL') {
      params.append('type', type);
    }
    return useQuery<PaginatedApiResponse<SystemAnnouncement>>(`/api/v2/announcements?${params.toString()}`);
  };

  const createAnnouncement = async (request: CreateAnnouncementRequest): Promise<SystemAnnouncement> => {
    return post<SystemAnnouncement, CreateAnnouncementRequest>('/api/v2/announcements', request);
  };

  const updateAnnouncement = async (id: string, request: UpdateAnnouncementRequest): Promise<SystemAnnouncement> => {
    return put<SystemAnnouncement, UpdateAnnouncementRequest>(`/api/v2/announcements/${id}`, request);
  };

  const togglePublishStatus = async (id: string, isActive: boolean): Promise<SystemAnnouncement> => {
    return patch<SystemAnnouncement, { isActive: boolean }>(`/api/v2/announcements/${id}/publish`, { isActive });
  };

  const deleteAnnouncement = async (id: string): Promise<void> => {
    return del<void>(`/api/v2/announcements/${id}`);
  };

  return {
    useAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    togglePublishStatus,
    deleteAnnouncement,
  };
}
