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

export function useUserService() {
  const { useQuery, put, patch, del } = useApi();

  const useUsers = () => {
    return useQuery<User[]>('/api/v2/users');
  };

  const useUser = (id: string | null) => {
    return useQuery<User>(id !== null && id.length > 0 ? `/api/v2/users/${id}` : null);
  };

  const useCurrentUserProfile = () => {
    return useQuery<CurrentUserProfile>('/api/v2/users/me');
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
    updateUser,
    updateUserSuperAdmin,
    deleteUser,
  };
}
