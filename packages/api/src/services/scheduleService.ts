import { apiClient } from '../apiClient';
import {
  ApiResponse,
  PaginatedApiResponse,
  ScheduleItemDto,
  CreateSchedulePayload,
  UpdateSchedulePayload,
  PublishSchedulePayload,
} from '../types';
import { safeAsync } from '../utils/safeAsync';

export interface GetSchedulesParams {
  tenantId?: string;
  serviceId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ExamAdmissionVerificationDto {
  issuedDocumentId: string;
  applicationId: string;
  applicantId?: string | null;
  scheduleId?: string | null;
  tenantId: string;
  qrVerificationCode: string;
  formNumber: string;
  licenseNumber?: string | null;
  referenceNumber: string;
  applicationNumber?: string | null;
  examineeName: string;
  sex?: string | null;
  birthDate?: string | null;
  nationality?: string | null;
  email?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  photoStoredFileId?: string | null;
  photoUrl?: string | null;
  examTitle: string;
  examType?: string | null;
  examElements?: string | null;
  examVenue?: string | null;
  examDate?: string | null;
  examTime?: string | null;
  officialReceiptNumber?: string | null;
  applicationStatus: string;
  isValidForAdmission: boolean;
  validationMessage: string;
  isAdmitted: boolean;
  admittedAt?: string | null;
  admittedByStaffName?: string | null;
  admissionRemarks?: string | null;
}

export interface VerifyAdmissionQrParams {
  code: string;
  scheduleId?: string;
  tenantId?: string;
}

export interface GetScheduleExamineesParams {
  scheduleId?: string;
  tenantId?: string;
}

export interface AdmitExamineePayload {
  code?: string;
  issuedDocumentId?: string;
  applicationId?: string;
  applicantId?: string | null;
  scheduleId?: string | null;
  tenantId?: string | null;
  remarks?: string;
}

export const scheduleService = {
  /**
   * Fetch paginated list of schedules with optional filtering
   */
  async getSchedules(params?: GetSchedulesParams) {
    return safeAsync(async () => {
      const searchParams = new URLSearchParams();
      if (params?.tenantId !== undefined && params.tenantId !== null && params.tenantId.trim().length > 0) {
        searchParams.append('tenantId', params.tenantId.trim());
      }
      if (params?.serviceId !== undefined && params.serviceId !== null && params.serviceId.trim().length > 0) {
        searchParams.append('serviceId', params.serviceId.trim());
      }
      if (params?.pageNumber !== undefined && params.pageNumber !== null && params.pageNumber > 0) {
        searchParams.append('pageNumber', params.pageNumber.toString());
      }
      if (params?.pageSize !== undefined && params.pageSize !== null && params.pageSize > 0) {
        searchParams.append('pageSize', params.pageSize.toString());
      }

      const queryString = searchParams.toString();
      const endpoint = `/api/v2/schedules${queryString.length > 0 ? `?${queryString}` : ''}`;
      const response = await apiClient.get<PaginatedApiResponse<ScheduleItemDto>>(endpoint);
      return response.data;
    }, 'Failed to fetch schedules');
  },

  /**
   * Fetch single schedule by ID
   */
  async getScheduleById(id: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<ScheduleItemDto>(`/api/v2/schedules/${id}`);
      return response.data;
    }, 'Failed to fetch schedule details');
  },

  /**
   * Create a new appointment/operations schedule
   */
  async createSchedule(payload: CreateSchedulePayload) {
    return safeAsync(async () => {
      const response = await apiClient.post<ScheduleItemDto>('/api/v2/schedules', payload);
      return response.data;
    }, 'Failed to create schedule');
  },

  /**
   * Update an existing schedule
   */
  async updateSchedule(id: string, payload: UpdateSchedulePayload) {
    return safeAsync(async () => {
      const response = await apiClient.put<ScheduleItemDto>(`/api/v2/schedules/${id}`, payload);
      return response.data;
    }, 'Failed to update schedule');
  },

  /**
   * Set or toggle the published status of a schedule
   */
  async togglePublish(id: string, isPublished: boolean) {
    return safeAsync(async () => {
      const payload: PublishSchedulePayload = { isPublished };
      const response = await apiClient.patch<ScheduleItemDto>(`/api/v2/schedules/${id}/publish`, payload);
      return response.data;
    }, `Failed to ${isPublished ? 'publish' : 'unpublish'} schedule`);
  },

  /**
   * Delete a schedule
   */
  async deleteSchedule(id: string) {
    return safeAsync(async () => {
      await apiClient.delete(`/api/v2/schedules/${id}`);
      return true;
    }, 'Failed to delete schedule');
  },

  /**
   * Verify Exam Admission Slip QR verification code, control number, or reference number
   */
  async verifyAdmissionQr(params: VerifyAdmissionQrParams) {
    return safeAsync(async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('code', params.code.trim());
      if (params.scheduleId !== undefined && params.scheduleId.trim().length > 0) {
        searchParams.append('scheduleId', params.scheduleId.trim());
      }
      if (params.tenantId !== undefined && params.tenantId.trim().length > 0) {
        searchParams.append('tenantId', params.tenantId.trim());
      }

      const response = await apiClient.get<ApiResponse<ExamAdmissionVerificationDto>>(
        `/api/v2/schedules/admission/verify?${searchParams.toString()}`
      );
      if (response.data.succeeded === false) {
        throw new Error(response.data.message || 'Invalid or unrecognized Exam Admission Slip QR code.');
      }
      return response.data.data;
    }, 'Failed to verify Exam Admission Slip QR code');
  },

  /**
   * Fetch scheduled examinees and their QR admission check-in status
   */
  async getScheduleExaminees(params?: GetScheduleExamineesParams) {
    return safeAsync(async () => {
      const searchParams = new URLSearchParams();
      if (params?.scheduleId !== undefined && params.scheduleId.trim().length > 0) {
        searchParams.append('scheduleId', params.scheduleId.trim());
      }
      if (params?.tenantId !== undefined && params.tenantId.trim().length > 0) {
        searchParams.append('tenantId', params.tenantId.trim());
      }

      const queryString = searchParams.toString();
      const endpoint = `/api/v2/schedules/admission/examinees${queryString.length > 0 ? `?${queryString}` : ''}`;
      const response = await apiClient.get<ApiResponse<ExamAdmissionVerificationDto[]>>(endpoint);
      return response.data.data ?? [];
    }, 'Failed to fetch examinees roster');
  },

  /**
   * Admit examinee at examination venue from verified Exam Admission Slip QR code
   */
  async admitExaminee(payload: AdmitExamineePayload) {
    return safeAsync(async () => {
      const response = await apiClient.post<ApiResponse<ExamAdmissionVerificationDto>>(
        '/api/v2/schedules/admission/admit',
        payload
      );
      if (response.data.succeeded === false) {
        throw new Error(response.data.message || 'Failed to admit examinee.');
      }
      return response.data.data;
    }, 'Failed to admit examinee');
  },
};
