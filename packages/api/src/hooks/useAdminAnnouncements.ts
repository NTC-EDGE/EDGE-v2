import useSWR from "swr";
import { apiClient } from "../apiClient";
import { ApiResponse, SystemAnnouncementDto } from "../types";

export interface UseAdminAnnouncementsOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  revalidateIfStale?: boolean;
}

export interface UseAdminAnnouncementsReturn {
  announcements: SystemAnnouncementDto[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<ApiResponse<SystemAnnouncementDto[]> | undefined>;
}

export function useAdminAnnouncements(options?: UseAdminAnnouncementsOptions): UseAdminAnnouncementsReturn {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<SystemAnnouncementDto[]>>(
    "/api/v2/announcements",
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<SystemAnnouncementDto[]>>(url);
      return res.data;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateIfStale: options?.revalidateIfStale,
      refreshInterval: options?.refreshInterval,
    }
  );

  return {
    announcements: data?.data ?? [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
