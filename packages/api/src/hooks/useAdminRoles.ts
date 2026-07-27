import useSWR from 'swr';
import { apiClient } from '../index';
import { Role } from '../types';

export interface AdminRolesResponse {
  roles: Role[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const fetcher = (url: string) => apiClient.get<Role[]>(url).then((res) => res.data);

export function useAdminRoles(): AdminRolesResponse {
  const { data, error, mutate } = useSWR<Role[]>('/api/v2/roles', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  return {
    roles: Array.isArray(data) ? data : [],
    isLoading: !error && !data,
    isError: !!error,
    refetch: () => mutate(),
  };
}
