import { apiClient, ApiResponse, StoredFileDto } from '@edge/api';

export async function uploadStorageFile(
  file: Blob | File,
  fileName: string,
  category: string,
  tenantId?: string,
  authToken?: string
): Promise<ApiResponse<StoredFileDto>> {
  const formData = new FormData();
  formData.append('file', file, fileName);
  formData.append('category', category);

  const headers: Record<string, string> = {
    'Content-Type': 'multipart/form-data',
  };

  if (authToken !== undefined && authToken !== null && authToken.length > 0) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const url = (tenantId !== undefined && tenantId !== null && tenantId.length > 0)
    ? `/api/v2/tenants/${tenantId}/storage/upload`
    : '/api/v2/storage/upload';

  const response = await apiClient.post<ApiResponse<StoredFileDto>>(url, formData, {
    headers,
  });

  return response.data;
}

export function getFileDownloadUrl(fileId: string, tenantId?: string): string {
  if (tenantId !== undefined && tenantId !== null && tenantId.length > 0) {
    return `/api/v2/tenants/${tenantId}/storage/files/${fileId}`;
  }

  return `/api/v2/storage/files/${fileId}`;
}

export async function deleteStorageFile(
  fileId: string,
  tenantId?: string,
  authToken?: string
): Promise<ApiResponse<boolean>> {
  const headers: Record<string, string> = {};

  if (authToken !== undefined && authToken !== null && authToken.length > 0) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const url = (tenantId !== undefined && tenantId !== null && tenantId.length > 0)
    ? `/api/v2/tenants/${tenantId}/storage/files/${fileId}`
    : `/api/v2/storage/files/${fileId}`;

  const response = await apiClient.delete<ApiResponse<boolean>>(url, {
    headers,
  });

  return response.data;
}
