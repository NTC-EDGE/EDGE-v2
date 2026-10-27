"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CircleDollarSign, Plus, Search, Coins, Tag, Blocks, Scale, Loader2, X } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { formatApplicationType } from "@/components/fees/ServiceVariantFeesTable";
import { useFeesService } from "@/services/feesService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { useSWRConfig } from "swr";
import {
  Fee,
  ServiceFee,
  ServiceVariantFee,
  ServiceVariantElementFee,
  ServiceFeeGroup,
  ServiceVariantFeeGroup,
  ServiceVariantElementFeeGroup,
  Element,
  FeeCalculationMode,
} from "@edge/api";
import { Button } from "@/components/ui/button";
import { FeesTable } from "@/components/fees/FeesTable";
import { ServiceFeesTable } from "@/components/fees/ServiceFeesTable";
import { ServiceVariantFeesTable } from "@/components/fees/ServiceVariantFeesTable";
import { ServiceVariantElementFeesTable } from "@/components/fees/ServiceVariantElementFeesTable";
import { ManageLinkedFeesDialog, ManageLinkedFeesEntityType } from "@/components/fees/ManageLinkedFeesDialog";
import { CreateRecordDialog } from "@/components/fees/CreateRecordDialog";
import { EditRecordDialog } from "@/components/fees/EditRecordDialog";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { isForbiddenError, PageForbiddenState } from "@/components/PageForbiddenState";
import { showToast } from "@/components/ui/toast-notification";

type TabType = "fees" | "service-fees" | "service-variant-fees" | "service-variant-element-fees";

const VALID_FEE_TABS: readonly TabType[] = [
  "fees",
  "service-fees",
  "service-variant-fees",
  "service-variant-element-fees",
];

const isValidFeeTab = (val: string | null): val is TabType => {
  if (val === null) return false;
  return VALID_FEE_TABS.some((t) => t === val);
};

const APPLICATION_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Application Types" },
  { value: "New", label: "New Application" },
  { value: "Renewal", label: "Renewal" },
  { value: "Modification", label: "Modification" },
  { value: "FirstTaker", label: "First Taker" },
  { value: "Retaker", label: "Retaker" },
  { value: "Upgrade", label: "Upgrade" },
  { value: "VSAT", label: "VSAT" },
  { value: "Private", label: "Private" },
  { value: "CivicActionGroup", label: "Civic Action Group" },
  { value: "Government", label: "Government" },
  { value: "NA", label: "N/A" },
];

interface ConfirmConfig {
  title: string;
  description: string;
  actionType: "create" | "edit" | "delete" | "toggle-status";
  payload: {
    tab?: TabType;
    item: Fee | ServiceFee | ServiceVariantFee | ServiceVariantElementFee;
    newStatus?: boolean;
  };
}

function FeesNotesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabQuery = searchParams.get("tab");
  const initialTab: TabType = isValidFeeTab(tabQuery) ? tabQuery : "fees";

  const { isSystemAdmin } = useAdminScope();
  const canManage = isSystemAdmin;
  const { mutate: globalMutate } = useSWRConfig();

  const {
    useFees, createFee, updateFee, deleteFee, toggleFeeStatus,
    useServiceFees, createServiceFee, updateServiceFee, deleteServiceFee,
    useServiceVariantFees, createServiceVariantFee, updateServiceVariantFee, deleteServiceVariantFee,
    useServiceVariantElementFees, createServiceVariantElementFee, updateServiceVariantElementFee, deleteServiceVariantElementFee,
    useElements, useServices,
  } = useFeesService();

  const [activeTab, setActiveTabState] = useState<TabType>(initialTab);

  useEffect(() => {
    const currentTabParam = searchParams.get("tab");
    if (isValidFeeTab(currentTabParam) && currentTabParam !== activeTab) {
      setActiveTabState(currentTabParam);
    }
  }, [searchParams]);

  const setActiveTab = (newTab: TabType) => {
    setActiveTabState(newTab);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [applicationTypeFilter, setApplicationTypeFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleServiceFilterChange = (val: string) => {
    setServiceFilter(val);
    setCurrentPage(1);
  };

  const handleAppTypeFilterChange = (val: string) => {
    setApplicationTypeFilter(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setServiceFilter("");
    setApplicationTypeFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchInput.trim().length > 0 ||
    serviceFilter !== "" ||
    applicationTypeFilter !== "";
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [selectedServiceFee, setSelectedServiceFee] = useState<ServiceFee | null>(null);
  const [selectedServiceVariantFee, setSelectedServiceVariantFee] = useState<ServiceVariantFee | null>(null);
  const [selectedServiceVariantElementFee, setSelectedServiceVariantElementFee] = useState<ServiceVariantElementFee | null>(null);

  // Manage Linked Fees Dialog State
  const [manageDialog, setManageDialog] = useState<{
    open: boolean;
    entityType: ManageLinkedFeesEntityType;
    entityId: string | null;
    secondaryId?: string | null;
    serviceId?: string | null;
    entityTitle: string;
    entitySubtitle?: string;
  }>({
    open: false,
    entityType: "service",
    entityId: null,
    entityTitle: "",
  });

  const [createContext, setCreateContext] = useState<{
    serviceId?: string | null;
    serviceVariantId?: string | null;
    elementId?: string | null;
  }>({});

  // Confirmation States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: fees = [], totalCount: feesTotalCount, mutate: mutateFees, isLoading: loadingFees, error: errorFees } = useFees(
    activeTab === "fees" ? currentPage : 1,
    activeTab === "fees" ? pageSize : 9999,
    activeTab === "fees" ? debouncedSearch : undefined,
    activeTab === "fees" || activeTab === "service-fees" || isCreateOpen || isEditOpen
  );
  const { groups: serviceFeeGroups = [], data: serviceFees = [], totalCount: serviceFeesTotalCount, mutate: mutateServiceFees, isLoading: loadingSFees, error: errorSFees } = useServiceFees(
    activeTab === "service-fees" && serviceFilter ? serviceFilter : undefined,
    activeTab === "service-fees" ? currentPage : 1,
    activeTab === "service-fees" ? pageSize : 9999,
    activeTab === "service-fees" ? debouncedSearch : undefined,
    activeTab === "service-fees" || activeTab === "fees" || isCreateOpen || isEditOpen
  );
  const { groups: serviceVariantFeeGroups = [], totalCount: serviceVariantFeesTotalCount, mutate: mutateServiceVariantFees, isLoading: loadingSVFees, error: errorSVFees } = useServiceVariantFees(
    undefined,
    activeTab === "service-variant-fees" ? currentPage : 1,
    activeTab === "service-variant-fees" ? pageSize : 9999,
    activeTab === "service-variant-fees" ? debouncedSearch : undefined,
    activeTab === "service-variant-fees",
    {
      serviceId: activeTab === "service-variant-fees" && serviceFilter ? serviceFilter : undefined,
      applicationType: activeTab === "service-variant-fees" && applicationTypeFilter ? applicationTypeFilter : undefined,
    }
  );
  const { groups: serviceVariantElementFeeGroups = [], totalCount: serviceVariantElementFeesTotalCount, mutate: mutateServiceVariantElementFees, isLoading: loadingSVEFees, error: errorSVEFees } = useServiceVariantElementFees(
    undefined,
    undefined,
    activeTab === "service-variant-element-fees" ? currentPage : 1,
    activeTab === "service-variant-element-fees" ? pageSize : 9999,
    activeTab === "service-variant-element-fees" ? debouncedSearch : undefined,
    activeTab === "service-variant-element-fees",
    {
      serviceId: activeTab === "service-variant-element-fees" && serviceFilter ? serviceFilter : undefined,
      applicationType: activeTab === "service-variant-element-fees" && applicationTypeFilter ? applicationTypeFilter : undefined,
    }
  );
  const { data: elements = [] } = useElements(
    1,
    9999,
    undefined,
    activeTab === "service-variant-element-fees" || isCreateOpen || isEditOpen
  );

  const error = errorFees || errorSFees || errorSVFees || errorSVEFees;

  const { data: services = [] } = useServices(true);

  const invalidatePrefix = (prefix: string) => {
    globalMutate((key: unknown) => typeof key === "string" && key.startsWith(prefix));
  };

  const handleManageServiceFees = (group: ServiceFeeGroup) => {
    setManageDialog({
      open: true,
      entityType: "service",
      entityId: group.serviceId,
      serviceId: group.serviceId,
      entityTitle: group.serviceName ?? "Unknown Service",
      entitySubtitle: group.serviceCode ?? undefined,
    });
  };

  const handleManageVariantFees = (group: ServiceVariantFeeGroup) => {
    const variantDisplayName = group.variantName || group.serviceName || "Variant";
    const appTypeLabel = formatApplicationType(group.applicationType ?? group.variantType);
    setManageDialog({
      open: true,
      entityType: "service-variant",
      entityId: group.serviceVariantId,
      serviceId: group.serviceId ?? null,
      entityTitle: variantDisplayName,
      entitySubtitle: `${group.serviceName ? group.serviceName + " • " : ""}${appTypeLabel}`,
    });
  };

  const handleManageElementFees = (group: ServiceVariantElementFeeGroup) => {
    const variantDisplayName = group.variantName || group.serviceName || "Variant Element";
    const appTypeLabel = formatApplicationType(group.applicationType ?? group.variantType);
    setManageDialog({
      open: true,
      entityType: "service-variant-element",
      entityId: group.serviceVariantId,
      serviceId: group.serviceId ?? null,
      entityTitle: variantDisplayName,
      entitySubtitle: `${group.serviceName ? group.serviceName + " • " : ""}${appTypeLabel}`,
    });
  };

  const handleAddFeeFromManageDialog = () => {
    if (manageDialog.entityType === "service") {
      setCreateContext({ serviceId: manageDialog.entityId });
      setActiveTab("service-fees");
    } else if (manageDialog.entityType === "service-variant") {
      setCreateContext({ serviceVariantId: manageDialog.entityId });
      setActiveTab("service-variant-fees");
    } else {
      setCreateContext({
        serviceVariantId: manageDialog.entityId,
        elementId: manageDialog.secondaryId,
      });
      setActiveTab("service-variant-element-fees");
    }
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (tab: TabType, data: {
    code: string; name: string; description: string;
    serviceId: string; serviceVariantId: string; elementId: string;
    feeId: string; amount: number;
    calculationMode?: FeeCalculationMode;
    calculationFormula?: string | null;
    multiplyByValidityYears?: boolean;
    multiplyByUnits?: boolean;
    multiplyByChannels?: boolean;
    multiplyByPages?: boolean;
    applyLateRenewalSurcharge?: boolean;
    includeDst?: boolean;
    dstAmount?: number;
    serviceFees?: { feeId: string; amount: number }[];
    notes: string; serviceCategoryId: string;
  }): Promise<void> => {
    try {
      if (tab === "fees") {
        await createFee({ code: data.code.toUpperCase(), name: data.name, description: data.description || null });
        invalidatePrefix("/api/v2/fees");
        invalidatePrefix("/api/v2/service-fees");
        invalidatePrefix("/api/v2/service-variant-fees");
        invalidatePrefix("/api/v2/service-variant-element-fees");
      } else if (tab === "service-fees") {
        if (data.serviceFees && data.serviceFees.length > 0) {
          await createServiceFee({ serviceId: data.serviceId, fees: data.serviceFees });
        } else {
          await createServiceFee({ serviceId: data.serviceId, fees: [{ feeId: data.feeId, amount: data.amount }] });
        }
        invalidatePrefix("/api/v2/service-fees");
      } else if (tab === "service-variant-fees") {
        await createServiceVariantFee({
          serviceVariantId: data.serviceVariantId,
          feeId: data.feeId,
          amount: data.amount,
          calculationMode: data.calculationMode,
          calculationFormula: data.calculationFormula,
          multiplyByValidityYears: data.multiplyByValidityYears,
          multiplyByUnits: data.multiplyByUnits,
          multiplyByChannels: data.multiplyByChannels,
          multiplyByPages: data.multiplyByPages,
          applyLateRenewalSurcharge: data.applyLateRenewalSurcharge,
          includeDst: data.includeDst,
          dstAmount: data.dstAmount,
        });
        invalidatePrefix("/api/v2/service-variant-fees");
      } else if (tab === "service-variant-element-fees") {
        await createServiceVariantElementFee({
          serviceVariantId: data.serviceVariantId,
          elementId: data.elementId,
          feeId: data.feeId,
          amount: data.amount,
          calculationMode: data.calculationMode,
          calculationFormula: data.calculationFormula,
          multiplyByValidityYears: data.multiplyByValidityYears,
          multiplyByUnits: data.multiplyByUnits,
          multiplyByChannels: data.multiplyByChannels,
          multiplyByPages: data.multiplyByPages,
          applyLateRenewalSurcharge: data.applyLateRenewalSurcharge,
          includeDst: data.includeDst,
          dstAmount: data.dstAmount,
        });
        invalidatePrefix("/api/v2/service-variant-element-fees");
      }
      setIsCreateOpen(false);
      setCreateContext({});
      showToast.success("Record registered successfully.");
    } catch {
      showToast.error("An error occurred while registering the record.");
    }
  };

  const handleEditSubmit = async (tab: TabType, data: {
    code: string; name: string; description: string;
    serviceId: string; serviceVariantId: string; elementId: string;
    feeId: string; amount: number;
    calculationMode?: FeeCalculationMode;
    calculationFormula?: string | null;
    multiplyByValidityYears?: boolean;
    multiplyByUnits?: boolean;
    multiplyByChannels?: boolean;
    multiplyByPages?: boolean;
    applyLateRenewalSurcharge?: boolean;
    includeDst?: boolean;
    dstAmount?: number;
    serviceFees?: { feeId: string; amount: number }[];
    notes: string; serviceCategoryId: string;
  }): Promise<void> => {
    try {
      if (tab === "fees" && selectedFee !== null) {
        await updateFee(selectedFee.id, { code: data.code.toUpperCase(), name: data.name, description: data.description || null });
        invalidatePrefix("/api/v2/fees");
        invalidatePrefix("/api/v2/service-fees");
        invalidatePrefix("/api/v2/service-variant-fees");
        invalidatePrefix("/api/v2/service-variant-element-fees");
      } else if (tab === "service-fees" && selectedServiceFee !== null) {
        await updateServiceFee(selectedServiceFee.id, { serviceId: data.serviceId, feeId: data.feeId, amount: data.amount });
        invalidatePrefix("/api/v2/service-fees");
      } else if (tab === "service-variant-fees" && selectedServiceVariantFee !== null) {
        await updateServiceVariantFee(selectedServiceVariantFee.id, {
          serviceVariantId: data.serviceVariantId,
          feeId: data.feeId,
          amount: data.amount,
          calculationMode: data.calculationMode,
          calculationFormula: data.calculationFormula,
          multiplyByValidityYears: data.multiplyByValidityYears,
          multiplyByUnits: data.multiplyByUnits,
          multiplyByChannels: data.multiplyByChannels,
          multiplyByPages: data.multiplyByPages,
          applyLateRenewalSurcharge: data.applyLateRenewalSurcharge,
          includeDst: data.includeDst,
          dstAmount: data.dstAmount,
        });
        invalidatePrefix("/api/v2/service-variant-fees");
      } else if (tab === "service-variant-element-fees" && selectedServiceVariantElementFee !== null) {
        await updateServiceVariantElementFee(selectedServiceVariantElementFee.id, {
          serviceVariantId: data.serviceVariantId,
          elementId: data.elementId,
          feeId: data.feeId,
          amount: data.amount,
          calculationMode: data.calculationMode,
          calculationFormula: data.calculationFormula,
          multiplyByValidityYears: data.multiplyByValidityYears,
          multiplyByUnits: data.multiplyByUnits,
          multiplyByChannels: data.multiplyByChannels,
          multiplyByPages: data.multiplyByPages,
          applyLateRenewalSurcharge: data.applyLateRenewalSurcharge,
          includeDst: data.includeDst,
          dstAmount: data.dstAmount,
        });
        invalidatePrefix("/api/v2/service-variant-element-fees");
      }
      setIsEditOpen(false);
      showToast.success("Record updated successfully.");
    } catch {
      showToast.error("An error occurred while updating the record.");
    }
  };

  const handleDeleteRequest = (tab: TabType, item: Fee | ServiceFee | ServiceVariantFee | ServiceVariantElementFee) => {
    let desc = "";
    if (tab === "fees") {
      const feeCode = "code" in item && typeof item.code === "string" ? item.code : "selected";
      desc = `fee code '${feeCode}'`;
    } else if (tab === "service-fees") {
      desc = "service fee rate";
    } else if (tab === "service-variant-fees") {
      desc = "service variant fee mapping";
    } else {
      desc = "service variant element fee mapping";
    }

    setConfirmConfig({
      title: "Confirm Deletion",
      description: `Are you sure you want to permanently delete this ${desc}? This action cannot be undone.`,
      actionType: "delete",
      payload: { tab, item }
    });
    setConfirmOpen(true);
  };

  const handleToggleStatusRequest = (item: Fee) => {
    const newStatus = item.isActive !== false ? false : true;
    setConfirmConfig({
      title: "Confirm Status Change",
      description: `Are you sure you want to change the status of fee '${item.code}' to ${newStatus ? "ACTIVE" : "INACTIVE"}?`,
      actionType: "toggle-status",
      payload: { item, newStatus }
    });
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (confirmConfig === null) return;
    setIsProcessing(true);
    const { actionType, payload } = confirmConfig;

    try {
      if (actionType === "delete") {
        const { tab, item } = payload;
        if (tab === "fees") {
          await deleteFee(item.id);
          invalidatePrefix("/api/v2/fees");
          invalidatePrefix("/api/v2/service-fees");
          invalidatePrefix("/api/v2/service-variant-fees");
          invalidatePrefix("/api/v2/service-variant-element-fees");
        } else if (tab === "service-fees") {
          await deleteServiceFee(item.id);
          invalidatePrefix("/api/v2/service-fees");
        } else if (tab === "service-variant-fees") {
          await deleteServiceVariantFee(item.id);
          invalidatePrefix("/api/v2/service-variant-fees");
        } else if (tab === "service-variant-element-fees") {
          await deleteServiceVariantElementFee(item.id);
          invalidatePrefix("/api/v2/service-variant-element-fees");
        }
        showToast.success("Record deleted successfully.");
      } 
      else if (actionType === "toggle-status") {
        const { item, newStatus } = payload;
        await toggleFeeStatus(item.id, newStatus ?? true);
        invalidatePrefix("/api/v2/fees");
        const code = "code" in item && typeof item.code === "string" ? item.code : "";
        showToast.success(`Fee '${code}' status is now ${newStatus ? "Active" : "Inactive"}.`);
      }
    } catch {
      showToast.error("An error occurred while executing the transaction.");
    } finally {
      setIsProcessing(false);
      setConfirmOpen(false);
      setConfirmConfig(null);
    }
  };

  return (
    <div className="space-y-6">

      <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/60 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><CircleDollarSign className="w-64 h-64 text-indigo-600 dark:text-indigo-400" /></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5"><CircleDollarSign className="w-3.5 h-3.5" /> Fees & Rate Management</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Fees & Rate Configuration</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Manage administrative fee codes, and configure dynamic formulas (e.g. <code className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1 py-0.5 rounded font-bold">{"{RATE} * {YEARS}"}</code>) and late renewal penalties mapped to service variants.
            </p>
          </div>
          {canManage && (
            <Button
              onClick={() => {
                setCreateContext({});
                setIsCreateOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeTab === "fees" && "Add Fee Code"}
                {activeTab === "service-fees" && "Configure Service Charge"}
                {activeTab === "service-variant-fees" && "Configure Variant Formula"}
                {activeTab === "service-variant-element-fees" && "Configure Element Formula"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("fees")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === "fees"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Fee Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab("service-fees")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "service-fees"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Fixed Service Rates</span>
          </button>

          <button
            onClick={() => setActiveTab("service-variant-fees")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === "service-variant-fees"
                ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-indigo-400" />
            <span>Variant Rates & Formulas</span>
          </button>

          <button
            onClick={() => setActiveTab("service-variant-element-fees")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === "service-variant-element-fees"
                ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Blocks className="w-3.5 h-3.5 text-indigo-400" />
            <span>Variant Element Formulas</span>
          </button>
        </div>
      </div>

      {/* Upper Filters & Backend Search Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Backend Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder={
              activeTab === "fees"
                ? "Search fee codes and descriptions (server-side)..."
                : activeTab === "service-fees"
                ? "Search services, fee codes, and rates (server-side)..."
                : "Search services, variants, formulas, and fee codes (server-side)..."
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchInput.length > 0 && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Upper Dropdown Filters */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Service Filter (applicable to service-fees, service-variant-fees, service-variant-element-fees) */}
          {activeTab !== "fees" && (
            <div className="w-full sm:w-60">
              <SearchableSelect
                value={serviceFilter}
                onChange={handleServiceFilterChange}
                placeholder="All Services"
                searchPlaceholder="Filter by service..."
                maxHeight="max-h-56"
                clearable
                options={[
                  { value: "", label: "All Services" },
                  ...services.map((s) => ({
                    value: s.id,
                    label: s.name,
                  })),
                ]}
              />
            </div>
          )}

          {/* Application Type Filter (applicable to service-variant-fees and service-variant-element-fees) */}
          {(activeTab === "service-variant-fees" || activeTab === "service-variant-element-fees") && (
            <div className="w-full sm:w-52">
              <SearchableSelect
                value={applicationTypeFilter}
                onChange={handleAppTypeFilterChange}
                placeholder="All Application Types"
                searchPlaceholder="Filter application type..."
                maxHeight="max-h-56"
                clearable
                options={APPLICATION_TYPE_OPTIONS}
              />
            </div>
          )}

          {/* Reset / Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="h-9 px-3 rounded-xl border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 text-xs shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </Button>
          )}
        </div>
      </div>


      <div className="animate-fade-in">
        {!!error && isForbiddenError(error) && <PageForbiddenState />}
        {!!error && !isForbiddenError(error) && (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl">
            <p className="text-red-500 font-medium text-base">Failed to load data</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 font-medium">Retry</button>
          </div>
        )}
        {!error && (
          <>
            {activeTab === "fees" && (
              <FeesTable 
                fees={fees} 
                totalCount={feesTotalCount}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                serviceFees={serviceFees}
                loading={loadingFees} 
                canManage={canManage} 
                onEdit={(f) => { setSelectedFee(f); setIsEditOpen(true); }} 
                onDelete={(f) => handleDeleteRequest("fees", f)} 
                onToggleStatus={handleToggleStatusRequest}
              />
            )}
            {activeTab === "service-fees" && (
              <ServiceFeesTable 
                groups={serviceFeeGroups} 
                totalCount={serviceFeesTotalCount}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                loading={loadingSFees} 
                canManage={canManage} 
                onManageFees={handleManageServiceFees}
              />
            )}
            {activeTab === "service-variant-fees" && (
              <ServiceVariantFeesTable 
                groups={serviceVariantFeeGroups} 
                totalCount={serviceVariantFeesTotalCount}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                loading={loadingSVFees} 
                canManage={canManage} 
                onManageFees={handleManageVariantFees}
              />
            )}
            {activeTab === "service-variant-element-fees" && (
              <ServiceVariantElementFeesTable 
                groups={serviceVariantElementFeeGroups} 
                totalCount={serviceVariantElementFeesTotalCount}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                loading={loadingSVEFees} 
                canManage={canManage} 
                onManageFees={handleManageElementFees}
              />
            )}
          </>
        )}
      </div>

      <ManageLinkedFeesDialog
        open={manageDialog.open}
        onOpenChange={(open) => setManageDialog((prev) => ({ ...prev, open }))}
        entityType={manageDialog.entityType}
        entityId={manageDialog.entityId}
        secondaryId={manageDialog.secondaryId}
        entityTitle={manageDialog.entityTitle}
        entitySubtitle={manageDialog.entitySubtitle}
        canManage={canManage}
        onAddFee={handleAddFeeFromManageDialog}
        onEditFee={(item) => {
          if (manageDialog.entityType === "service" && "serviceId" in item) {
            setSelectedServiceFee(item);
            setActiveTab("service-fees");
          } else if (manageDialog.entityType === "service-variant" && "serviceVariantId" in item && !("elementId" in item)) {
            setSelectedServiceVariantFee(item);
            setActiveTab("service-variant-fees");
          } else if ("elementId" in item) {
            setSelectedServiceVariantElementFee(item);
            setActiveTab("service-variant-element-fees");
          }
          setIsEditOpen(true);
        }}
        onDeleteFee={(item) => {
          const tab: TabType =
            manageDialog.entityType === "service"
              ? "service-fees"
              : manageDialog.entityType === "service-variant"
              ? "service-variant-fees"
              : "service-variant-element-fees";
          handleDeleteRequest(tab, item);
        }}
      />

      <CreateRecordDialog 
        open={isCreateOpen} 
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setCreateContext({});
        }} 
        activeTab={activeTab} 
        fees={fees} 
        elements={elements}
        services={services}
        initialServiceId={createContext.serviceId}
        initialServiceVariantId={createContext.serviceVariantId}
        initialElementId={createContext.elementId}
        onSubmit={handleCreateSubmit} 
      />
      <EditRecordDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        activeTab={activeTab} 
        fees={fees} 
        elements={elements}
        services={services}
        selectedFee={selectedFee} 
        selectedServiceFee={selectedServiceFee} 
        selectedServiceVariantFee={selectedServiceVariantFee}
        selectedServiceVariantElementFee={selectedServiceVariantElementFee}
        initialServiceId={manageDialog.serviceId ?? (manageDialog.entityType === "service" ? manageDialog.entityId : null)}
        initialServiceVariantId={manageDialog.entityType !== "service" ? manageDialog.entityId : null}
        initialElementId={manageDialog.secondaryId ?? null}
        onSubmit={handleEditSubmit} 
      />
      
      <ConfirmActionDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setConfirmConfig(null); }}
        onConfirm={handleConfirmAction}
        title={confirmConfig?.title}
        description={confirmConfig?.description}
        loading={isProcessing}
      />
    </div>
  );
}

export default function FeesNotesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span>Loading Fee Management...</span>
        </div>
      }
    >
      <FeesNotesContent />
    </Suspense>
  );
}
