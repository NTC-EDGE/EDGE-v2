import { useApi } from './api';
import { Role, CreateRoleCommand, UpdateRoleCommand, Permission } from '@edge/api';

export function useRoleService() {
  const { useQuery, post, put, del } = useApi();

  const useRoles = (tenantId?: string | null) => {
    const queryStr = tenantId !== undefined && tenantId !== null && tenantId.length > 0 ? `?tenantId=${tenantId}` : '';
    return useQuery<Role[]>(`/roles${queryStr}`);
  };

  const useRole = (id: string | null) => {
    return useQuery<Role>(id !== null && id.length > 0 ? `/roles/${id}` : null);
  };

  const usePermissions = () => {
    return useQuery<Permission[]>('/permissions');
  };

  const createRole = async (command: CreateRoleCommand): Promise<Role> => {
    return post<Role, CreateRoleCommand>('/roles', command);
  };

  const updateRole = async (id: string, command: UpdateRoleCommand): Promise<Role> => {
    return put<Role, UpdateRoleCommand>(`/roles/${id}`, command);
  };

  const deleteRole = async (id: string): Promise<void> => {
    return del<void>(`/roles/${id}`);
  };

  return {
    useRoles,
    useRole,
    usePermissions,
    createRole,
    updateRole,
    deleteRole,
  };
}
