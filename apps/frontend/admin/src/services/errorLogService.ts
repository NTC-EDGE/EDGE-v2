import { useApi } from './api';

export interface SystemErrorLog {
  id: string;
  level: string;
  message: string;
  exceptionType?: string;
  stackTrace?: string;
  source?: string;
  requestPath?: string;
  httpMethod?: string;
  userEmail?: string;
  loggedAt: string;
}

export interface ErrorLogsResponse {
  items?: SystemErrorLog[];
  totalCount?: number;
}

export function useErrorLogService() {
  const { useQuery } = useApi();

  const useErrorLogs = (pageNumber = 1, pageSize = 15, levelFilter?: string, searchTerm?: string) => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (levelFilter !== undefined && levelFilter !== null && levelFilter !== 'ALL') {
      params.append('level', levelFilter);
    }
    if (searchTerm !== undefined && searchTerm !== null && searchTerm.trim().length > 0) {
      params.append('searchTerm', searchTerm.trim());
    }
    return useQuery<ErrorLogsResponse>(`/api/v2/error-logs?${params.toString()}`);
  };

  return {
    useErrorLogs,
  };
}
