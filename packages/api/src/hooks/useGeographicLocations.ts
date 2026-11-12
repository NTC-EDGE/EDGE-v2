import { useMemo } from 'react';
import useSWR from 'swr';
import { apiClient } from '../apiClient';
import { FALLBACK_PHILIPPINE_REGIONS } from '../services/regionService';
import { RegionDto } from '../types/region';

export interface GeographicRegionDto {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
}

export interface GeographicProvinceDto {
  id: string;
  regionId: string;
  code: string;
  name: string;
  isActive?: boolean;
  region?: GeographicRegionDto | null;
}

export interface GeographicMunicipalityDto {
  id: string;
  provinceId: string;
  code: string;
  name: string;
  isActive?: boolean;
  province?: GeographicProvinceDto | null;
}

export interface GeographicBarangayDto {
  id: string;
  municipalityId: string;
  code: string;
  name: string;
  isActive?: boolean;
  municipality?: GeographicMunicipalityDto | null;
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

function extractArrayFromResponse<T>(
  raw: unknown,
  itemGuard: (item: unknown) => item is T
): T[] {
  if (Array.isArray(raw)) {
    return raw.filter(itemGuard);
  }
  if (isRecord(raw) && Array.isArray(raw.data)) {
    return raw.data.filter(itemGuard);
  }
  return [];
}

function isRegionDto(val: unknown): val is GeographicRegionDto {
  return (
    isRecord(val) &&
    typeof val.id === 'string' &&
    typeof val.name === 'string'
  );
}

function isProvinceDto(val: unknown): val is GeographicProvinceDto {
  return (
    isRecord(val) &&
    typeof val.id === 'string' &&
    typeof val.name === 'string'
  );
}

function isMunicipalityDto(val: unknown): val is GeographicMunicipalityDto {
  return (
    isRecord(val) &&
    typeof val.id === 'string' &&
    typeof val.name === 'string'
  );
}

function isBarangayDto(val: unknown): val is GeographicBarangayDto {
  return (
    isRecord(val) &&
    typeof val.id === 'string' &&
    typeof val.name === 'string'
  );
}

export function normalizeGeoName(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .toLowerCase()
    .trim()
    .replace(/^(city of|municipality of|province of|brgy\.?|barangay)\s+/i, '')
    .replace(/\s+(city|municipality|province)$/i, '')
    .replace(/[.,()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface UseGeographicLocationsParams {
  regionId?: string;
  regionName?: string;
  provinceId?: string;
  provinceName?: string;
  municipalityId?: string;
  municipalityName?: string;
}

export function useGeographicLocations(params?: UseGeographicLocationsParams) {
  const { data: regionsData, isLoading: loadingRegions } = useSWR<GeographicRegionDto[]>(
    '/api/v2/regions?activeOnly=true',
    async (url: string) => {
      const res = await apiClient.get<unknown>(url);
      const list = extractArrayFromResponse(res.data, isRegionDto);
      return list.length > 0 ? list : FALLBACK_PHILIPPINE_REGIONS;
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      fallbackData: FALLBACK_PHILIPPINE_REGIONS,
    }
  );

  const regions: GeographicRegionDto[] = regionsData ?? FALLBACK_PHILIPPINE_REGIONS;

  const { data: allProvincesData, isLoading: loadingProvinces } = useSWR<GeographicProvinceDto[]>(
    '/api/v2/provinces?activeOnly=true',
    async (url: string) => {
      const res = await apiClient.get<unknown>(url);
      return extractArrayFromResponse(res.data, isProvinceDto);
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  const allProvinces: GeographicProvinceDto[] = allProvincesData ?? [];

  const resolvedRegionId = useMemo(() => {
    if (params?.regionId && params.regionId.trim().length > 0) {
      return params.regionId.trim();
    }
    const rName = params?.regionName?.trim();
    if (!rName) return undefined;
    const lower = rName.toLowerCase();
    const norm = normalizeGeoName(rName);
    const matched = regions.find((r: RegionDto | GeographicRegionDto) => {
      const codeLower = (r.code || '').toLowerCase();
      const nameLower = r.name.toLowerCase();
      const combined = codeLower ? `${codeLower} - ${nameLower}` : nameLower;
      return (
        r.id === rName ||
        codeLower === lower ||
        nameLower === lower ||
        combined === lower ||
        normalizeGeoName(r.name) === norm ||
        (codeLower.length > 0 && lower.includes(codeLower))
      );
    });
    return matched?.id;
  }, [params?.regionId, params?.regionName, regions]);

  const resolvedProvince = useMemo(() => {
    if (params?.provinceId && params.provinceId.trim().length > 0) {
      return allProvinces.find((p) => p.id === params.provinceId?.trim());
    }
    const pName = params?.provinceName?.trim();
    if (!pName) return undefined;
    const lower = pName.toLowerCase();
    const norm = normalizeGeoName(pName);
    return (
      allProvinces.find(
        (p) =>
          p.id === pName ||
          p.name.toLowerCase() === lower ||
          normalizeGeoName(p.name) === norm
      ) ??
      allProvinces.find((p) => {
        const pNorm = normalizeGeoName(p.name);
        return pNorm.length > 2 && norm.length > 2 && (pNorm.includes(norm) || norm.includes(pNorm));
      })
    );
  }, [params?.provinceId, params?.provinceName, allProvinces]);

  const resolvedProvinceId = resolvedProvince?.id;

  const provinces = useMemo(() => {
    if (!resolvedRegionId) return allProvinces;
    const filtered = allProvinces.filter((p) => p.regionId === resolvedRegionId);
    return filtered.length > 0 ? filtered : allProvinces;
  }, [allProvinces, resolvedRegionId]);

  const municipalitiesKey = resolvedProvinceId
    ? `/api/v2/municipalities?provinceId=${resolvedProvinceId}&activeOnly=true`
    : '/api/v2/municipalities?activeOnly=true';

  const { data: municipalitiesData, isLoading: loadingMunicipalities } = useSWR<GeographicMunicipalityDto[]>(
    municipalitiesKey,
    async (url: string) => {
      const res = await apiClient.get<unknown>(url);
      return extractArrayFromResponse(res.data, isMunicipalityDto);
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  const municipalities: GeographicMunicipalityDto[] = municipalitiesData ?? [];

  const resolvedMunicipality = useMemo(() => {
    if (params?.municipalityId && params.municipalityId.trim().length > 0) {
      return municipalities.find((m) => m.id === params.municipalityId?.trim());
    }
    const mName = params?.municipalityName?.trim();
    if (!mName) return undefined;
    const lower = mName.toLowerCase();
    const norm = normalizeGeoName(mName);
    return (
      municipalities.find(
        (m) =>
          m.id === mName ||
          m.name.toLowerCase() === lower ||
          normalizeGeoName(m.name) === norm
      ) ??
      municipalities.find((m) => {
        const mNorm = normalizeGeoName(m.name);
        return mNorm.length > 2 && norm.length > 2 && (mNorm.includes(norm) || norm.includes(mNorm));
      })
    );
  }, [params?.municipalityId, params?.municipalityName, municipalities]);

  const resolvedMunicipalityId = resolvedMunicipality?.id;

  const barangaysKey = resolvedMunicipalityId
    ? `/api/v2/barangays?municipalityId=${resolvedMunicipalityId}&activeOnly=true`
    : null;

  const { data: barangaysData, isLoading: loadingBarangays } = useSWR<GeographicBarangayDto[]>(
    barangaysKey,
    async (url: string) => {
      const res = await apiClient.get<unknown>(url);
      return extractArrayFromResponse(res.data, isBarangayDto);
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  const barangays: GeographicBarangayDto[] = barangaysData ?? [];

  return {
    regions,
    allProvinces,
    provinces,
    municipalities,
    barangays,
    resolvedRegionId,
    resolvedProvince,
    resolvedProvinceId,
    resolvedMunicipality,
    resolvedMunicipalityId,
    loadingRegions,
    loadingProvinces,
    loadingMunicipalities,
    loadingBarangays,
  };
}
