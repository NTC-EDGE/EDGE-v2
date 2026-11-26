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

export interface CurrentUserDetailedProfileDto {
  id: string;
  authUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  sex?: string;
  nationality?: string;
  height?: number;
  weight?: number;
  schoolAttended?: string;
  courseTaken?: string;
  profilePicture?: string;
  eSignature?: string;
  isSuperAdmin: boolean;
  isInternalUser?: boolean;
  canSubmitApplication?: boolean;
  staffAssignment?: {
    tenantId?: string;
    roleName?: string;
    division?: string;
    position?: string;
    designation?: string;
    jobTitle?: string;
    level?: string;
  } | null;
  address?: {
    street?: string;
    unit?: string;
    zipCode?: string;
    barangayId?: string;
  };
  company?: {
    id?: string;
    name?: string;
    registrationNumber?: string;
    address?: string;
    contactNumber?: string;
    email?: string;
    entityType?: string;
  } | null;
}

export interface UpdateMyProfileApiRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  contactNumber?: string;
  dateOfBirth?: string | null;
  sex?: string;
  nationality?: string;
  height?: number | null;
  weight?: number | null;
  schoolAttended?: string;
  courseTaken?: string;
  street?: string;
  unit?: string;
  zipCode?: string;
  barangayId?: string | null;
  eSignature?: string;
  companyName?: string;
  companyRegistrationNumber?: string;
  companyAddress?: string;
  companyContactNumber?: string;
  companyEmail?: string;
}

function isCreateUserApiResponse(item: unknown): item is CreateUserApiResponse {
  return typeof item === 'object' && item !== null && 'id' in item;
}

export const userService = {
  /**
   * Fetch the currently authenticated user's own detailed profile
   */
  async getMyProfile() {
    return safeAsync(async () => {
      const response = await apiClient.get<CurrentUserDetailedProfileDto>('/api/v2/users/me/profile');
      return response.data;
    }, 'Failed to fetch current user profile');
  },

  /**
   * Update the currently authenticated user's own personal profile details
   */
  async updateMyProfile(data: UpdateMyProfileApiRequest) {
    return safeAsync(async () => {
      const response = await apiClient.patch<CreateUserApiResponse>('/api/v2/users/me/profile', data);
      return response.data;
    }, 'Failed to update profile details');
  },
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
