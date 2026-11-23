import { useState, useMemo, useEffect } from "react";
import { FormSchema, ServiceVariantToolbarItem } from "../types";
import { isRecord } from "../utils/fieldDefaults";
import { convertBackendFormToSchema, BackendFormDtoLike } from "../utils/schemaFromBackend";
import {
  isFieldApplicableForVariant,
  isExclusiveToVariant,
  findVariantOverrideEntry,
  variantNamesMatch,
} from "../utils/variantConditionUtils";
import { collectAllFormVariants } from "../canonicalFormServices";
import { useFormBuilderService } from "@/services/formBuilderService";
import { useCatalogService, ServiceCategory, ServiceItem } from "@/services/catalogService";

function isBackendFormDtoLike(val: unknown): val is BackendFormDtoLike {
  return isRecord(val);
}

export function useFormBuilderCatalogAndList(params: {
  view: "list" | "builder";
  activeForm: FormSchema | null;
  workspaceVariants: ServiceVariantToolbarItem[];
  workspaceServices: ServiceItem[];
  shouldLoadFilterOptions: boolean;
}) {
  const {
    view,
    activeForm,
    workspaceVariants,
    workspaceServices,
    shouldLoadFilterOptions,
  } = params;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");

  // Debounce search input by 300ms so typing doesn't hammer the backend on every keystroke
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (trimmed.length === 0) {
      setDebouncedSearchTerm("");
      return;
    }
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(trimmed);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const formService = useFormBuilderService();
  const catalogService = useCatalogService();

  // Dedicated lightweight summaries endpoint — called ONLY when on the List view!
  const {
    data: apiResponse,
    error: formsError,
    isLoading: loadingForms,
    mutate,
  } = formService.useFormSummaries(
    currentPage,
    pageSize,
    debouncedSearchTerm,
    selectedServiceId || undefined,
    undefined,
    selectedCategoryId || undefined,
    statusFilter === "all" ? undefined : statusFilter === "active",
    view === "list"
  );

  // Dedicated lightweight filter-options endpoint — called ONLY on demand when user opens filters/modals!
  const enableFilterFetch =
    shouldLoadFilterOptions || Boolean(selectedCategoryId) || Boolean(selectedServiceId);
  const { data: filterOptionsResponse } = formService.useFormFilterOptions(enableFilterFetch);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("edge_form_builder_forms");
      } catch {
        // ignore
      }
    }
  }, []);

  const categories: ServiceCategory[] = useMemo(() => {
    return filterOptionsResponse?.data?.categories ?? [];
  }, [filterOptionsResponse]);

  const services: ServiceItem[] = useMemo(() => {
    const fromFilter = filterOptionsResponse?.data?.services ?? [];
    if (workspaceServices.length === 0) return fromFilter;
    if (fromFilter.length === 0) return workspaceServices;

    const merged = new Map<string, ServiceItem>();
    for (const s of fromFilter) merged.set(s.id, s);
    for (const ws of workspaceServices) {
      if (!merged.has(ws.id)) merged.set(ws.id, ws);
    }
    return Array.from(merged.values());
  }, [filterOptionsResponse, workspaceServices]);

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

  // Scoped variants delivered directly by the dedicated `/api/v2/forms/{id}/workspace` endpoint!
  const backendServiceVariants: ServiceVariantToolbarItem[] = workspaceVariants;

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
    const customIds = new Set(
      (activeForm.customizedVariantIds ?? []).map((id) => id.toLowerCase().trim())
    );
    return currentFormVariants
      .filter((v) => {
        if (v.id && customIds.has(v.id.toLowerCase().trim())) {
          return true;
        }
        return activeForm.fields.some((f) => {
          if (f.type === "divider") return false;
          if (!isFieldApplicableForVariant(f, v.name) || isExclusiveToVariant(f, v.name)) {
            return true;
          }
          if (findVariantOverrideEntry(f.variantOverrides, v.name) !== undefined) {
            return true;
          }
          if (f.variantTitles) {
            for (const k of Object.keys(f.variantTitles)) {
              if (variantNamesMatch(k, v.name)) return true;
            }
          }
          return false;
        });
      })
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
    catalogService,
    formsError,
    loadingForms,
    mutate,
    categories,
    services,
    backendForms,
    forms,
    resolvedTotalCount,
    backendServiceVariants,
    currentFormVariants,
    allVariantNames,
    customizedVariantNames,
  };
}
