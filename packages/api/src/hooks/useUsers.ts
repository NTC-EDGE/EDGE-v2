import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { PaginatedApiResponse } from '../types';

export interface UserMemberRole {
  id: string;
  key: string;
  name: string;
}

export interface UserTenantMembership {
  id: string;
  tenantId: string;
  tenantName?: string;
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
  profilePicture?: string | null;
  eSignature?: string | null;
  isSuperAdmin: boolean;
  createdAt: string;
  tenantMemberships?: UserTenantMembership[];
}

export interface UseUsersOptions {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  tenantId?: string;
  regionId?: string;
}

export interface UseUsersReturn {
  users: ApiUser[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<PaginatedApiResponse<ApiUser> | undefined>;
}

const fetcher = (url: string): Promise<PaginatedApiResponse<ApiUser>> =>
  apiClient.get<PaginatedApiResponse<ApiUser>>(url).then((res) => res.data);

export function useUsers(options?: UseUsersOptions): UseUsersReturn {
  const pageNumber = options?.pageNumber ?? 1;
  const pageSize = options?.pageSize ?? 100;
  const search = options?.searchTerm?.trim();
  const tenantId = options?.tenantId;
  const regionId = options?.regionId;

  const params = new URLSearchParams();
  params.append('pageNumber', pageNumber.toString());
  params.append('pageSize', pageSize.toString());
  if (search && search.length > 0) params.append('searchTerm', search);
  if (tenantId && tenantId.length > 0) params.append('tenantId', tenantId);
  if (regionId && regionId.length > 0) params.append('regionId', regionId);

  const endpoint = `/api/v2/users?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedApiResponse<ApiUser>>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const users: ApiUser[] = Array.isArray(data?.data) ? data.data : [];
  const totalCount = data?.totalCount ?? users.length;
  const totalPages = data?.totalPages ?? 1;

  return {
    users,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
