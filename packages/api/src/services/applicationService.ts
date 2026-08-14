import { apiClient } from '../apiClient';
import { safeAsync } from '../utils/safeAsync';
import {
  ApiResponse,
  ApplicantDto,
  ApplicationDetailDto,
  ApplicationDto,
  ApplicationFeedDto,
  ApplicationSummaryDto,
  UpdateApplicationStatusRequest,
  CreateSoaRequest,
  AddSoaLineItemRequest,
  UpdateSoaLineItemRequest,
  UpdateSoaRequest,
  VerifyPaymentRequest,
  ReturnOpRequest,
  ApplicationFormSubmissionDto,
  ApplicantRequirementItemDto,
  AdminUpdateApplicantPayload,
  AdminUpdateApplicationPayload,
} from '../types';

export const applicationService = {
  async getApplications(params?: {
    queueTab?: string;
    scope?: 'queue' | 'region';
    status?: string;
  }) {
    return safeAsync(async () => {
      const response = await apiClient.get<ApiResponse<ApplicationFeedDto[]>>(
        '/api/v2/applications',
        { params }
      );
      return response.data.data ?? [];
    });
  },

  async getApplicationById(id: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<ApiResponse<ApplicationDetailDto>>(
        `/api/v2/applications/${id}`
      );
      return response.data.data;
    });
  },

  async getApplicationApplicants(applicationId: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<ApiResponse<ApplicantDto[]>>(
        `/api/v2/applications/${applicationId}/applicants`
      );
      return response.data.data ?? [];
    });
  },

  async updateStatus(id: string, body: UpdateApplicationStatusRequest) {
    return safeAsync(async () => {
      const response = await apiClient.patch(
        `/api/v2/applications/${id}/status`,
        body
      );
      return response.data;
    });
  },

  async updateApplication(id: string, data: Record<string, unknown>) {
    return safeAsync(async () => {
      const response = await apiClient.put<ApiResponse<ApplicationDto>>(
        `/api/v2/applications/${id}`,
        data
      );
      return response.data;
    });
  },

  async adminUpdateApplication(
    id: string,
    data: AdminUpdateApplicationPayload | Record<string, unknown>
  ) {
    return safeAsync(async () => {
      const response = await apiClient.patch<ApiResponse<ApplicationDto>>(
        `/api/v2/applications/${id}/admin-update`,
        data
      );
      return response.data;
    });
  },

  async adminUpdateApplicant(
    applicationId: string,
    applicantId: string,
    data: AdminUpdateApplicantPayload
  ) {
    return safeAsync(async () => {
      const response = await apiClient.patch<ApiResponse<ApplicantDto>>(
        `/api/v2/applications/${applicationId}/applicants/${applicantId}/admin-update`,
        data
      );
      return response.data;
    });
  },

  async adminUpdateApplicantProfile(
    applicationId: string,
    applicantId: string,
    data: AdminUpdateApplicantPayload
  ) {
    return this.adminUpdateApplicant(applicationId, applicantId, data);
  },

  async adminUpdateFormValues(
    applicationId: string,
    applicantId: string,
    formFields: Array<{ fieldId: string; fieldLabel: string; value?: string }>,
    submissionId?: string
  ) {
    return safeAsync(async () => {
      const response = await apiClient.patch<ApiResponse<ApplicationDto>>(
        `/api/v2/applications/${applicationId}/applicants/${applicantId}/form-values/admin-update`,
        { submissionId, formFields }
      );
      return response.data;
    });
  },

  async getApplicationFormWithSubmission(applicationId: string, applicantId?: string, submissionId?: string, applicationServiceId?: string) {
    return safeAsync(async () => {
      const queryParams = new URLSearchParams();
      if (applicantId) queryParams.set('applicantId', applicantId);
      if (submissionId) queryParams.set('submissionId', submissionId);
      if (applicationServiceId) queryParams.set('applicationServiceId', applicationServiceId);
      const queryString = queryParams.toString();
      const response = await apiClient.get<ApiResponse<ApplicationFormSubmissionDto>>(
        `/api/v2/applications/${applicationId}/form${queryString ? `?${queryString}` : ''}`
      );
      return response.data;
    });
  },

  async getApplicantServiceFormSubmission(
    applicationId: string,
    applicantId: string,
    variantId?: string
  ) {
    return safeAsync(async () => {
      const queryString = variantId ? `?variantId=${variantId}` : '';
      const response = await apiClient.get<ApiResponse<ApplicationFormSubmissionDto>>(
        `/api/v2/applications/${applicationId}/applicants/${applicantId}/form-submission${queryString}`
      );
      return response.data;
    });
  },

  async createFormSubmission(
    applicationId: string,
    formId: string,
    fieldValues: Array<{ fieldId: string; customLabel?: string; value?: string }>,
    applicantId?: string,
    applicationServiceId?: string
  ) {
    return safeAsync(async () => {
      const response = await apiClient.post<ApiResponse<string>>(
        `/api/v2/applications/${applicationId}/form-submissions`,
        { formId, applicantId, applicationServiceId, fieldValues }
      );
      return response.data;
    });
  },

  async updateFormSubmissionValues(
    applicationId: string,
    submissionId: string,
    fieldValues: Array<{ fieldId: string; customLabel?: string; value?: string }>,
    applicantId?: string
  ) {
    return safeAsync(async () => {
      const response = await apiClient.put<ApiResponse<string>>(
        `/api/v2/applications/${applicationId}/form-submissions/${submissionId}`,
        { applicantId, fieldValues }
      );
      return response.data;
    });
  },

  async createSoa(applicationId: string, body: CreateSoaRequest) {
    return safeAsync(async () => {
      const response = await apiClient.post(
        `/api/v2/applications/${applicationId}/soas`,
        body
      );
      return response.data;
    });
  },

  async generateSoa(applicationId: string) {
    return safeAsync(async () => {
      const response = await apiClient.post<ApiResponse<string[]>>(
        `/api/v2/applications/${applicationId}/soas/generate`,
        {}
      );
      return response.data;
    });
  },

  async updateSoa(soaId: string, body: UpdateSoaRequest) {
    return safeAsync(async () => {
      const response = await apiClient.put<ApiResponse<string>>(
        `/api/v2/soas/${soaId}`,
        body
      );
      return response.data;
    });
  },

  async addSoaLineItem(soaId: string, body: AddSoaLineItemRequest) {
    return safeAsync(async () => {
      const response = await apiClient.post<ApiResponse<string>>(
        `/api/v2/soas/${soaId}/line-items`,
        body
      );
      return response.data;
    });
  },

  async updateSoaLineItem(soaId: string, lineItemId: string, body: UpdateSoaLineItemRequest) {
    return safeAsync(async () => {
      const response = await apiClient.put<ApiResponse<string>>(
        `/api/v2/soas/${soaId}/line-items/${lineItemId}`,
        body
      );
      return response.data;
    });
  },

  async deleteSoaLineItem(soaId: string, lineItemId: string) {
    return safeAsync(async () => {
      const response = await apiClient.delete<ApiResponse<boolean>>(
        `/api/v2/soas/${soaId}/line-items/${lineItemId}`
      );
      return response.data;
    });
  },

  async approveSoa(soaId: string, remarks?: string) {
    return safeAsync(async () => {
      const response = await apiClient.patch(
        `/api/v2/soas/${soaId}/approve`,
        { remarks }
      );
      return response.data;
    });
  },

  async returnSoa(soaId: string, remarks: string) {
    return safeAsync(async () => {
      const response = await apiClient.patch(
        `/api/v2/soas/${soaId}/return`,
        { remarks }
      );
      return response.data;
    });
  },

  async verifyPayment(opId: string, body: VerifyPaymentRequest) {
    return safeAsync(async () => {
      const response = await apiClient.patch(
        `/api/v2/ops/${opId}/verify-payment`,
        body
      );
      return response.data;
    });
  },

  async returnOp(opId: string, body: ReturnOpRequest) {
    return safeAsync(async () => {
      const response = await apiClient.patch(
        `/api/v2/ops/${opId}/return`,
        body
      );
      return response.data;
    });
  },

  async togglePin(id: string, isPinned?: boolean) {
    return safeAsync(async () => {
      const response = await apiClient.patch(
        `/api/v2/applications/${id}/pin`,
        { isPinned }
      );
      return response.data;
    });
  },

  async toggleArchive(id: string, isArchived?: boolean) {
    return safeAsync(async () => {
      const response = await apiClient.patch(
        `/api/v2/applications/${id}/archive`,
        { isArchived }
      );
      return response.data;
    });
  },

  async evaluate(id: string, remarks?: string) {
    return safeAsync(async () => {
      const response = await apiClient.patch(
        `/api/v2/applications/${id}/evaluate`,
        { remarks }
      );
      return response.data;
    });
  },

  async getApplicantRequirements(applicationId: string, applicantId: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<ApiResponse<ApplicantRequirementItemDto[]>>(
        `/api/v2/applications/${applicationId}/applicants/${applicantId}/requirements`
      );
      return response.data;
    });
  },

  async uploadApplicantRequirement(
    applicationId: string,
    applicantId: string,
    payload: {
      requirementId?: string;
      serviceVariantRequirementId?: string;
      storedFileId: string;
    }
  ) {
    return safeAsync(async () => {
      const response = await apiClient.post<ApiResponse<string>>(
        `/api/v2/applications/${applicationId}/applicants/${applicantId}/requirements`,
        payload
      );
      return response.data;
    });
  },
};
