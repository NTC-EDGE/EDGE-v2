import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { Tenant, PaginatedApiResponse } from '../types';

export interface UseTenantsReturn {
  tenants: Tenant[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<PaginatedApiResponse<Tenant> | undefined>;
}

const fetcher = (url: string) => apiClient.get<PaginatedApiResponse<Tenant>>(url).then((res) => res.data);

export function useTenants(pageSize = 100): UseTenantsReturn {
  const { data, error, isLoading, mutate } = useSWR<PaginatedApiResponse<Tenant>>(
    `/api/v2/tenants?pageNumber=1&pageSize=${pageSize}&isActive=true`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const tenants = Array.isArray(data?.data) ? data.data : [];

  return {
    tenants,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
