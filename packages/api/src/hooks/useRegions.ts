import useSWR from "swr";
import { fetchRegions, FALLBACK_PHILIPPINE_REGIONS } from "../services/regionService";
import { RegionDto, RegionOption } from "../types/region";

export interface UseRegionsReturn {
  regions: RegionDto[];
  options: RegionOption[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<RegionDto[] | undefined>;
}

/**
 * Service Layer Hook for consuming regions from the backend API with SWR caching,
 * loading states, error handling, and pre-formatted dropdown options.
 */
export function useRegions(activeOnly = true): UseRegionsReturn {
  const { data, error, isLoading, mutate } = useSWR<RegionDto[]>(
    `/api/v2/regions?activeOnly=${activeOnly}`,
    () => fetchRegions(activeOnly),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      fallbackData: FALLBACK_PHILIPPINE_REGIONS,
    }
  );

  const rawRegions = data ?? FALLBACK_PHILIPPINE_REGIONS;

  const options: RegionOption[] = rawRegions.map((reg) => {
    const formattedLabel = reg.name.startsWith(reg.code)
      ? reg.name
      : `${reg.code} - ${reg.name}`;

    return {
      label: formattedLabel,
      value: formattedLabel,
      code: reg.code,
      id: reg.id,
    };
  });

  return {
    regions: rawRegions,
    options,
    isLoading,
    isError: Boolean(error),
    refetch: mutate,
  };
}
