import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { TenantClientDetailsDto } from '../types';

export interface UseTenantClientDetailsReturn {
  client: TenantClientDetailsDto | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<TenantClientDetailsDto | undefined>;
}

export function useTenantClientDetails(tenantId?: string | null, clientId?: string | null): UseTenantClientDetailsReturn {
  const isValid = Boolean(tenantId && tenantId.trim().length > 0 && clientId && clientId.trim().length > 0);
  const endpoint = isValid ? `/api/v2/tenants/${tenantId}/clients/${clientId}` : null;

  const { data, error, isLoading, mutate } = useSWR<TenantClientDetailsDto>(
    endpoint,
    (url: string) => apiClient.get<TenantClientDetailsDto>(url).then((res) => res.data),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    client: data ?? null,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
