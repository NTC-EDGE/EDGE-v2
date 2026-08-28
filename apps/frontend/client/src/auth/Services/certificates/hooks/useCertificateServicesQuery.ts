import { useState, useEffect, useMemo, useCallback } from "react";
import { useApi } from "../../../../shared/hooks/useApi";
import {
  CERTIFICATE_SERVICES_OPTIONS as FALLBACK_SERVICES,
  resolveCertificateTypes as fallbackResolveTypes,
} from "../forms/CopyOfCertificateForm";

export interface DynamicCertificateServiceItem {
  id: string;
  code?: string;
  title: string;
  categoryCode?: string;
  serviceCategoryCode?: string;
  serviceCategory?: { name?: string; code?: string };
}

export interface DynamicVariantItem {
  id: string;
  name?: string;
  description?: string;
  type?: string;
  code?: string;
  serviceId?: string;
}

export interface DynamicElementItem {
  id: string;
  code?: string;
  description?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function useCertificateServicesQuery() {
  const api = useApi();
  const [services, setServices] = useState<DynamicCertificateServiceItem[]>([]);
  const [variantsByServiceId, setVariantsByServiceId] = useState<Record<string, Array<{ label: string; value: string }>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 1. Fetch all services under Certificates category
  useEffect(() => {
    let active = true;

    async function fetchServices() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<unknown>("/api/v2/services?pageSize=9999").catch((fetchErr: unknown) => {
          const err = fetchErr instanceof Error ? fetchErr : new Error(String(fetchErr));
          console.warn("[useCertificateServicesQuery] Failed to fetch /api/v2/services:", err);
          if (active) setError(err);
          return null;
        });

        if (!active || !isRecord(res)) return;

        const rawList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];

        const certServices: DynamicCertificateServiceItem[] = [];

        for (const item of rawList) {
          if (!isRecord(item)) continue;
          const title = typeof item.title === "string" ? item.title : typeof item.name === "string" ? item.name : "";
          const id = typeof item.id === "string" ? item.id : "";
          const code = typeof item.code === "string" ? item.code : "";
          const catCode = typeof item.categoryCode === "string" ? item.categoryCode : typeof item.serviceCategoryCode === "string" ? item.serviceCategoryCode : "";
          const catObj = isRecord(item.serviceCategory) ? item.serviceCategory : null;
          const catName = typeof catObj?.name === "string" ? catObj.name : "";

          // Filter services under "Certificates" category (excluding Copy of Certificates itself)
          const isCertCategory =
            catCode.toLowerCase().includes("cert") ||
            catName.toLowerCase().includes("cert") ||
            code.toLowerCase().includes("1_02") ||
            code.toLowerCase().includes("1_03") ||
            code.toLowerCase().includes("1_19") ||
            code.toLowerCase().includes("1_20") ||
            code.toLowerCase().includes("1_22");

          const isCopyService =
            code.toLowerCase().includes("1_21") ||
            title.toLowerCase().includes("copy of certificate");

          if (isCertCategory && !isCopyService && id && title) {
            certServices.push({
              id,
              code,
              title,
              categoryCode: catCode,
              serviceCategoryCode: catCode,
            });
          }
        }

        if (active && certServices.length > 0) {
          setServices(certServices);

          // 2. Pre-fetch variants for each discovered certificate service
          for (const s of certServices) {
            try {
              const varRes = await api.get<unknown>(`/api/v2/services/${s.id}/variants`).catch((varErr: unknown) => {
                console.warn(`[useCertificateServicesQuery] Failed to fetch variants for "${s.title}" (${s.id}):`, varErr);
                return null;
              });

              if (!active || !isRecord(varRes)) continue;

              const rawVars = Array.isArray(varRes.data)
                ? varRes.data
                : Array.isArray(varRes)
                ? varRes
                : [];

              const mappedOptions: Array<{ label: string; value: string }> = [];

              for (const vItem of rawVars) {
                if (!isRecord(vItem)) continue;
                const vDesc = typeof vItem.description === "string" ? vItem.description : typeof vItem.name === "string" ? vItem.name : "";
                const vCode = typeof vItem.code === "string" ? vItem.code : "";
                const vType = typeof vItem.type === "string" ? vItem.type : "";

                const displayLabel = vDesc || vCode || vType || "Variant";
                const displayVal = vCode || vDesc || vType || "Variant";

                if (displayLabel && !mappedOptions.some((o) => o.value === displayVal)) {
                  mappedOptions.push({ label: displayLabel, value: displayVal });
                }
              }

              if (mappedOptions.length > 0) {
                setVariantsByServiceId((prev) => ({
                  ...prev,
                  [s.id]: mappedOptions,
                  [s.title]: mappedOptions,
                }));
              }
            } catch (vErr) {
              console.warn(`[useCertificateServicesQuery] Exception while processing variants for "${s.title}" (${s.id}):`, vErr);
            }
          }
        }
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        console.warn("[useCertificateServicesQuery] Dynamic certificate services query failed, falling back to static schema:", errorObj);
        if (active) setError(errorObj);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchServices();
    return () => {
      active = false;
    };
  }, []);

  // Format dropdown options for the Service dropdown
  const serviceOptions = useMemo<Array<{ label: string; value: string }>>(() => {
    if (services.length > 0) {
      return services.map((s) => ({
        label: s.title,
        value: s.title,
      }));
    }
    return FALLBACK_SERVICES;
  }, [services]);

  // Resolve dynamic Type dropdown options for any selected service
  const getTypesForService = useCallback(
    (serviceIdentifier?: string): Array<{ label: string; value: string }> => {
      if (!serviceIdentifier) {
        const firstServiceTitle = serviceOptions[0]?.value || "";
        return getTypesForService(firstServiceTitle);
      }

      // Check direct lookup by service title or ID in fetched variants
      const liveVariants = variantsByServiceId[serviceIdentifier];
      if (liveVariants && liveVariants.length > 0) {
        return liveVariants;
      }

      // Check matched service by title or ID
      const matchedService = services.find(
        (s) =>
          s.id === serviceIdentifier ||
          s.title.toLowerCase() === serviceIdentifier.toLowerCase() ||
          serviceIdentifier.toLowerCase().includes(s.title.toLowerCase())
      );

      if (matchedService) {
        const byId = variantsByServiceId[matchedService.id];
        if (byId && byId.length > 0) return byId;
        const byTitle = variantsByServiceId[matchedService.title];
        if (byTitle && byTitle.length > 0) return byTitle;
      }

      // Dynamic fallback mapping
      return fallbackResolveTypes(serviceIdentifier);
    },
    [variantsByServiceId, services, serviceOptions]
  );

  return {
    loading,
    error,
    serviceOptions,
    services,
    getTypesForService,
  };
}
