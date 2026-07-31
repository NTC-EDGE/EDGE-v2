import { useApi } from './api';
import { Tenant, CreateTenantCommand, UpdateTenantCommand } from '@edge/api';

export function useTenantService() {
  const { useQuery, post, put, del } = useApi();

  const useTenants = () => {
    return useQuery<Tenant[]>('/api/v2/tenants');
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
