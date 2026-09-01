import { useRegions } from "@edge/api";

export function useLocationData(selectedRegionId?: string, selectedProvinceId?: string, selectedMunicipalityId?: string) {
  const { regions: rawRegions, isLoading: loadingRegions } = useRegions(true);

  const regions = (rawRegions || []).map((r) => ({ id: r.id, name: r.name }));
  const provinces: Array<{ id: string; name: string }> = [];
  const municipalities: Array<{ id: string; name: string }> = [];
  const barangays: Array<{ id: string; name: string }> = [];

  return {
    regions,
    provinces,
    municipalities,
    barangays,
    loadingRegions,
    loadingProvinces: false,
    loadingMunicipalities: false,
    loadingBarangays: false,
  };
}
