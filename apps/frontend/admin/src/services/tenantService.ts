import { useApi } from './api';
import { Tenant, CreateTenantCommand, UpdateTenantCommand, TenantClientDto, TenantClientDetailsDto } from '@edge/api';

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
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (searchTerm !== undefined && searchTerm !== null && searchTerm.trim().length > 0) {
      params.append('searchTerm', searchTerm.trim());
    }
    const key = enabled ? `/api/v2/tenants?${params.toString()}` : null;
    return useQuery<PaginatedApiResponse<Tenant>>(key);
  };

  const useTenant = (id: string | null) => {
    return useQuery<Tenant>(id !== null && id.length > 0 ? `/api/v2/tenants/${id}` : null);
  };

  const useTenantClients = (tenantId: string | null, pageNumber = 1, pageSize = 10, search?: string) => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (search !== undefined && search !== null && search.trim().length > 0) {
      params.append('search', search.trim());
    }
    const queryString = params.toString();
    const isVal = tenantId !== null && tenantId !== undefined && tenantId.length > 0;
    const endpoint = isVal ? `/api/v2/tenants/${tenantId}/clients?${queryString}` : null;
    return useQuery<PaginatedApiResponse<TenantClientDto>>(endpoint);
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

  const useTenantTransactions = (tenantId: string | null, pageNumber = 1, pageSize = 10, search?: string) => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (search !== undefined && search !== null && search.trim().length > 0) {
      params.append('search', search.trim());
    }
    const queryString = params.toString();
    const isVal = tenantId !== null && tenantId !== undefined && tenantId.length > 0;
    const endpoint = isVal ? `/api/v2/tenants/${tenantId}/transactions?${queryString}` : null;
    return useQuery<PaginatedApiResponse<{
      id: string;
      refNo: string;
      applicantName: string;
      serviceType: string;
      amount: number;
      paymentStatus: string;
      date: string;
    }>>(endpoint);
  };

  const useTenantClientDetails = (tenantId: string | null, clientId: string | null) => {
    const isVal = tenantId !== null && tenantId !== undefined && tenantId.length > 0 && clientId !== null && clientId !== undefined && clientId.length > 0;
    const endpoint = isVal ? `/api/v2/tenants/${tenantId}/clients/${clientId}` : null;
    return useQuery<TenantClientDetailsDto>(endpoint);
  };

  return {
    useTenants,
    useTenant,
    useTenantClients,
    useTenantClientDetails,
    useTenantTransactions,
    createTenant,
    updateTenant,
    deleteTenant,
    toggleTenantActive,
  };
}
