import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { ApiResponse } from '../types';

export interface UseRolePermissionsReturn {
  permissionKeys: string[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useRolePermissions(roleId?: string): UseRolePermissionsReturn {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<string[]>>(
    roleId ? `/api/v2/role-permissions/${roleId}` : null,
    async (url: string) => {
      const res = await apiClient.get<ApiResponse<string[]>>(url);
      return res.data;
    },
    { revalidateOnFocus: false }
  );

  return {
    permissionKeys: data?.data ?? [],
    isLoading: isLoading && !!roleId,
    isError: Boolean(error),
    refetch: mutate,
  };
}
