import { apiClient } from '../apiClient';
import { safeAsync } from '../utils/safeAsync';

export interface AuditLogItem {
  id: string;
  event: string;
  action: string;
  entityName: string;
  entityId: string;
  actor: string;
  resource: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Error';
  type: 'Auth' | 'Data' | 'System' | 'Security' | 'User';
  changes: string;
  timestamp: string;
}

export interface GetAuditLogsParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

export interface GetAuditLogsResponse {
  succeeded: boolean;
  data: AuditLogItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const auditLogService = {
  /**
   * Fetch paginated audit log entries from API
   */
  async getAuditLogs(params?: GetAuditLogsParams) {
    return safeAsync(async () => {
      const response = await apiClient.get<GetAuditLogsResponse>('/api/v2/audit-logs', {
        params: {
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 50,
          searchTerm: params?.searchTerm,
        },
      });
      return response.data;
    }, 'Failed to fetch system audit logs');
  },
};
