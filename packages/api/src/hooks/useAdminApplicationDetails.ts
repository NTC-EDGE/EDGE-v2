import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { ApiResponse, ApplicationDto } from '../types';

export interface UseAdminApplicationDetailsOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  dedupingInterval?: number;
}

export function useAdminApplicationDetails(
  id?: string | null,
  options?: UseAdminApplicationDetailsOptions
) {
  const key = id ? `/api/v2/applications/${id}` : null;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApplicationDto>>(
    key,
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<ApplicationDto>>(url);
      return res.data;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? true,
      refreshInterval: options?.refreshInterval ?? 3000,
      dedupingInterval: options?.dedupingInterval ?? 1500,
    }
  );

  return {
    applicationDto: data?.data ?? null,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
