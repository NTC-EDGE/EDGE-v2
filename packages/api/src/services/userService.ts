import { apiClient } from '../apiClient';
import { safeAsync } from '../utils/safeAsync';

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
   * Fetch all users from database
   */
  async getUsers() {
    return safeAsync(async () => {
      const response = await apiClient.get<CreateUserApiResponse[]>('/api/v2/users');
      return response.data;
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
