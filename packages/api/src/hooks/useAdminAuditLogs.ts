import useSWR from "swr";
import { apiClient } from "../apiClient";
import { AuditLogDto } from "../types";

export interface UseAdminAuditLogsReturn {
  logs: AuditLogDto[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<any>;
}

export function useAdminAuditLogs(pageNumber = 1, pageSize = 20, searchTerm = "", tenantId?: string): UseAdminAuditLogsReturn {
  const queryParams = new URLSearchParams();
  queryParams.set('pageNumber', String(pageNumber));
  queryParams.set('pageSize', String(pageSize));
  if (searchTerm) queryParams.set('searchTerm', searchTerm);
  if (tenantId) queryParams.set('tenantId', tenantId);

  const queryUrl = `/api/v2/audit-logs?${queryParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<{ succeeded: boolean; data: AuditLogDto[]; totalCount: number }>(
    queryUrl,
    async (url: string) => {
      const res = await apiClient.get<{ succeeded: boolean; data: AuditLogDto[]; totalCount: number }>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    logs: data?.data ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
