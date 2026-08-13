import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { applicationService } from '../services/applicationService';
import { ApiResponse, ApplicationFormSubmissionDto } from '../types';

export function useApplicationFormWithSubmission(
  applicationId?: string,
  applicantId?: string,
  variantId?: string
) {
  const queryString = variantId ? `?variantId=${variantId}` : '';

  const key = applicationId && applicantId
    ? `/api/v2/applications/${applicationId}/applicants/${applicantId}/form-submission${queryString}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApplicationFormSubmissionDto>>(
    key,
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<ApplicationFormSubmissionDto>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  const createSubmission = async (
    formId: string,
    fieldValues: Array<{ fieldId: string; customLabel?: string; value?: string }>
  ) => {
    if (!applicationId) return [null, new Error('Application ID is required.')] as const;
    const result = await applicationService.createFormSubmission(
      applicationId,
      formId,
      fieldValues,
      applicantId
    );
    if (result[0]?.succeeded) {
      await mutate();
    }
    return result;
  };

  const updateSubmissionValues = async (
    targetSubmissionId: string,
    fieldValues: Array<{ fieldId: string; customLabel?: string; value?: string }>
  ) => {
    if (!applicationId) return [null, new Error('Application ID is required.')] as const;
    const result = await applicationService.updateFormSubmissionValues(
      applicationId,
      targetSubmissionId,
      fieldValues,
      applicantId
    );
    if (result[0]?.succeeded) {
      await mutate();
    }
    return result;
  };

  return {
    formData: data?.data ?? null,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
    createSubmission,
    updateSubmissionValues,
  };
}
