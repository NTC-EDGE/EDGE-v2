import useSWR from "swr";
import { apiClient } from "../apiClient";
import { ApiResponse, ServiceNote, Note } from "../types";

export interface UseAdminNotesReturn {
  notes: ServiceNote[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<ApiResponse<ServiceNote[]> | undefined>;
}

export function useAdminNotes(): UseAdminNotesReturn {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ServiceNote[]>>(
    "/api/v2/service-notes",
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<ServiceNote[]>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    notes: data?.data ?? [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
