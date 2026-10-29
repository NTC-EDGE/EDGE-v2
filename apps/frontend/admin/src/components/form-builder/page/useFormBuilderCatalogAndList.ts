import { useState, useMemo, useEffect } from "react";
import { FormSchema, ServiceVariantToolbarItem } from "../types";
import {
  convertBackendFormToSchema,
  isFieldApplicableForVariant,
  isExclusiveToVariant,
  BackendFormDtoLike,
  isRecord,
} from "../utils";
import {
  collectAllFormVariants,
  getEffectiveLinkedServices,
} from "../canonicalFormServices";
import { useFormBuilderService } from "@/services/formBuilderService";
import { useCatalogService, ServiceCategory, ServiceItem } from "@/services/catalogService";

function isBackendFormDtoLike(val: unknown): val is BackendFormDtoLike {
  return isRecord(val);
}

export function useFormBuilderCatalogAndList(activeForm: FormSchema | null) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");

  const formService = useFormBuilderService();
  const {
    data: apiResponse,
    error: formsError,
    isLoading: loadingForms,
    mutate,
  } = formService.useForms(
    currentPage,
    pageSize,
    searchTerm,
    selectedServiceId || undefined,
    undefined,
    undefined,
    selectedCategoryId || undefined,
    statusFilter === "all" ? undefined : statusFilter === "active"
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("edge_form_builder_forms");
      } catch {
        // ignore
      }
    }
  }, []);

  const { useServiceCategories, useServices, useServiceVariants } = useCatalogService();
  const { data: categoriesResponse } = useServiceCategories();
  const { data: servicesResponse } = useServices(undefined, 1, 200);
  const { data: serviceVariantsResponse } = useServiceVariants(activeForm?.serviceId);

  const categories: ServiceCategory[] = useMemo(() => {
    if (!categoriesResponse) return [];
    return Array.isArray(categoriesResponse)
      ? categoriesResponse
      : Array.isArray(categoriesResponse.data)
      ? categoriesResponse.data
      : [];
  }, [categoriesResponse]);

  const services: ServiceItem[] = useMemo(() => {
    if (!servicesResponse) return [];
    return Array.isArray(servicesResponse)
      ? servicesResponse
      : Array.isArray(servicesResponse.data)
      ? servicesResponse.data
      : [];
  }, [servicesResponse]);

  const backendForms: FormSchema[] = useMemo(() => {
    if (!apiResponse || formsError) return [];
    const rawList = Array.isArray(apiResponse)
      ? apiResponse
      : Array.isArray(apiResponse.data)
      ? apiResponse.data
      : [];
    return rawList.filter(isBackendFormDtoLike).map((f) => convertBackendFormToSchema(f));
  }, [apiResponse, formsError]);

  const forms = useMemo(() => {
    if (apiResponse && apiResponse.succeeded !== false && !formsError) {
      return backendForms;
    }
    return [];
  }, [apiResponse, backendForms, formsError]);

  const resolvedTotalCount = useMemo(() => {
    if (!apiResponse || formsError) return 0;
    if (
      apiResponse.totalCount === pageSize &&
      apiResponse.pageSize === currentPage &&
      apiResponse.pageNumber !== currentPage
    ) {
      return apiResponse.pageNumber;
    }
    return apiResponse.totalCount ?? forms.length;
  }, [apiResponse, formsError, pageSize, currentPage, forms.length]);

  const backendServiceVariants: ServiceVariantToolbarItem[] = useMemo(() => {
    if (!serviceVariantsResponse?.data || !activeForm) return [];
    const effectiveServices = getEffectiveLinkedServices(activeForm, services);
    const linkedServiceIds = new Set(
      effectiveServices
        .map((s) => s.id)
        .filter((id): id is string => Boolean(id && !id.startsWith("canonical-")))
    );
    const linkedServiceNames = new Set(
      effectiveServices.map((s) => (s.name ?? "").toLowerCase().trim()).filter(Boolean)
    );
    if (activeForm.serviceId) linkedServiceIds.add(activeForm.serviceId);
    if (activeForm.serviceName) linkedServiceNames.add(activeForm.serviceName.toLowerCase().trim());

    return serviceVariantsResponse.data
      .filter(
        (v) =>
          (v.serviceId && linkedServiceIds.has(v.serviceId)) ||
          (v.serviceName && linkedServiceNames.has(v.serviceName.toLowerCase().trim()))
      )
      .map((v) => {
        const matchedSvc = services.find((s) => s.id === v.serviceId);
        return {
          id: v.id,
          name:
            v.description && v.description.trim().length > 0
              ? `${v.description} (${v.type})`
              : `${v.type}`,
          serviceId: v.serviceId,
          serviceName: v.serviceName || matchedSvc?.name,
          serviceCode: matchedSvc?.code,
          source: "service" as const,
        };
      });
  }, [serviceVariantsResponse, activeForm, services]);

  const currentFormVariants = useMemo(() => {
    if (!activeForm) return [];
    return collectAllFormVariants(activeForm, services, backendServiceVariants);
  }, [activeForm, services, backendServiceVariants]);

  const allVariantNames = useMemo(
    () => currentFormVariants.map((v) => v.name),
    [currentFormVariants]
  );

  const customizedVariantNames = useMemo(() => {
    if (!activeForm) return [];
    return currentFormVariants
      .filter((v) =>
        activeForm.fields.some(
          (f) =>
            f.type !== "divider" &&
            (!isFieldApplicableForVariant(f, v.name) || isExclusiveToVariant(f, v.name))
        )
      )
      .map((v) => v.name);
  }, [activeForm, currentFormVariants]);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedServiceId,
    setSelectedServiceId,
    statusFilter,
    setStatusFilter,
    formService,
    formsError,
    loadingForms,
    mutate,
    categories,
    services,
    backendForms,
    forms,
    resolvedTotalCount,
    backendServiceVariants,
    allVariantNames,
    customizedVariantNames,
  };
}
