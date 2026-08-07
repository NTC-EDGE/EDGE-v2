import { useApi } from './api';
import { Tenant, CreateTenantCommand, UpdateTenantCommand } from '@edge/api';

export interface PaginatedApiResponse<T> {
  succeeded: boolean;
  message?: string;
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export function useTenantService() {
  const { useQuery, post, put, del } = useApi();

  const useTenants = (pageNumber = 1, pageSize = 50, searchTerm?: string, enabled = true) => {
    if (!enabled) {
      return useQuery<PaginatedApiResponse<Tenant>>(null);
    }
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (searchTerm !== undefined && searchTerm !== null && searchTerm.trim().length > 0) {
      params.append('searchTerm', searchTerm.trim());
    }
    return useQuery<PaginatedApiResponse<Tenant>>(`/api/v2/tenants?${params.toString()}`);
  };

  const useTenant = (id: string | null) => {
    return useQuery<Tenant>(id !== null && id.length > 0 ? `/api/v2/tenants/${id}` : null);
  };

  const createTenant = async (command: CreateTenantCommand): Promise<Tenant> => {
    return post<Tenant, CreateTenantCommand>('/api/v2/tenants', command);
  };

  const updateTenant = async (id: string, command: UpdateTenantCommand): Promise<Tenant> => {
    return put<Tenant, UpdateTenantCommand>(`/api/v2/tenants/${id}`, command);
  };

  const deleteTenant = async (id: string): Promise<void> => {
    return del<void>(`/api/v2/tenants/${id}`);
  };

  const toggleTenantActive = async (id: string): Promise<Tenant> => {
    return post<Tenant, undefined>(`/api/v2/tenants/${id}/toggle-active`, undefined);
  };

  return {
    useTenants,
    useTenant,
    createTenant,
    updateTenant,
    deleteTenant,
    toggleTenantActive,
  };
}
