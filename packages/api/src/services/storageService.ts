import { apiClient, HEAVY_API_TIMEOUT_MS } from '../apiClient';
import { safeAsync } from '../utils/safeAsync';
import { ApiResponse, StoredFileDto } from '../types';

function normalizeDownloadUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  // Collapse accidental duplicate slashes in the path (e.g. https://host//api/v2/... -> https://host/api/v2/...)
  return trimmed.replace(/([^:]\/)\/+/g, '$1').replace(/^\/\/+/, '/');
}

export const storageService = {
  async uploadFile(file: Blob | File, fileName: string, category: string, tenantId: string) {
    return safeAsync(async () => {
      if (!tenantId || tenantId.trim() === '' || tenantId === '00000000-0000-0000-0000-000000000000') {
        throw new Error('Tenant ID is strictly required for storage file upload to maintain multi-tenant isolation.');
      }

      const formData = new FormData();
      formData.append('file', file, fileName);
      formData.append('category', category);

      const url = `/api/v2/tenants/${tenantId}/storage/upload`;

      const response = await apiClient.post<ApiResponse<StoredFileDto>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    });
  },

  async downloadFile(fileId: string, tenantId?: string) {
    return safeAsync(async () => {
      const downloadUrl = storageService.getFileDownloadUrl(fileId, tenantId);
      const response = await apiClient.get<Blob>(downloadUrl, {
        responseType: 'blob',
      });
      return response.data;
    });
  },

  async downloadFileByUrl(url: string) {
    return safeAsync(async () => {
      const normalizedUrl = normalizeDownloadUrl(url);
      const response = await apiClient.get<Blob>(normalizedUrl, {
        responseType: 'blob',
        timeout: HEAVY_API_TIMEOUT_MS,
      });
      return response.data;
    });
  },

  getFileDownloadUrl(fileId: string, tenantId?: string): string {
    if (tenantId && tenantId !== '00000000-0000-0000-0000-000000000000') {
      return `/api/v2/tenants/${tenantId}/storage/files/${fileId}`;
    }
    return `/api/v2/storage/files/${fileId}`;
  },
};
