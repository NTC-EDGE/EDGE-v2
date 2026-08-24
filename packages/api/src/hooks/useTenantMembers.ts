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

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export function useTenantMembers(tenantId?: string): UseTenantMembersReturn {
  const effectiveTenantId = (tenantId && tenantId.trim().length > 0) ? tenantId : DEFAULT_TENANT_ID;
  const endpoint = `/api/v2/tenants/${effectiveTenantId}/members`;

  const { data, error, isLoading, mutate } = useSWR<TenantMemberDto[]>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    members: Array.isArray(data) ? data : [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
