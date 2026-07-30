import { apiClient } from '../apiClient';
import { ApiResponse, Fee } from '../types';
import { safeAsync } from '../utils/safeAsync';

export const feeMasterService = {
  /**
   * Transport layer method to fetch all fee master entities from /api/v2/fees
   */
  async getFeeMasterCatalog(activeOnly = true) {
    return safeAsync(async () => {
      const response = await apiClient.get<ApiResponse<Fee[]>>(
        `/api/v2/fees${activeOnly ? '?activeOnly=true' : ''}`
      );
      return response.data?.data ?? [];
    }, 'Failed to fetch fee catalog from endpoint');
  },
};
