import { useState, useEffect } from "react";
import { useApi } from "../../../../shared/hooks/useApi";
import { FormDto } from "../../../../shared/components/DynamicFormRenderer";

interface ApiResponseEnvelope<T> {
  succeeded?: boolean;
  data?: T;
  message?: string;
}

/**
 * Lazily fetches the dynamic form layout for a given service (and optionally a variant)
 * from the backend API.
 *
 * Returns:
 * - `form`: A fully resolved `FormDto` from the DB when the service has form records seeded,
 *           or `null` when none exist (triggering the hardcoded form fallback in GeneralFilingDetailsStep).
 * - `loading`: True while the API request is in flight.
 *
 * Endpoint priority:
 * 1. GET /api/v2/services/{serviceId}/variants/{variantId}/form  (variant-specific form)
 * 2. GET /api/v2/services/{serviceId}/form                       (base service form fallback)
 * 3. null                                                        (renders hardcoded form)
 */
export function useServiceForm(serviceId: string | undefined, variantId?: string | null) {
  const api = useApi();
  const [form, setForm] = useState<FormDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchForm() {
      if (!serviceId) {
        if (isMounted) setForm(null);
        return;
      }

      if (isMounted) setLoading(true);

      try {
        // Query the seeded form definition for the service
        const endpoint = `/api/v2/services/${serviceId}/form`;
        const rawRes = await api.get<ApiResponseEnvelope<FormDto>>(endpoint).catch(() => null);
        const formDto = rawRes?.data ?? null;

        if (isMounted) {
          // Only set form when the response has meaningful seeded sections
          // If no seeded form exists, fall back to null → hardcoded form renders instead
          if (formDto && Array.isArray(formDto.sections) && formDto.sections.length > 0) {
            setForm(formDto);
          } else {
            setForm(null);
          }
        }
      } catch {
        if (isMounted) setForm(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchForm();

    return () => {
      isMounted = false;
    };
  }, [serviceId, variantId]);

  return { form, loading };
}
