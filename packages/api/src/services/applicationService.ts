import { apiClient } from '../apiClient';
import { safeAsync } from '../utils/safeAsync';
import {
  ApiResponse,
  ApplicationDto,
  UpdateApplicationStatusRequest,
  CreateSoaRequest,
  VerifyPaymentRequest,
  ReturnOpRequest,
} from '../types';

export const applicationService = {
  async getApplications(params?: {
    queueTab?: string;
    scope?: 'queue' | 'region';
    status?: string;
  }) {
    return safeAsync(async () => {
      const response = await apiClient.get<ApiResponse<ApplicationDto[]>>(
        '/api/v2/applications',
        { params }
      );
      return response.data.data ?? [];
    });
  },

  async getApplicationById(id: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<ApiResponse<ApplicationDto>>(
        `/api/v2/applications/${id}`
      );
      return response.data.data;
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

  async adminUpdateApplication(id: string, data: Record<string, unknown>) {
    return safeAsync(async () => {
      const response = await apiClient.patch<ApiResponse<ApplicationDto>>(
        `/api/v2/applications/${id}/admin-update`,
        data
      );
      return response.data;
    });
  },

  async adminUpdateApplicantProfile(applicationId: string, applicantId: string, data: Record<string, unknown>) {
    return safeAsync(async () => {
      const response = await apiClient.patch<ApiResponse<ApplicationDto>>(
        `/api/v2/applications/${applicationId}/applicants/${applicantId}/admin-update`,
        data
      );
      return response.data;
    });
  },

  async adminUpdateFormValues(applicationId: string, applicantId: string, formFields: Array<{ fieldId: string; fieldLabel: string; value?: string }>) {
    return safeAsync(async () => {
      const response = await apiClient.patch<ApiResponse<ApplicationDto>>(
        `/api/v2/applications/${applicationId}/applicants/${applicantId}/form-values/admin-update`,
        { formFields }
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
};
