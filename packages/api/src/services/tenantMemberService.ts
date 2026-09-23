import { apiClient } from '../apiClient';
import { TenantMember, AssignUserToTenantCommand, UpdateMemberDetailsCommand } from '../types';
import { safeAsync } from '../utils/safeAsync';

export const tenantMemberService = {
  /**
   * Assign an existing platform user to a tenant
   */
  async assignUserToTenant(tenantId: string, data: AssignUserToTenantCommand) {
    return safeAsync(async () => {
      const response = await apiClient.post<TenantMember>(`/api/v2/tenants/${tenantId}/members`, data);
      return response.data;
    }, 'Failed to assign user to tenant');
  },

  /**
   * Update details of an existing tenant member
   */
  async updateMemberDetails(tenantId: string, memberId: string, data: UpdateMemberDetailsCommand) {
    return safeAsync(async () => {
      const response = await apiClient.put<TenantMember>(`/api/v2/tenants/${tenantId}/members/${memberId}`, data);
      return response.data;
    }, 'Failed to update tenant member details');
  },

  /**
   * Remove a member from a tenant
   */
  async removeUserFromTenant(tenantId: string, memberId: string) {
    return safeAsync(async () => {
      await apiClient.delete(`/api/v2/tenants/${tenantId}/members/${memberId}`);
      return true;
    }, 'Failed to remove user from tenant');
  },

  /**
   * Fetch all members of a tenant
   */
  async getTenantMembers(tenantId: string) {
    return safeAsync(async () => {
      const response = await apiClient.get<TenantMember[]>(`/api/v2/tenants/${tenantId}/members`);
      return response.data;
    }, 'Failed to fetch tenant members');
  },
};
