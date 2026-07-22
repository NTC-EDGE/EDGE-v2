import { useApi } from './api';
import { RegionSettings } from '@edge/api';

export function useRegionSettingsService() {
  const { useQuery, put } = useApi();

  const useRegionSettings = (regionId: string | null) => {
    return useQuery<RegionSettings>(
      regionId !== null && regionId.length > 0 ? `/api/v2/regions/${regionId}/settings` : null
    );
  };

  const updateRegionSettings = async (
    regionId: string,
    settings: Partial<RegionSettings>
  ): Promise<RegionSettings> => {
    return put<RegionSettings, Partial<RegionSettings>>(
      `/api/v2/regions/${regionId}/settings`,
      settings
    );
  };

  return {
    useRegionSettings,
    updateRegionSettings,
  };
}
