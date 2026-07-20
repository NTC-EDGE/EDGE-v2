import { useApi } from './api';
import { ApiResponse, Barangay, CreateBarangayCommand, UpdateBarangayCommand } from '@edge/api';

export function useBarangayService() {
  const { useQuery, post, put, del } = useApi();

  const useBarangays = (municipalityId?: string | null, activeOnly?: boolean) => {
    const params = new URLSearchParams();
    if (municipalityId) params.append('municipalityId', municipalityId);
    if (activeOnly !== undefined) params.append('activeOnly', String(activeOnly));
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return useQuery<ApiResponse<Barangay[]>>(`/api/v2/barangays${queryStr}`);
  };

  const useBarangay = (id: string | null) => {
    return useQuery<ApiResponse<Barangay>>(id ? `/api/v2/barangays/${id}` : null);
  };

  const createBarangay = async (command: CreateBarangayCommand): Promise<ApiResponse<string>> => {
    return post<ApiResponse<string>, CreateBarangayCommand>('/api/v2/barangays', command);
  };

  const updateBarangay = async (id: string, command: UpdateBarangayCommand): Promise<ApiResponse<string>> => {
    return put<ApiResponse<string>, UpdateBarangayCommand>(`/api/v2/barangays/${id}`, command);
  };

  const deleteBarangay = async (id: string): Promise<ApiResponse<unknown>> => {
    return del<ApiResponse<unknown>>(`/api/v2/barangays/${id}`);
  };

  return {
    useBarangays,
    useBarangay,
    createBarangay,
    updateBarangay,
    deleteBarangay,
  };
}
