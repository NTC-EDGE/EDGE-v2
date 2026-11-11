import { useMemo } from "react";
import { useApi } from "../../../../shared/hooks/useApi";
import { FormDto } from "../../../../shared/components/DynamicFormRenderer";

interface ApiResponseEnvelope<T> {
  succeeded?: boolean;
  data?: T;
  message?: string;
}

/**
 * Dynamically fetches the form layout for a given service from the backend API.
 * Uses SWR with automatic revalidation on focus so that changes saved in the Admin
 * Form Builder immediately reflect in the Client without requiring a hard page refresh.
 *
 * When variantId is provided, the API looks up the dedicated variant form if configured,
 * or gracefully falls back to the master base form template.
 *
 * Returns:
 * - `form`: A fully resolved `FormDto` from the DB when the service has form records seeded,
 *           or `null` when none exist.
 * - `loading`: True while the API request is in flight.
 * - `refetch`: Function to explicitly re-fetch the latest template from the server.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useServiceForm(
  serviceId: string | undefined,
  variantId?: string | null,
  formKey?: string | null
) {
  const api = useApi();
  const endpoint = useMemo(() => {
    const trimmedVariantId = typeof variantId === "string" ? variantId.trim() : "";
    const trimmedFormKey = typeof formKey === "string" ? formKey.trim() : "";

    if (trimmedVariantId.length > 0 && UUID_REGEX.test(trimmedVariantId) && trimmedFormKey.length === 0) {
      return `/api/v2/service-variants/${trimmedVariantId}/form`;
    }

    if (!serviceId) return null;
    const params = new URLSearchParams();
    if (trimmedVariantId.length > 0) {
      params.append("variantId", trimmedVariantId);
    }
    if (trimmedFormKey.length > 0) {
      params.append("formKey", trimmedFormKey);
    }
    const qs = params.toString();
    return `/api/v2/services/${serviceId}/form${qs ? `?${qs}` : ""}`;
  }, [serviceId, variantId, formKey]);

  const { data: rawRes, isLoading, mutate } = api.useQuery<ApiResponseEnvelope<FormDto>>(endpoint, {
    revalidateOnFocus: true,
    revalidateIfStale: true,
    dedupingInterval: 2000,
  });

  const form = useMemo(() => {
    const formDto = rawRes?.data;
    if (formDto && Array.isArray(formDto.sections) && formDto.sections.length > 0) {
      return formDto;
    }
    return null;
  }, [rawRes]);

  return {
    form,
    loading: isLoading,
    refetch: mutate,
  };
}
