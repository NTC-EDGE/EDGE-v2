import { useApi } from './api';
import { ApiResponse, Province, CreateProvinceCommand, UpdateProvinceCommand } from '@edge/api';

export function useProvinceService() {
  const { useQuery, post, put, del } = useApi();

  const useProvinces = (regionId?: string | null, activeOnly?: boolean) => {
    const params = new URLSearchParams();
    if (regionId) params.append('regionId', regionId);
    if (activeOnly !== undefined) params.append('activeOnly', String(activeOnly));
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return useQuery<ApiResponse<Province[]>>(`/api/v2/provinces${queryStr}`);
  };

  const useProvince = (id: string | null) => {
    return useQuery<ApiResponse<Province>>(id ? `/api/v2/provinces/${id}` : null);
  };

  const createProvince = async (command: CreateProvinceCommand): Promise<ApiResponse<string>> => {
    return post<ApiResponse<string>, CreateProvinceCommand>('/api/v2/provinces', command);
  };

  const updateProvince = async (id: string, command: UpdateProvinceCommand): Promise<ApiResponse<string>> => {
    return put<ApiResponse<string>, UpdateProvinceCommand>(`/api/v2/provinces/${id}`, command);
  };

  const deleteProvince = async (id: string): Promise<ApiResponse<unknown>> => {
    return del<ApiResponse<unknown>>(`/api/v2/provinces/${id}`);
  };

  return {
    useProvinces,
    useProvince,
    createProvince,
    updateProvince,
    deleteProvince,
  };
}
