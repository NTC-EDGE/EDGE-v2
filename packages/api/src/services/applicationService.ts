import { apiClient } from '../apiClient';
import { safeAsync } from '../utils/safeAsync';
import {
  ApiResponse,
  ApplicationDto,
  ApplicationSummaryDto,
  UpdateApplicationStatusRequest,
  CreateSoaRequest,
  VerifyPaymentRequest,
  ReturnOpRequest,
  ApplicationFormSubmissionDto,
  ApplicantRequirementItemDto,
  FeeCalculationResultDto,
  IssueApplicationRequest,
  IssuedDocumentDetailDto,
  GeneratedDocumentNumbersDto,
  SubmitPaymentRequest,
} from '../types';

export const applicationService = {
  async getApplications(params?: {
    queueTab?: string;
    scope?: 'queue' | 'region';
    status?: string;
  }) {
    return safeAsync(async () => {
      const response = await apiClient.get<ApiResponse<ApplicationSummaryDto[]>>(
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

  async calculateApplicationFees(
    applicationId: string,
    params?: {
      applicantId?: string;
      validityYears?: number;
      noOfUnits?: number;
      expirationDate?: string;
      additionalServicesCount?: number;
      noOfCopies?: number;
    }
  ) {
    return safeAsync(async () => {
      const response = await apiClient.get<ApiResponse<FeeCalculationResultDto>>(
        `/api/v2/applications/${applicationId}/calculated-fees`,
        { params }
      );
      return response.data;
    });
  },

  async createSoa(applicationId: string, body?: CreateSoaRequest) {
    return safeAsync(async () => {
      const response = await apiClient.post(
        `/api/v2/applications/${applicationId}/soas`,
        body ?? {}
      );
      return response.data;
    });
  },

  async approveSoa(soaOrApplicationId: string, remarks?: string) {
    return safeAsync(async () => {
      const response = await apiClient.patch(
        `/api/v2/soas/${soaOrApplicationId}/approve`,
        { remarks, applicationId: soaOrApplicationId }
      );
      return response.data;
    });
  },

  async returnSoa(soaOrApplicationId: string, remarks: string) {
    return safeAsync(async () => {
      const response = await apiClient.patch(
        `/api/v2/soas/${soaOrApplicationId}/return`,
        { remarks, applicationId: soaOrApplicationId }
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

  async issueApplication(id: string, body: IssueApplicationRequest) {
    return safeAsync(async () => {
      const response = await apiClient.post<ApiResponse<IssuedDocumentDetailDto>>(
        `/api/v2/applications/${id}/issue`,
        body
      );
      return response.data;
    });
  },

  async getNextDocumentNumbers(id: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<ApiResponse<GeneratedDocumentNumbersDto>>(
        `/api/v2/applications/${id}/next-document-numbers`
      );
      return response.data;
    });
  },

  async submitPayment(id: string, body: SubmitPaymentRequest) {
    return safeAsync(async () => {
      const response = await apiClient.post<ApiResponse<boolean>>(
        `/api/v2/applications/${id}/submit-payment`,
        body
      );
      return response.data;
    });
  },

  getSoaPrintUrl(applicationId: string): string {
    const base = typeof apiClient.defaults.baseURL === 'string' ? apiClient.defaults.baseURL : '';
    return `${base}/api/v2/applications/${applicationId}/soa/print`;
  },

  getSoaDownloadUrl(applicationId: string): string {
    const base = typeof apiClient.defaults.baseURL === 'string' ? apiClient.defaults.baseURL : '';
    return `${base}/api/v2/applications/${applicationId}/soa/print?download=true`;
  },

  getOpPrintUrl(applicationId: string): string {
    const base = typeof apiClient.defaults.baseURL === 'string' ? apiClient.defaults.baseURL : '';
    return `${base}/api/v2/applications/${applicationId}/op/print`;
  },

  getOpDownloadUrl(applicationId: string): string {
    const base = typeof apiClient.defaults.baseURL === 'string' ? apiClient.defaults.baseURL : '';
    return `${base}/api/v2/applications/${applicationId}/op/print?download=true`;
  },

  async previewSoaPdf(applicationId: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<Blob>(
        `/api/v2/applications/${applicationId}/soa/print`,
        { responseType: 'blob' }
      );
      return response.data;
    });
  },

  async downloadSoaPdf(applicationId: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<Blob>(
        `/api/v2/applications/${applicationId}/soa/print?download=true`,
        { responseType: 'blob' }
      );
      return response.data;
    });
  },

  async previewOpPdf(applicationId: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<Blob>(
        `/api/v2/applications/${applicationId}/op/print`,
        { responseType: 'blob' }
      );
      return response.data;
    });
  },

  async downloadOpPdf(applicationId: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<Blob>(
        `/api/v2/applications/${applicationId}/op/print?download=true`,
        { responseType: 'blob' }
      );
      return response.data;
    });
  },

  getOrPrintUrl(applicationId: string, orNumber?: string, template?: 'portrait' | 'landscape'): string {
    const base = typeof apiClient.defaults.baseURL === 'string' ? apiClient.defaults.baseURL : '';
    const params = new URLSearchParams();
    if (orNumber) params.append('orNumber', orNumber);
    if (template) params.append('template', template);
    const qs = params.toString();
    return `${base}/api/v2/applications/${applicationId}/or/print${qs ? `?${qs}` : ''}`;
  },

  getOrDownloadUrl(applicationId: string, orNumber?: string, template?: 'portrait' | 'landscape'): string {
    const base = typeof apiClient.defaults.baseURL === 'string' ? apiClient.defaults.baseURL : '';
    const params = new URLSearchParams();
    params.append('download', 'true');
    if (orNumber) params.append('orNumber', orNumber);
    if (template) params.append('template', template);
    return `${base}/api/v2/applications/${applicationId}/or/print?${params.toString()}`;
  },

  async previewOrPdf(applicationId: string, orNumber?: string, template?: 'portrait' | 'landscape') {
    return safeAsync(async () => {
      const response = await apiClient.get<Blob>(
        `/api/v2/applications/${applicationId}/or/print`,
        {
          params: {
            ...(orNumber ? { orNumber } : {}),
            ...(template ? { template } : {}),
          },
          responseType: 'blob',
        }
      );
      return response.data;
    });
  },

  async downloadOrPdf(applicationId: string, orNumber?: string, template?: 'portrait' | 'landscape') {
    return safeAsync(async () => {
      const response = await apiClient.get<Blob>(
        `/api/v2/applications/${applicationId}/or/print`,
        {
          params: {
            download: true,
            ...(orNumber ? { orNumber } : {}),
            ...(template ? { template } : {}),
          },
          responseType: 'blob',
        }
      );
      return response.data;
    });
  },

  getIssuedDocumentPrintUrl(applicationId: string): string {
    const base = typeof apiClient.defaults.baseURL === 'string' ? apiClient.defaults.baseURL : '';
    return `${base}/api/v2/applications/${applicationId}/issued-document/print`;
  },

  getIssuedDocumentDownloadUrl(applicationId: string): string {
    const base = typeof apiClient.defaults.baseURL === 'string' ? apiClient.defaults.baseURL : '';
    return `${base}/api/v2/applications/${applicationId}/issued-document/print?download=true`;
  },

  async previewIssuedDocumentPdf(applicationId: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<Blob>(
        `/api/v2/applications/${applicationId}/issued-document/print`,
        { responseType: 'blob' }
      );
      return response.data;
    });
  },

  async downloadIssuedDocumentPdf(applicationId: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<Blob>(
        `/api/v2/applications/${applicationId}/issued-document/print?download=true`,
        { responseType: 'blob' }
      );
      return response.data;
    });
  },

  getApplicationFormPrintUrl(applicationId: string): string {
    const base = typeof apiClient.defaults.baseURL === 'string' ? apiClient.defaults.baseURL : '';
    return `${base}/api/v2/applications/${applicationId}/form/print`;
  },

  getApplicationFormDownloadUrl(applicationId: string): string {
    const base = typeof apiClient.defaults.baseURL === 'string' ? apiClient.defaults.baseURL : '';
    return `${base}/api/v2/applications/${applicationId}/form/print?download=true`;
  },

  async previewApplicationFormPdf(applicationId: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<Blob>(
        `/api/v2/applications/${applicationId}/form/print`,
        { responseType: 'blob' }
      );
      return response.data;
    });
  },

  async downloadApplicationFormPdf(applicationId: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<Blob>(
        `/api/v2/applications/${applicationId}/form/print?download=true`,
        { responseType: 'blob' }
      );
      return response.data;
    });
  },
};


