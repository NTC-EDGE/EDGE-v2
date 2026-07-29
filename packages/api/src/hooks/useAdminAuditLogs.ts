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

export function useAdminAuditLogs(pageNumber = 1, pageSize = 20, searchTerm = ""): UseAdminAuditLogsReturn {
  const queryUrl = `/api/v2/audit-logs?pageNumber=${pageNumber}&pageSize=${pageSize}${searchTerm ? `&searchTerm=${encodeURIComponent(searchTerm)}` : ''}`;

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
