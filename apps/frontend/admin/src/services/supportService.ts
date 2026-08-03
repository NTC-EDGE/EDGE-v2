import { useApi } from './api';
import {
  GlobalSupportUser,
  UserDiagnosticDetails,
  UpdateUserStatusRequest,
  AddSupportNoteRequest
} from '@edge/api';

export function useSupportService() {
  const { useQuery, post, put, del } = useApi();

  const useGlobalUsers = (searchTerm?: string, regionFilter?: string, statusFilter?: string) => {
    const params = new URLSearchParams();
    if (searchTerm !== undefined && searchTerm !== null && searchTerm.trim().length > 0) {
      params.append('search', searchTerm.trim());
    }
    if (regionFilter !== undefined && regionFilter !== null && regionFilter !== 'ALL') {
      params.append('regionId', regionFilter);
    }
    if (statusFilter !== undefined && statusFilter !== null && statusFilter !== 'ALL') {
      params.append('status', statusFilter);
    }

    const queryString = params.toString();
    const endpoint = `/api/v2/support/users${queryString.length > 0 ? `?${queryString}` : ''}`;
    return useQuery<GlobalSupportUser[]>(endpoint);
  };

  const useUserDiagnostics = (userId: string | null) => {
    const isVal = userId !== null && userId !== undefined && userId.length > 0;
    return useQuery<UserDiagnosticDetails>(isVal ? `/api/v2/support/users/${userId}/diagnostics` : null);
  };

  const unlockAccount = async (userId: string): Promise<{ success: boolean; message: string }> => {
    return post<{ success: boolean; message: string }>(`/api/v2/support/users/${userId}/unlock`, {});
  };

  const resetPassword = async (userId: string): Promise<{ success: boolean; message: string }> => {
    return post<{ success: boolean; message: string }>(`/api/v2/support/users/${userId}/reset-password`, {});
  };

  const revokeAllSessions = async (userId: string): Promise<{ success: boolean; message: string }> => {
    return post<{ success: boolean; message: string }>(`/api/v2/support/users/${userId}/revoke-sessions`, {});
  };

  const toggleMfaRequirement = async (userId: string, enabled: boolean): Promise<{ success: boolean; message: string }> => {
    return put<{ success: boolean; message: string }>(`/api/v2/support/users/${userId}/mfa`, { enabled });
  };

  const updateUserStatus = async (request: UpdateUserStatusRequest): Promise<{ success: boolean; message: string }> => {
    return put<{ success: boolean; message: string }>(`/api/v2/support/users/${request.userId}/status`, request);
  };

  const addSupportNote = async (request: AddSupportNoteRequest): Promise<{ success: boolean; message: string }> => {
    return post<{ success: boolean; message: string }>(`/api/v2/support/users/${request.userId}/notes`, request);
  };

  const revokeSession = async (userId: string, sessionId: string): Promise<{ success: boolean; message: string }> => {
    return del<{ success: boolean; message: string }>(`/api/v2/support/users/${userId}/sessions/${sessionId}`);
  };

  return {
    useGlobalUsers,
    useUserDiagnostics,
    unlockAccount,
    resetPassword,
    revokeAllSessions,
    toggleMfaRequirement,
    updateUserStatus,
    addSupportNote,
    revokeSession,
  };
}
