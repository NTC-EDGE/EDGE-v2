import { applicationService } from '../services/applicationService';

export function useFormSubmissionMutation() {
  const createFormSubmission = async (
    applicationId: string,
    formId: string,
    fieldValues: Array<{ fieldId: string; customLabel?: string; value?: string }>,
    applicantId?: string
  ) => {
    return applicationService.createFormSubmission(applicationId, formId, fieldValues, applicantId);
  };

  const updateFormSubmissionValues = async (
    applicationId: string,
    submissionId: string,
    fieldValues: Array<{ fieldId: string; customLabel?: string; value?: string }>,
    applicantId?: string
  ) => {
    return applicationService.updateFormSubmissionValues(applicationId, submissionId, fieldValues, applicantId);
  };

  return {
    createFormSubmission,
    updateFormSubmissionValues,
  };
}
