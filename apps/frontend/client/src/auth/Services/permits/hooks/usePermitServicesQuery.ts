import { useState, useEffect, useMemo, useCallback } from "react";
import { useApi } from "../../../../shared/hooks/useApi";
import {
  PERMIT_DETAILS_SERVICE_OPTIONS as FALLBACK_SERVICES,
  resolvePermitTypes as fallbackResolveTypes,
} from "../forms/CopyOfPermitForm";

export interface DynamicPermitServiceItem {
  id: string;
  code?: string;
  title: string;
  categoryCode?: string;
  serviceCategoryCode?: string;
  serviceCategory?: { name?: string; code?: string };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function usePermitServicesQuery(enabled: boolean = true) {
  const api = useApi();
  const [services, setServices] = useState<DynamicPermitServiceItem[]>([]);
  const [variantsByServiceId, setVariantsByServiceId] = useState<Record<string, Array<{ label: string; value: string }>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 1. Fetch all permit services dynamically from the backend
  useEffect(() => {
    if (!enabled) return;
    let active = true;

    async function fetchServices() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<unknown>("/api/v2/services?pageSize=9999").catch((fetchErr: unknown) => {
          const err = fetchErr instanceof Error ? fetchErr : new Error(String(fetchErr));
          console.warn("[usePermitServicesQuery] Failed to fetch /api/v2/services:", err);
          if (active) setError(err);
          return null;
        });

        if (!active || !isRecord(res)) return;

        const rawList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];

        const permitServices: DynamicPermitServiceItem[] = [];

        for (const item of rawList) {
          if (!isRecord(item)) continue;
          const title = typeof item.title === "string" ? item.title : typeof item.name === "string" ? item.name : "";
          const id = typeof item.id === "string" ? item.id : "";
          const code = typeof item.code === "string" ? item.code : "";
          const catCode = typeof item.categoryCode === "string" ? item.categoryCode : typeof item.serviceCategoryCode === "string" ? item.serviceCategoryCode : "";
          const catObj = isRecord(item.serviceCategory) ? item.serviceCategory : null;
          const catName = typeof catObj?.name === "string" ? catObj.name : "";

          // Filter services under "Permits" category (excluding Copy of Permits itself)
          const isPermitCategory =
            catCode.toLowerCase().includes("permit") ||
            catName.toLowerCase().includes("permit") ||
            code.toLowerCase().includes("1_09") ||
            code.toLowerCase().includes("aero") ||
            code.toLowerCase().includes("mar") ||
            code.toLowerCase().includes("flm");

          const isCopyService =
            code.toLowerCase().includes("copy") ||
            title.toLowerCase().includes("copy of permit");

          // Keep the 4 main application permit services (Amateur, Aero, Maritime, FLM) or any permit services
          if (isPermitCategory && !isCopyService && id && title) {
            permitServices.push({
              id,
              code,
              title,
              categoryCode: catCode,
              serviceCategoryCode: catCode,
            });
          }
        }

        if (active && permitServices.length > 0) {
          setServices(permitServices);

          // 2. Fetch live variants for each discovered permit service from backend
          for (const s of permitServices) {
            try {
              const varRes = await api.get<unknown>(`/api/v2/services/${s.id}/variants`).catch((varErr: unknown) => {
                console.warn(`[usePermitServicesQuery] Failed to fetch variants for "${s.title}" (${s.id}):`, varErr);
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
                const displayVal = vDesc || vCode || vType || "Variant";

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
              console.warn(`[usePermitServicesQuery] Exception while processing variants for "${s.title}" (${s.id}):`, vErr);
            }
          }
        }
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        console.warn("[usePermitServicesQuery] Dynamic query failed, falling back to schema defaults:", errorObj);
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

  // Format dropdown options for the DetailsService dropdown dynamically
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
          serviceIdentifier.toLowerCase().includes(s.title.toLowerCase()) ||
          s.title.toLowerCase().includes(serviceIdentifier.toLowerCase())
      );

      if (matchedService) {
        const byId = variantsByServiceId[matchedService.id];
        if (byId && byId.length > 0) return byId;
        const byTitle = variantsByServiceId[matchedService.title];
        if (byTitle && byTitle.length > 0) return byTitle;
      }

      // Fallback mapping if backend variants are not yet fetched or network is unavailable
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
