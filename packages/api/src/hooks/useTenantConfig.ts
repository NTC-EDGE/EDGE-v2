import useSWR from 'swr';
import { fetchTenantConfig, DEFAULT_TENANT_CONFIG } from '../services/tenantConfigService';
import { RegionalConfigDto } from '../types/region';

export interface UseTenantConfigReturn {
  config: RegionalConfigDto;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<RegionalConfigDto | undefined>;
}

export function useTenantConfig(tenantId?: string): UseTenantConfigReturn {
  const key = tenantId !== undefined && tenantId !== null && tenantId.length > 0
    ? `/api/v2/tenants/${tenantId}/config`
    : '/api/v2/tenants/config';

  const { data, error, isLoading, mutate } = useSWR<RegionalConfigDto>(
    key,
    () => fetchTenantConfig(tenantId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  return {
    config: data !== undefined && data !== null ? data : DEFAULT_TENANT_CONFIG,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
