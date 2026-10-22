import { useState, useEffect } from "react";
import { useApi } from "./useApi";

export interface GeographicItem {
  id: string;
  name: string;
  code?: string;
}

export interface ApiResponseWrapper<T> {
  data: T;
  succeeded: boolean;
  message?: string;
}

export function useGeographicLocations(selectedRegionId?: string, selectedProvinceId?: string, selectedMunicipalityId?: string) {
  const api = useApi();

  const [regions, setRegions] = useState<GeographicItem[]>([]);
  const [provinces, setProvinces] = useState<GeographicItem[]>([]);
  const [municipalities, setMunicipalities] = useState<GeographicItem[]>([]);
  const [barangays, setBarangays] = useState<GeographicItem[]>([]);

  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // 1. Fetch Regions on Mount
  useEffect(() => {
    let isMounted = true;
    async function fetchRegions() {
      setLoadingRegions(true);
      try {
        const res = await api.get<ApiResponseWrapper<GeographicItem[]> | GeographicItem[]>("/api/v2/regions?activeOnly=true").catch(() => null);
        if (!isMounted) return;

        let list: GeographicItem[] = [];
        if (res && "data" in res && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        }
        setRegions(list);
      } catch (err) {
        console.warn("Failed to fetch regions:", err);
      } finally {
        if (isMounted) setLoadingRegions(false);
      }
    }
    fetchRegions();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Provinces (filtered by region if provided, or all)
  useEffect(() => {
    let isMounted = true;
    async function fetchProvinces() {
      setLoadingProvinces(true);
      try {
        const url = selectedRegionId
          ? `/api/v2/provinces?regionId=${selectedRegionId}&activeOnly=true`
          : `/api/v2/provinces?activeOnly=true`;
        const res = await api.get<ApiResponseWrapper<GeographicItem[]> | GeographicItem[]>(url).catch(() => null);
        if (!isMounted) return;

        let list: GeographicItem[] = [];
        if (res && "data" in res && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        }
        setProvinces(list);
      } catch (err) {
        console.warn("Failed to fetch provinces:", err);
      } finally {
        if (isMounted) setLoadingProvinces(false);
      }
    }
    fetchProvinces();
    return () => {
      isMounted = false;
    };
  }, [selectedRegionId]);

  // 3. Fetch Municipalities (filtered by province if provided, or all)
  useEffect(() => {
    let isMounted = true;
    async function fetchMunicipalities() {
      setLoadingMunicipalities(true);
      try {
        const url = selectedProvinceId
          ? `/api/v2/municipalities?provinceId=${selectedProvinceId}&activeOnly=true`
          : `/api/v2/municipalities?activeOnly=true`;
        const res = await api.get<ApiResponseWrapper<GeographicItem[]> | GeographicItem[]>(url).catch(() => null);
        if (!isMounted) return;

        let list: GeographicItem[] = [];
        if (res && "data" in res && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        }
        setMunicipalities(list);
      } catch (err) {
        console.warn("Failed to fetch municipalities:", err);
      } finally {
        if (isMounted) setLoadingMunicipalities(false);
      }
    }
    fetchMunicipalities();
    return () => {
      isMounted = false;
    };
  }, [selectedProvinceId]);

  // 4. Fetch Barangays (filtered by municipality if provided)
  useEffect(() => {
    let isMounted = true;
    async function fetchBarangays() {
      if (!selectedMunicipalityId) {
        setBarangays([]);
        setLoadingBarangays(false);
        return;
      }
      setLoadingBarangays(true);
      try {
        const url = `/api/v2/barangays?municipalityId=${selectedMunicipalityId}&activeOnly=true`;
        const res = await api.get<ApiResponseWrapper<GeographicItem[]> | GeographicItem[]>(url).catch(() => null);
        if (!isMounted) return;

        let list: GeographicItem[] = [];
        if (res && "data" in res && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        }
        setBarangays(list);
      } catch (err) {
        console.warn("Failed to fetch barangays:", err);
      } finally {
        if (isMounted) setLoadingBarangays(false);
      }
    }
    fetchBarangays();
    return () => {
      isMounted = false;
    };
  }, [selectedMunicipalityId]);

  return {
    regions,
    provinces,
    municipalities,
    barangays,
    loadingRegions,
    loadingProvinces,
    loadingMunicipalities,
    loadingBarangays,
  };
}
