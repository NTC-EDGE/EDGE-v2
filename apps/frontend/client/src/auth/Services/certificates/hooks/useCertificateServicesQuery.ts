import { useState, useEffect, useMemo, useCallback } from "react";
import { useApi } from "../../../../shared/hooks/useApi";
import {
  CERTIFICATE_SERVICES_OPTIONS as FALLBACK_SERVICES,
  CERTIFICATE_TYPES_BY_SERVICE as FALLBACK_TYPES_BY_SERVICE,
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

export function useCertificateServicesQuery() {
  const api = useApi();
  const [services, setServices] = useState<DynamicCertificateServiceItem[]>([]);
  const [variantsByServiceId, setVariantsByServiceId] = useState<Record<string, Array<{ label: string; value: string }>>>({});
  const [loading, setLoading] = useState(false);

  // 1. Fetch all services under Certificates category
  useEffect(() => {
    let active = true;

    async function fetchServices() {
      try {
        setLoading(true);
        const res = await api.get<unknown>("/api/v2/services?pageSize=9999").catch(() => null);
        if (!active || typeof res !== "object" || res === null) return;

        const resObj = res as Record<string, unknown>;
        const rawList = Array.isArray(resObj.data)
          ? (resObj.data as unknown[])
          : Array.isArray(res)
          ? (res as unknown[])
          : [];

        const certServices: DynamicCertificateServiceItem[] = [];

        for (const item of rawList) {
          if (typeof item !== "object" || item === null) continue;
          const sObj = item as Record<string, unknown>;
          const title = typeof sObj.title === "string" ? sObj.title : typeof sObj.name === "string" ? sObj.name : "";
          const id = typeof sObj.id === "string" ? sObj.id : "";
          const code = typeof sObj.code === "string" ? sObj.code : "";
          const catCode = typeof sObj.categoryCode === "string" ? sObj.categoryCode : typeof sObj.serviceCategoryCode === "string" ? sObj.serviceCategoryCode : "";
          const catObj = typeof sObj.serviceCategory === "object" && sObj.serviceCategory !== null ? (sObj.serviceCategory as Record<string, unknown>) : null;
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
              const varRes = await api.get<unknown>(`/api/v2/services/${s.id}/variants`).catch(() => null);
              if (!active || typeof varRes !== "object" || varRes === null) continue;

              const vObj = varRes as Record<string, unknown>;
              const rawVars = Array.isArray(vObj.data)
                ? (vObj.data as unknown[])
                : Array.isArray(varRes)
                ? (varRes as unknown[])
                : [];

              const mappedOptions: Array<{ label: string; value: string }> = [];

              for (const vItem of rawVars) {
                if (typeof vItem !== "object" || vItem === null) continue;
                const v = vItem as Record<string, unknown>;
                const vDesc = typeof v.description === "string" ? v.description : typeof v.name === "string" ? v.name : "";
                const vCode = typeof v.code === "string" ? v.code : "";
                const vType = typeof v.type === "string" ? v.type : "";

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
            } catch {
              // Gracefully continue to next service if variant fetch fails
            }
          }
        }
      } catch (err) {
        console.warn("Dynamic certificate services query failed, falling back to static schema:", err);
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
    serviceOptions,
    services,
    getTypesForService,
  };
}
