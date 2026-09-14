import { useApi } from './api';
import { User } from '@edge/api';

export interface AdminUpdateUserRequest {
  id: string;
  firstName: string;
  lastName: string;
  isSuperAdmin?: boolean;
}

export interface CurrentUserProfile {
  id: string;
  authUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  contactNumber?: string;
  password?: string;
  roleKey?: string;
  tenantId?: string;
  fieldOfficeId?: string;
  jobTitle?: string;
  level?: string;
  division?: string;
  position?: string;
  designation?: string;
  eSignature?: string;
  isSuperAdmin?: boolean;
  sendInvitation?: boolean;
  redirectUrl?: string;
}

export interface SyncedUserSummary {
  id: string;
  authUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
  tenantId?: string | null;
  tenantName?: string | null;
  roleKey?: string | null;
  action: string;
}

export interface SyncClerkUsersResultDto {
  totalClerkUsers: number;
  createdUsers: number;
  updatedUsers: number;
  tenantMembershipsCreated: number;
  message: string;
  syncedUsers: SyncedUserSummary[];
}

export function useUserService() {
  const { useQuery, post, put, patch, del } = useApi();

  const useUsers = (enabled: boolean = true) => {
    return useQuery<User[]>(enabled ? '/api/v2/users' : null);
  };

  const useUser = (id: string | null) => {
    return useQuery<User>(id !== null && id.length > 0 ? `/api/v2/users/${id}` : null);
  };

  const useCurrentUserProfile = () => {
    return useQuery<CurrentUserProfile>('/api/v2/users/me');
  };

  /**
   * Creates a new user account via Clerk and syncs database & tenant membership.
   */
  const createUser = async (data: CreateUserRequest): Promise<User> => {
    return post<User, CreateUserRequest>('/api/v2/users', data);
  };

  /**
   * Synchronizes all registered users from Clerk into the database.
   */
  const syncClerkUsers = async (assignDefaultTenant: boolean = true): Promise<SyncClerkUsersResultDto> => {
    return post<SyncClerkUsersResultDto, { assignDefaultTenantIfMissing: boolean }>(
      '/api/v2/users/sync-clerk',
      { assignDefaultTenantIfMissing: assignDefaultTenant }
    );
  };

  /**
   * Updates user profile via PUT /api/v2/users/{id}
   * Accepts: firstName, lastName, and optionally isSuperAdmin.
   */
  const updateUser = async (id: string, data: Omit<AdminUpdateUserRequest, 'id'>): Promise<User> => {
    return put<User, AdminUpdateUserRequest>(`/api/v2/users/${id}`, { id, ...data });
  };

  /**
   * Updates SuperAdmin status via PATCH /api/v2/users/{id}/super-admin
   */
  const updateUserSuperAdmin = async (id: string, isSuperAdmin: boolean): Promise<User> => {
    return patch<User, { isSuperAdmin: boolean }>(`/api/v2/users/${id}/super-admin`, { isSuperAdmin });
  };

  const deleteUser = async (id: string): Promise<void> => {
    return del<void>(`/api/v2/users/${id}`);
  };

  return {
    useUsers,
    useUser,
    useCurrentUserProfile,
    createUser,
    syncClerkUsers,
    updateUser,
    updateUserSuperAdmin,
    deleteUser,
  };
}
