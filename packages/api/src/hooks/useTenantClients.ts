import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { PaginatedApiResponse, TenantClientDto } from '../types';

export interface UseTenantClientsParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

export interface UseTenantClientsReturn {
  clients: TenantClientDto[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<PaginatedApiResponse<TenantClientDto> | undefined>;
}

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export function useTenantClients(tenantId?: string | null, params?: UseTenantClientsParams): UseTenantClientsReturn {
  const effectiveTenantId = tenantId && tenantId.trim().length > 0 ? tenantId : DEFAULT_TENANT_ID;

  const searchParams = new URLSearchParams();
  if (params?.pageNumber) searchParams.set('pageNumber', params.pageNumber.toString());
  if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params?.search && params.search.trim().length > 0) searchParams.set('search', params.search.trim());

  const queryString = searchParams.toString();
  const endpoint = `/api/v2/tenants/${effectiveTenantId}/clients${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedApiResponse<TenantClientDto>>(
    endpoint,
    (url: string) => apiClient.get<PaginatedApiResponse<TenantClientDto>>(url).then((res) => res.data),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const rawData = data?.data ?? (data as unknown as { items?: TenantClientDto[] })?.items ?? [];
  const clients = Array.isArray(rawData) ? rawData : [];
  const totalCount = data?.totalCount ?? clients.length;
  const totalPages = data?.totalPages ?? (params?.pageSize ? Math.ceil(totalCount / params.pageSize) : 1);

  return {
    clients,
    totalCount,
    totalPages,
    pageNumber: data?.pageNumber ?? params?.pageNumber ?? 1,
    pageSize: data?.pageSize ?? params?.pageSize ?? 10,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
