import { useApi } from './api';
import { TenantMember, AssignUserToTenantCommand, UpdateMemberDetailsCommand } from '@edge/api';

export function useTenantMemberService() {
  const { useQuery, post, put, del } = useApi();

  const useTenantMembers = (tenantId: string | null) => {
    return useQuery<TenantMember[]>(
      tenantId !== null && tenantId.length > 0 ? `/api/v2/tenants/${tenantId}/members` : null
    );
  };

  const useMemberDetails = (tenantId: string | null, memberId: string | null) => {
    const isValid = tenantId !== null && tenantId.length > 0 && memberId !== null && memberId.length > 0;
    return useQuery<TenantMember>(isValid ? `/api/v2/tenants/${tenantId}/members/${memberId}` : null);
  };

  const assignUserToTenant = async (
    tenantId: string,
    command: AssignUserToTenantCommand
  ): Promise<TenantMember> => {
    return post<TenantMember, AssignUserToTenantCommand>(
      `/api/v2/tenants/${tenantId}/members`,
      command
    );
  };

  const updateMemberDetails = async (
    tenantId: string,
    memberId: string,
    command: UpdateMemberDetailsCommand
  ): Promise<TenantMember> => {
    return put<TenantMember, UpdateMemberDetailsCommand>(
      `/api/v2/tenants/${tenantId}/members/${memberId}`,
      command
    );
  };

  const removeUserFromTenant = async (tenantId: string, memberId: string): Promise<void> => {
    return del<void>(`/api/v2/tenants/${tenantId}/members/${memberId}`);
  };

  return {
    useTenantMembers,
    useMemberDetails,
    assignUserToTenant,
    updateMemberDetails,
    removeUserFromTenant,
  };
}
