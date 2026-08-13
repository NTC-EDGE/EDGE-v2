import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { applicationService } from '../services/applicationService';
import { ApiResponse, ApplicationFormSubmissionDto } from '../types';

export function useApplicationFormWithSubmission(
  applicationId?: string,
  applicantId?: string,
  submissionId?: string,
  applicationServiceId?: string
) {
  const queryParams = new URLSearchParams();
  if (applicantId) queryParams.set('applicantId', applicantId);
  if (submissionId) queryParams.set('submissionId', submissionId);
  if (applicationServiceId) queryParams.set('applicationServiceId', applicationServiceId);
  const queryString = queryParams.toString();

  const key = applicationId
    ? `/api/v2/applications/${applicationId}/form${queryString ? `?${queryString}` : ''}`
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
