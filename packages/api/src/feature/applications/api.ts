import { apiClient } from '../../index';
import { ApiResponse, PaginatedApiResponse } from '../../types';
import {
  ApplicationDto,
  SubmitApplicationCommand,
  UpdateApplicationCommand,
  UploadApplicantRequirementCommand,
  GetApplicationsParams,
  PreviewCsvImportResultDto,
} from './types';

export async function submitApplication(
  command: SubmitApplicationCommand
): Promise<ApiResponse<string>> {
  const response = await apiClient.post<ApiResponse<string>>(
    '/applications',
    command
  );
  return response.data;
}

export async function submitTenantApplication(
  tenantId: string,
  command: SubmitApplicationCommand
): Promise<ApiResponse<string>> {
  const response = await apiClient.post<ApiResponse<string>>(
    `/tenants/${tenantId}/applications`,
    command
  );
  return response.data;
}

export async function getApplicationById(
  id: string
): Promise<ApiResponse<ApplicationDto>> {
  const response = await apiClient.get<ApiResponse<ApplicationDto>>(
    `/applications/${id}`
  );
  return response.data;
}

export async function getDraftApplications(): Promise<
  ApiResponse<ApplicationDto[]>
> {
  const response = await apiClient.get<ApiResponse<ApplicationDto[]>>(
    '/applications/drafts'
  );
  return response.data;
}

export async function getApplications(
  params?: GetApplicationsParams
): Promise<PaginatedApiResponse<ApplicationDto>> {
  const queryParams = new URLSearchParams();
  if (params !== undefined) {
    if (params.tenantId !== undefined && params.tenantId !== null) {
      queryParams.append('tenantId', params.tenantId);
    }
    if (params.status !== undefined && params.status !== null) {
      queryParams.append('status', params.status);
    }
    if (params.search !== undefined && params.search !== null) {
      queryParams.append('search', params.search);
    }
    if (params.pageNumber !== undefined && params.pageNumber !== null) {
      queryParams.append('pageNumber', params.pageNumber.toString());
    }
    if (params.pageSize !== undefined && params.pageSize !== null) {
      queryParams.append('pageSize', params.pageSize.toString());
    }
  }

  const url = queryParams.toString() !== ''
    ? `/applications?${queryParams.toString()}`
    : '/applications';

  const response = await apiClient.get<PaginatedApiResponse<ApplicationDto>>(url);
  return response.data;
}

export async function updateApplicationDraft(
  id: string,
  command: UpdateApplicationCommand
): Promise<ApiResponse<void>> {
  const response = await apiClient.put<ApiResponse<void>>(
    `/applications/${id}`,
    command
  );
  return response.data;
}

export async function deleteDraftApplication(
  id: string
): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/applications/${id}`
  );
  return response.data;
}

export async function finalizeApplicationSubmission(
  id: string
): Promise<ApiResponse<void>> {
  const response = await apiClient.post<ApiResponse<void>>(
    `/applications/${id}/submit`
  );
  return response.data;
}

export async function uploadApplicantRequirement(
  id: string,
  applicantId: string,
  command: UploadApplicantRequirementCommand
): Promise<ApiResponse<void>> {
  const response = await apiClient.post<ApiResponse<void>>(
    `/applications/${id}/applicants/${applicantId}/requirements`,
    command
  );
  return response.data;
}

export async function uploadTenantApplicationRequirement(
  tenantId: string,
  appId: string,
  command: UploadApplicantRequirementCommand
): Promise<ApiResponse<void>> {
  const response = await apiClient.patch<ApiResponse<void>>(
    `/tenants/${tenantId}/applications/${appId}`,
    command
  );
  return response.data;
}

export async function previewCsvImport(
  file: File | Blob
): Promise<ApiResponse<PreviewCsvImportResultDto>> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<PreviewCsvImportResultDto>>(
    '/applications/csv-preview',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}
