import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { ApiResponse, ApplicationDto } from '../types';

export function useAdminApplications(params?: {
  queueTab?: string;
  scope?: 'queue' | 'region';
  status?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.queueTab) searchParams.set('queueTab', params.queueTab);
  if (params?.scope) searchParams.set('scope', params.scope);
  if (params?.status) searchParams.set('status', params.status);

  const queryString = searchParams.toString();
  const key = `/api/v2/applications${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApplicationDto[]>>(
    key,
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<ApplicationDto[]>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    applications: data?.data ?? [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
