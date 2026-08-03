import { useApi } from './api';

// Shape returned by GET /api/v2/permissions (matches actual backend response)
export interface PermissionDefinition {
  key: string;
  category: string;
  label: string;
  scope: string;
  tag: string;
  description?: string | null;
}

// Shape returned by GET /api/v2/role-permissions/{roleId}
export interface RolePermissionsResponse {
  succeeded: boolean;
  data: string[];
}

export function useRolePermissionService() {
  const { useQuery, post } = useApi();

  /**
   * Fetches the full permission catalog from the backend with the correct shape.
   * Uses scope=all so system-admin users see all permissions across all scopes.
   */
  const usePermissionCatalog = () => {
    return useQuery<PermissionDefinition[]>('/api/v2/permissions?scope=all');
  };

  /**
   * Fetches the list of permission keys currently assigned to a specific role.
   * Returns null-keyed SWR (no fetch) when roleId is null.
   */
  const useRolePermissions = (roleId: string | null) => {
    const key =
      roleId !== null && roleId.length > 0
        ? `/api/v2/role-permissions/${roleId}`
        : null;
    return useQuery<RolePermissionsResponse>(key);
  };

  /** Assigns a single permission key to a role. */
  const assignPermission = async (
    roleId: string,
    permissionKey: string
  ): Promise<void> => {
    await post<unknown, { roleId: string; permissionKey: string }>(
      '/api/v2/role-permissions/assign',
      { roleId, permissionKey }
    );
  };

  /** Revokes a single permission key from a role. */
  const revokePermission = async (
    roleId: string,
    permissionKey: string
  ): Promise<void> => {
    await post<unknown, { roleId: string; permissionKey: string }>(
      '/api/v2/role-permissions/revoke',
      { roleId, permissionKey }
    );
  };

  /**
   * Resets all seeded role permissions back to their default seed configuration.
   * Requires AssignRolePermissions permission.
   */
  const resetRolePermissions = async (): Promise<void> => {
    await post<unknown, Record<string, never>>('/api/v2/role-permissions/reset', {});
  };

  return {
    usePermissionCatalog,
    useRolePermissions,
    assignPermission,
    revokePermission,
    resetRolePermissions,
  };
}
