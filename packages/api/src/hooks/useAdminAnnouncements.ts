import useSWR from "swr";
import { apiClient } from "../index";
import { ApiResponse, SystemAnnouncementDto } from "../types";

export interface UseAdminAnnouncementsReturn {
  announcements: SystemAnnouncementDto[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<ApiResponse<SystemAnnouncementDto[]> | undefined>;
}

export function useAdminAnnouncements(): UseAdminAnnouncementsReturn {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<SystemAnnouncementDto[]>>(
    "/api/v2/announcements",
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<SystemAnnouncementDto[]>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    announcements: data?.data ?? [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
