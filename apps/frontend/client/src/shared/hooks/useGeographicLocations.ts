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

  // 2. Fetch Provinces when Region changes
  useEffect(() => {
    let isMounted = true;
    async function fetchProvinces() {
      if (!selectedRegionId) {
        setProvinces([]);
        return;
      }
      setLoadingProvinces(true);
      try {
        const res = await api.get<ApiResponseWrapper<GeographicItem[]> | GeographicItem[]>(`/api/v2/provinces?regionId=${selectedRegionId}&activeOnly=true`).catch(() => null);
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

  // 3. Fetch Municipalities when Province changes
  useEffect(() => {
    let isMounted = true;
    async function fetchMunicipalities() {
      if (!selectedProvinceId) {
        setMunicipalities([]);
        return;
      }
      setLoadingMunicipalities(true);
      try {
        const res = await api.get<ApiResponseWrapper<GeographicItem[]> | GeographicItem[]>(`/api/v2/municipalities?provinceId=${selectedProvinceId}&activeOnly=true`).catch(() => null);
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

  // 4. Fetch Barangays when Municipality changes
  useEffect(() => {
    let isMounted = true;
    async function fetchBarangays() {
      if (!selectedMunicipalityId) {
        setBarangays([]);
        return;
      }
      setLoadingBarangays(true);
      try {
        const res = await api.get<ApiResponseWrapper<GeographicItem[]> | GeographicItem[]>(`/api/v2/barangays?municipalityId=${selectedMunicipalityId}&activeOnly=true`).catch(() => null);
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
