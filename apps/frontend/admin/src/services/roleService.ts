import { useApi } from './api';
import { Role, CreateRoleCommand, UpdateRoleCommand, DuplicateRoleCommand, Permission } from '@edge/api';

export function useRoleService() {
  const { useQuery, post, put, del } = useApi();

  const useRoles = (tenantId?: string | null, includeSystemRoles?: boolean) => {
    if (tenantId === null) {
      return useQuery<Role[]>(null);
    }
    const params = new URLSearchParams();
    if (tenantId !== undefined && tenantId.length > 0) {
      params.append('tenantId', tenantId);
    }
    if (includeSystemRoles === true) {
      params.append('includeSystemRoles', 'true');
    }
    const queryStr = params.toString().length > 0 ? `?${params.toString()}` : '';
    return useQuery<Role[]>(`/api/v2/roles${queryStr}`);
  };

  const useRole = (id: string | null) => {
    return useQuery<Role>(id !== null && id.length > 0 ? `/api/v2/roles/${id}` : null);
  };

  const usePermissions = () => {
    return useQuery<Permission[]>('/api/v2/permissions');
  };

  const createRole = async (command: CreateRoleCommand): Promise<Role> => {
    return post<Role, CreateRoleCommand>('/api/v2/roles', command);
  };

  const duplicateRole = async (command: DuplicateRoleCommand): Promise<Role> => {
    return post<Role, DuplicateRoleCommand>(`/api/v2/roles/${command.sourceRoleId}/duplicate`, command);
  };

  const updateRole = async (id: string, command: UpdateRoleCommand): Promise<Role> => {
    return put<Role, UpdateRoleCommand>(`/api/v2/roles/${id}`, command);
  };

  const deleteRole = async (id: string): Promise<void> => {
    return del<void>(`/api/v2/roles/${id}`);
  };

  return {
    useRoles,
    useRole,
    usePermissions,
    createRole,
    duplicateRole,
    updateRole,
    deleteRole,
  };
}
