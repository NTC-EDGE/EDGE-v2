import useSWR from "swr";
import { apiClient } from "../index";
import { ApiResponse, Note } from "../types";

export interface UseAdminNotesReturn {
  notes: Note[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<ApiResponse<Note[]> | undefined>;
}

export function useAdminNotes(): UseAdminNotesReturn {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Note[]>>(
    "/api/v2/notes",
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<Note[]>>(url);
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
