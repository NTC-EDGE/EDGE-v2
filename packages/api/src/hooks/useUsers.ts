import useSWR from 'swr';
import { apiClient } from '../apiClient';

export interface UserMemberRole {
  id: string;
  key: string;
  name: string;
}

export interface UserTenantMembership {
  id: string;
  tenantId: string;
  roleId: string;
  role?: UserMemberRole;
  fieldOfficeId?: string;
  fieldOffice?: { id: string; name: string; code: string };
  jobTitle?: string;
  level?: string;
  division?: string;
  position?: string;
  designation?: string;
}

export interface ApiUser {
  id: string;
  authUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  suffix?: string | null;
  contactNumber?: string | null;
  eSignature?: string | null;
  isSuperAdmin: boolean;
  createdAt: string;
  tenantMemberships?: UserTenantMembership[];
}

export interface UseUsersReturn {
  users: ApiUser[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<ApiUser[] | undefined>;
}

const fetcher = (url: string) => apiClient.get<ApiUser[]>(url).then((res) => res.data);

export function useUsers(): UseUsersReturn {
  const { data, error, isLoading, mutate } = useSWR<ApiUser[]>('/api/v2/users', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  return {
    users: Array.isArray(data) ? data : [],
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
