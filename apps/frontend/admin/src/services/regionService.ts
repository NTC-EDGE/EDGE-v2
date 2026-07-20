import { useApi } from './api';
import { ApiResponse, Region, CreateRegionCommand, UpdateRegionCommand } from '@edge/api';

export function useRegionService() {
  const { useQuery, post, put, del } = useApi();

  const useRegions = (activeOnly?: boolean) => {
    const queryStr = activeOnly !== undefined ? `?activeOnly=${activeOnly}` : '';
    return useQuery<ApiResponse<Region[]>>(`/api/v2/regions${queryStr}`);
  };

  const useRegion = (id: string | null) => {
    return useQuery<ApiResponse<Region>>(id ? `/api/v2/regions/${id}` : null);
  };

  const createRegion = async (command: CreateRegionCommand): Promise<ApiResponse<string>> => {
    return post<ApiResponse<string>, CreateRegionCommand>('/api/v2/regions', command);
  };

  const updateRegion = async (id: string, command: UpdateRegionCommand): Promise<ApiResponse<string>> => {
    return put<ApiResponse<string>, UpdateRegionCommand>(`/api/v2/regions/${id}`, command);
  };

  const deleteRegion = async (id: string): Promise<ApiResponse<unknown>> => {
    return del<ApiResponse<unknown>>(`/api/v2/regions/${id}`);
  };

  return {
    useRegions,
    useRegion,
    createRegion,
    updateRegion,
    deleteRegion,
  };
}
