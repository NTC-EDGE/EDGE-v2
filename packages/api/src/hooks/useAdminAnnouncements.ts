import useSWR from "swr";
import { apiClient } from "../apiClient";
import { ApiResponse, SystemAnnouncementDto } from "../types";

export interface UseAdminAnnouncementsOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  revalidateIfStale?: boolean;
  isActive?: boolean;
  targetAudience?: string;
  type?: string;
  pageSize?: number;
  pageNumber?: number;
}

export interface UseAdminAnnouncementsReturn {
  announcements: SystemAnnouncementDto[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<ApiResponse<SystemAnnouncementDto[]> | undefined>;
}

export function useAdminAnnouncements(options?: UseAdminAnnouncementsOptions): UseAdminAnnouncementsReturn {
  const queryParams = new URLSearchParams();
  if (options?.pageSize !== undefined) queryParams.set("pageSize", String(options.pageSize));
  if (options?.pageNumber !== undefined) queryParams.set("pageNumber", String(options.pageNumber));
  if (options?.isActive !== undefined) queryParams.set("isActive", String(options.isActive));
  if (options?.targetAudience !== undefined && options.targetAudience.length > 0) {
    queryParams.set("targetAudience", options.targetAudience);
  }
  if (options?.type !== undefined && options.type !== "ALL") {
    queryParams.set("type", options.type);
  }

  const queryString = queryParams.toString();
  const endpoint = queryString.length > 0 ? `/api/v2/announcements?${queryString}` : "/api/v2/announcements";

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<SystemAnnouncementDto[]>>(
    endpoint,
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

export function useClientAnnouncements(options?: UseAdminAnnouncementsOptions): UseAdminAnnouncementsReturn {
  return useAdminAnnouncements({
    isActive: true,
    targetAudience: "Clients",
    pageSize: 50,
    ...options,
  });
}
