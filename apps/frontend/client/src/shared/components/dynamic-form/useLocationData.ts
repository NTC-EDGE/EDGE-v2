import { useGeographicLocations } from "../../hooks/useGeographicLocations";

export function useLocationData(
  selectedRegionId?: string,
  selectedProvinceId?: string,
  selectedMunicipalityId?: string
) {
  return useGeographicLocations(
    selectedRegionId,
    selectedProvinceId,
    selectedMunicipalityId
  );
}
