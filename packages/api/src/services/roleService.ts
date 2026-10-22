import { apiClient } from '../apiClient';
import { ApiResponse, Role } from '../types';
import { safeAsync } from '../utils/safeAsync';

export interface CreateRoleRequest {
  name: string;
  key: string;
  description?: string;
  tenantId?: string | null;
  isSystemRole?: boolean;
}

export interface UpdateRoleRequest {
  id: string;
  name: string;
  key: string;
  description?: string;
  tenantId?: string | null;
}

export const roleService = {
  /**
   * Create a new custom role
   */
  async createRole(data: CreateRoleRequest) {
    return safeAsync(async () => {
      const response = await apiClient.post<Role>('/api/v2/roles', data);
      return response.data;
    }, 'Failed to create new role');
  },

  /**
   * Update an existing role definition
   */
  async updateRole(id: string, data: UpdateRoleRequest) {
    return safeAsync(async () => {
      const response = await apiClient.put<Role>(`/api/v2/roles/${id}`, data);
      return response.data;
    }, 'Failed to update role');
  },

  /**
   * Delete a custom role
   */
  async deleteRole(id: string) {
    return safeAsync(async () => {
      await apiClient.delete(`/api/v2/roles/${id}`);
      return true;
    }, 'Failed to delete role');
  },

  /**
   * Assign a single permission key to a role
   */
  async assignPermission(roleId: string, permissionKey: string) {
    return safeAsync(async () => {
      const response = await apiClient.post<ApiResponse<boolean>>('/api/v2/role-permissions/assign', {
        roleId,
        permissionKey,
      });
      return response.data;
    }, `Failed to assign permission ${permissionKey}`);
  },

  /**
   * Revoke a single permission key from a role
   */
  async revokePermission(roleId: string, permissionKey: string) {
    return safeAsync(async () => {
      const response = await apiClient.post<ApiResponse<boolean>>('/api/v2/role-permissions/revoke', {
        roleId,
        permissionKey,
      });
      return response.data;
    }, `Failed to revoke permission ${permissionKey}`);
  },

  /**
   * Batch update permission assignments for a role
   */
  async batchUpdatePermissions(roleId: string, addedKeys: string[], removedKeys: string[]) {
    return safeAsync(async () => {
      const assignPromises = addedKeys.map((key) =>
        apiClient.post('/api/v2/role-permissions/assign', { roleId, permissionKey: key }).catch(() => null)
      );
      const revokePromises = removedKeys.map((key) =>
        apiClient.post('/api/v2/role-permissions/revoke', { roleId, permissionKey: key }).catch(() => null)
      );

      await Promise.all([...assignPromises, ...revokePromises]);
      return true;
    }, 'Failed to update role permissions');
  },

  /**
   * Fetch all permission keys assigned to a role
   */
  async getRolePermissions(roleId: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<ApiResponse<string[]>>(`/api/v2/role-permissions/${roleId}`);
      return response.data.data ?? [];
    }, `Failed to fetch permissions for role ${roleId}`);
  },
};

