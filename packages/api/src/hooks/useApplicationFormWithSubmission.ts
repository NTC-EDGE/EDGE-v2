import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { ApiResponse, ApplicationFormSubmissionDto } from '../types';

export function useApplicationFormWithSubmission(
  applicationId?: string,
  applicantId?: string
) {
  const key = applicationId
    ? `/api/v2/applications/${applicationId}/form${applicantId ? `?applicantId=${applicantId}` : ''}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApplicationFormSubmissionDto>>(
    key,
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<ApplicationFormSubmissionDto>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    formData: data?.data ?? null,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
