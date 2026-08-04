import { useApi } from './api';

export interface SystemConfig {
  id: string;
  category: string;
  key: string;
  value: string;
  description: string;
  dataType: string;
  isPublic: boolean;
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

export interface UpdateSystemConfigRequest {
  key: string;
  value: string;
  category: string;
  description: string;
}

export function useSystemConfigService() {
  const { useQuery, put } = useApi();

  const useSystemConfigs = (pageNumber = 1, pageSize = 50, searchTerm?: string, category?: string) => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (searchTerm !== undefined && searchTerm !== null && searchTerm.trim().length > 0) {
      params.append('searchTerm', searchTerm.trim());
    }
    if (category !== undefined && category !== null && category.trim().length > 0 && category !== 'ALL') {
      params.append('category', category.trim());
    }
    return useQuery<PaginatedApiResponse<SystemConfig>>(`/api/v2/system-config?${params.toString()}`);
  };

  const updateSystemConfig = async (request: UpdateSystemConfigRequest): Promise<SystemConfig> => {
    return put<SystemConfig, UpdateSystemConfigRequest>('/api/v2/system-config', request);
  };

  return {
    useSystemConfigs,
    updateSystemConfig,
  };
}
