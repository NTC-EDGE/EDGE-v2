import { useApi } from './api';

export interface NotificationTemplate {
  id: string;
  eventKey: string;
  name: string;
  subject: string;
  bodyHtml: string;
  availablePlaceholders: string;
  isActive: boolean;
  lastModifiedAt?: string;
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

export interface UpdateNotificationTemplateRequest {
  subject: string;
  bodyHtml: string;
  isActive: boolean;
}

export function useNotificationTemplateService() {
  const { useQuery, put } = useApi();

  const useNotificationTemplates = (pageNumber = 1, pageSize = 50, searchTerm?: string) => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (searchTerm !== undefined && searchTerm !== null && searchTerm.trim().length > 0) {
      params.append('searchTerm', searchTerm.trim());
    }
    return useQuery<PaginatedApiResponse<NotificationTemplate>>(`/api/v2/notification-templates?${params.toString()}`);
  };

  const updateNotificationTemplate = async (
    id: string,
    request: UpdateNotificationTemplateRequest
  ): Promise<NotificationTemplate> => {
    return put<NotificationTemplate, UpdateNotificationTemplateRequest>(`/api/v2/notification-templates/${id}`, request);
  };

  return {
    useNotificationTemplates,
    updateNotificationTemplate,
  };
}
