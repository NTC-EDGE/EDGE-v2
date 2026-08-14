import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { ApiResponse, ApplicantDto } from '../types';

export function useAdminApplicationApplicants(applicationId?: string | null) {
  const key = applicationId ? `/api/v2/applications/${applicationId}/applicants` : null;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApplicantDto[]>>(
    key,
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<ApplicantDto[]>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    applicants: data?.data ?? [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
