import { useApi } from './api';
import { ApiResponse, Municipality, CreateMunicipalityCommand, UpdateMunicipalityCommand } from '@edge/api';

export function useMunicipalityService() {
  const { useQuery, post, put, del } = useApi();

  const useMunicipalities = (provinceId?: string | null, activeOnly?: boolean) => {
    const params = new URLSearchParams();
    if (provinceId) params.append('provinceId', provinceId);
    if (activeOnly !== undefined) params.append('activeOnly', String(activeOnly));
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return useQuery<ApiResponse<Municipality[]>>(`/api/v2/municipalities${queryStr}`);
  };

  const useMunicipality = (id: string | null) => {
    return useQuery<ApiResponse<Municipality>>(id ? `/api/v2/municipalities/${id}` : null);
  };

  const createMunicipality = async (command: CreateMunicipalityCommand): Promise<ApiResponse<string>> => {
    return post<ApiResponse<string>, CreateMunicipalityCommand>('/api/v2/municipalities', command);
  };

  const updateMunicipality = async (id: string, command: UpdateMunicipalityCommand): Promise<ApiResponse<string>> => {
    return put<ApiResponse<string>, UpdateMunicipalityCommand>(`/api/v2/municipalities/${id}`, command);
  };

  const deleteMunicipality = async (id: string): Promise<ApiResponse<unknown>> => {
    return del<ApiResponse<unknown>>(`/api/v2/municipalities/${id}`);
  };

  return {
    useMunicipalities,
    useMunicipality,
    createMunicipality,
    updateMunicipality,
    deleteMunicipality,
  };
}
