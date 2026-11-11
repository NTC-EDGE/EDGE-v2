import useSWR from 'swr';
import { apiClient } from '../apiClient';

export interface TenantMemberDto {
  id: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  userMiddleName?: string | null;
  userSuffix?: string | null;
  userContactNumber?: string | null;
  userESignature?: string | null;
  roleId: string;
  roleKey: string;
  roleName: string;
  fieldOfficeId?: string | null;
  fieldOfficeName?: string | null;
  jobTitle?: string | null;
  level?: string | null;
  division: string;
  position: string;
  designation?: string | null;
  permissions?: string[];
  isDeleted: boolean;
  createdAt: string;
}

export interface UseTenantMembersReturn {
  members: TenantMemberDto[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<TenantMemberDto[] | undefined>;
}

const fetcher = (url: string) => apiClient.get<TenantMemberDto[]>(url).then((res) => res.data);

import { resolveEffectiveTenantId } from '../utils/tenantUtils';

export function useTenantMembers(tenantId?: string): UseTenantMembersReturn {
  const effectiveTenantId = resolveEffectiveTenantId(tenantId);
  const endpoint = effectiveTenantId ? `/api/v2/tenants/${effectiveTenantId}/members` : null;

  const { data, error, isLoading, mutate } = useSWR<TenantMemberDto[]>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );

  return {
    members: Array.isArray(data) ? data : [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
