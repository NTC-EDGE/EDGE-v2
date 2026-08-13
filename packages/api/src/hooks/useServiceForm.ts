import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { ApiResponse, FormDto } from '../types';

export function useServiceForm(serviceId?: string) {
  const key = serviceId ? `/api/v2/services/${serviceId}/form` : null;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<FormDto>>(
    key,
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<FormDto>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    form: data?.data ?? null,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
