import { useApi } from './api';

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entityName: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogsResponse {
  data?: AuditLog[];
  items?: AuditLog[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
}

export function useAuditLogService() {
  const { useQuery } = useApi();

  const useAuditLogs = (pageNumber = 1, pageSize = 15, searchTerm?: string) => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (searchTerm !== undefined && searchTerm !== null && searchTerm.trim().length > 0) {
      params.append('searchTerm', searchTerm.trim());
    }
    return useQuery<AuditLogsResponse>(`/api/v2/audit-logs?${params.toString()}`);
  };

  return {
    useAuditLogs,
  };
}
