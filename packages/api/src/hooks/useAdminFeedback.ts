import useSWR from "swr";
import { apiClient } from "../apiClient";
import { ApiResponse, FeedbackDto } from "../types";

export interface UseAdminFeedbackReturn {
  feedback: FeedbackDto[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<ApiResponse<FeedbackDto[]> | undefined>;
}

export function useAdminFeedback(): UseAdminFeedbackReturn {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<FeedbackDto[]>>(
    "/api/v2/feedback",
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<FeedbackDto[]>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    feedback: data?.data ?? [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
