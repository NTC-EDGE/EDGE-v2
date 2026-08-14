import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { ApiResponse, ApplicationDetailDto } from '../types';

export function useAdminApplicationDetails(id?: string | null) {
  const key = id ? `/api/v2/applications/${id}` : null;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApplicationDetailDto>>(
    key,
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<ApplicationDetailDto>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    applicationDto: data?.data ?? null,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
