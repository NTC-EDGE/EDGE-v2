import { apiClient } from '../apiClient';
import { safeAsync } from '../utils/safeAsync';
import { PaginatedApiResponse } from '../types';

export interface CreateUserApiRequest {
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

export interface CreateUserApiResponse {
  id: string;
  authUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  contactNumber?: string;
  roleKey: string;
  tenantId?: string;
  jobTitle?: string;
  level?: string;
  division?: string;
  position?: string;
  designation?: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

export interface UpdateUserApiRequest {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  middleName?: string;
  suffix?: string;
  contactNumber?: string;
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
}

function isCreateUserApiResponse(item: unknown): item is CreateUserApiResponse {
  return typeof item === 'object' && item !== null && 'id' in item;
}

export const userService = {
  /**
   * Create a new employee / staff user via Clerk and sync database records
   */
  async createUser(data: CreateUserApiRequest) {
    return safeAsync(async () => {
      const response = await apiClient.post<CreateUserApiResponse>('/api/v2/users', data);
      return response.data;
    }, 'Failed to create user account');
  },

  /**
   * Update an existing user / employee record and tenant membership
   */
  async updateUser(id: string, data: UpdateUserApiRequest) {
    return safeAsync(async () => {
      const response = await apiClient.put<CreateUserApiResponse>(`/api/v2/users/${id}`, data);
      return response.data;
    }, 'Failed to update user account');
  },

  /**
   * Change a user's primary login email in database and Clerk identity provider
   */
  async changeUserEmail(id: string, newEmail: string) {
    return safeAsync(async () => {
      const response = await apiClient.post<CreateUserApiResponse>(`/api/v2/users/${id}/change-email`, {
        newEmail,
      });
      return response.data;
    }, 'Failed to change login email');
  },

  /**
   * Fetch all users from database
   */
  async getUsers() {
    return safeAsync(async () => {
      const response = await apiClient.get<PaginatedApiResponse<CreateUserApiResponse> | CreateUserApiResponse[]>('/api/v2/users?pageSize=100');
      const data = response.data;
      if (Array.isArray(data)) {
        return data.filter(isCreateUserApiResponse);
      }
      if (typeof data === 'object' && data !== null) {
        if ('data' in data && Array.isArray(data.data)) {
          return data.data.filter(isCreateUserApiResponse);
        }
        if ('items' in data && Array.isArray(data.items)) {
          return data.items.filter(isCreateUserApiResponse);
        }
      }
      return [];
    }, 'Failed to fetch users');
  },

  /**
   * Delete a user by ID
   */
  async deleteUser(id: string) {
    return safeAsync(async () => {
      const response = await apiClient.delete(`/api/v2/users/${id}`);
      return response.data;
    }, 'Failed to delete user');
  },
};
