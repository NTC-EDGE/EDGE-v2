import { apiClient } from '../apiClient';
import { safeAsync } from '../utils/safeAsync';
import { ApiResponse, StoredFileDto } from '../types';

export const storageService = {
  async uploadFile(file: Blob | File, fileName: string, category: string, tenantId?: string) {
    return safeAsync(async () => {
      const formData = new FormData();
      formData.append('file', file, fileName);
      formData.append('category', category);

      const url = tenantId
        ? `/api/v2/tenants/${tenantId}/storage/upload`
        : `/api/v2/tenants/00000000-0000-0000-0000-000000000000/storage/upload`;

      const response = await apiClient.post<ApiResponse<StoredFileDto>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    });
  },

  getFileDownloadUrl(fileId: string, tenantId?: string): string {
    if (tenantId) {
      return `/api/v2/tenants/${tenantId}/storage/files/${fileId}`;
    }
    return `/api/v2/storage/files/${fileId}`;
  },
};
