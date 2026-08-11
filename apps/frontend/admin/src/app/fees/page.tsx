"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CircleDollarSign, Plus, Search, Coins, Tag, CheckCircle2, Blocks, Scale, Loader2 } from "lucide-react";
import { useFeesService } from "@/services/feesService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { useSWRConfig } from "swr";
import { Fee, ServiceFee, ServiceVariantFee, ServiceVariantElementFee, Element } from "@edge/api";
import { Button } from "@/components/ui/button";
import { FeesTable } from "@/components/fees/FeesTable";
import { ServiceFeesTable } from "@/components/fees/ServiceFeesTable";
import { ServiceVariantFeesTable } from "@/components/fees/ServiceVariantFeesTable";
import { ServiceVariantElementFeesTable } from "@/components/fees/ServiceVariantElementFeesTable";
import { CreateRecordDialog } from "@/components/fees/CreateRecordDialog";
import { EditRecordDialog } from "@/components/fees/EditRecordDialog";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { isForbiddenError, PageForbiddenState } from "@/components/PageForbiddenState";

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

interface ConfirmConfig {
  title: string;
  description: string;
  actionType: "create" | "edit" | "delete" | "toggle-status";
  payload: any;
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
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [selectedServiceFee, setSelectedServiceFee] = useState<ServiceFee | null>(null);
  const [selectedServiceVariantFee, setSelectedServiceVariantFee] = useState<ServiceVariantFee | null>(null);
  const [selectedServiceVariantElementFee, setSelectedServiceVariantElementFee] = useState<ServiceVariantElementFee | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Confirmation States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when search query or active tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const { data: fees = [], totalCount: feesTotalCount, mutate: mutateFees, isLoading: loadingFees, error: errorFees } = useFees(
    activeTab === "fees" ? currentPage : 1,
    activeTab === "fees" ? pageSize : 9999,
    activeTab === "fees" ? searchTerm : undefined,
    activeTab === "fees" || activeTab === "service-fees" || isCreateOpen || isEditOpen
  );
  const { data: serviceFees = [], totalCount: serviceFeesTotalCount, mutate: mutateServiceFees, isLoading: loadingSFees, error: errorSFees } = useServiceFees(
    activeTab === "service-fees" ? currentPage : 1,
    activeTab === "service-fees" ? pageSize : 9999,
    activeTab === "service-fees" ? searchTerm : undefined,
    activeTab === "service-fees" || activeTab === "fees" || isCreateOpen || isEditOpen
  );
  const { data: serviceVariantFees = [], totalCount: serviceVariantFeesTotalCount, mutate: mutateServiceVariantFees, isLoading: loadingSVFees, error: errorSVFees } = useServiceVariantFees(
    undefined,
    activeTab === "service-variant-fees" ? currentPage : 1,
    activeTab === "service-variant-fees" ? pageSize : 9999,
    activeTab === "service-variant-fees" ? searchTerm : undefined,
    activeTab === "service-variant-fees"
  );
  const { data: serviceVariantElementFees = [], totalCount: serviceVariantElementFeesTotalCount, mutate: mutateServiceVariantElementFees, isLoading: loadingSVEFees, error: errorSVEFees } = useServiceVariantElementFees(
    undefined,
    activeTab === "service-variant-element-fees" ? currentPage : 1,
    activeTab === "service-variant-element-fees" ? pageSize : 9999,
    activeTab === "service-variant-element-fees" ? searchTerm : undefined,
    activeTab === "service-variant-element-fees"
  );
  const { data: elements = [] } = useElements(
    1,
    9999,
    undefined,
    activeTab === "service-variant-element-fees" || isCreateOpen || isEditOpen
  );

  const error = errorFees || errorSFees || errorSVFees || errorSVEFees;

  const { data: services = [] } = useServices(
    isCreateOpen || isEditOpen || activeTab === "service-fees"
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const invalidatePrefix = (prefix: string) => {
    globalMutate((key: unknown) => typeof key === "string" && key.startsWith(prefix));
  };

  const handleCreateSubmit = async (tab: TabType, data: {
    code: string; name: string; description: string;
    serviceId: string; serviceVariantId: string; elementId: string;
    feeId: string; amount: number;
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
        await createServiceVariantFee({ serviceVariantId: data.serviceVariantId, feeId: data.feeId, amount: data.amount });
        invalidatePrefix("/api/v2/service-variant-fees");
      } else if (tab === "service-variant-element-fees") {
        await createServiceVariantElementFee({ serviceVariantId: data.serviceVariantId, elementId: data.elementId, feeId: data.feeId, amount: data.amount });
        invalidatePrefix("/api/v2/service-variant-element-fees");
      }
      setIsCreateOpen(false);
      showToast("Record registered successfully!");
    } catch (err) {
      console.error(err);
      showToast("An error occurred while registering the record.");
    }
  };

  const handleEditSubmit = async (tab: TabType, data: {
    code: string; name: string; description: string;
    serviceId: string; serviceVariantId: string; elementId: string;
    feeId: string; amount: number;
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
        await updateServiceVariantFee(selectedServiceVariantFee.id, { serviceVariantId: data.serviceVariantId, feeId: data.feeId, amount: data.amount });
        invalidatePrefix("/api/v2/service-variant-fees");
      } else if (tab === "service-variant-element-fees" && selectedServiceVariantElementFee !== null) {
        await updateServiceVariantElementFee(selectedServiceVariantElementFee.id, { serviceVariantId: data.serviceVariantId, elementId: data.elementId, feeId: data.feeId, amount: data.amount });
        invalidatePrefix("/api/v2/service-variant-element-fees");
      }
      setIsEditOpen(false);
      showToast("Record updated successfully!");
    } catch (err) {
      console.error(err);
      showToast("An error occurred while updating the record.");
    }
  };

  const handleDeleteRequest = (tab: TabType, item: any) => {
    let desc = "";
    if (tab === "fees") desc = `fee code '${item.code}'`;
    else if (tab === "service-fees") desc = "service fee rate";
    else if (tab === "service-variant-fees") desc = "service variant fee mapping";
    else desc = "service variant element fee mapping";

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
        showToast("Record deleted successfully.");
      } 
      else if (actionType === "toggle-status") {
        const { item, newStatus } = payload;
        await toggleFeeStatus(item.id, newStatus);
        invalidatePrefix("/api/v2/fees");
        showToast(`Fee '${item.code}' active status is now set to: ${newStatus ? "Active" : "Inactive"}`);
      }
    } catch (err: any) {
      console.error(err);
      showToast("An error occurred while executing the transaction.");
    } finally {
      setIsProcessing(false);
      setConfirmOpen(false);
      setConfirmConfig(null);
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg !== null && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/60 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><CircleDollarSign className="w-64 h-64 text-indigo-600 dark:text-indigo-400" /></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5"><CircleDollarSign className="w-3.5 h-3.5" /> Fees & Rate Management</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Fees & Rate Configuration</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">Configure system-wide administrative fees, map charges to service standards, variants, and billing elements.</p>
          </div>
          {canManage && (
            <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              <span>
                {activeTab === "fees" && "Add Fee Code"}
                {activeTab === "service-fees" && "Configure Service Charge"}
                {activeTab === "service-variant-fees" && "Configure Variant Fee"}
                {activeTab === "service-variant-element-fees" && "Configure Variant Element Fee"}
              </span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setActiveTab("fees"); setSearchTerm(""); }} className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === "fees" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}><Coins className="w-3.5 h-3.5" />Fee Catalog</button>
          <button onClick={() => { setActiveTab("service-fees"); setSearchTerm(""); }} className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === "service-fees" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}><Tag className="w-3.5 h-3.5" />Service Fee Rates</button>
          <button onClick={() => { setActiveTab("service-variant-fees"); setSearchTerm(""); }} className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === "service-variant-fees" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}><Scale className="w-3.5 h-3.5" />Variant Fees</button>
          <button onClick={() => { setActiveTab("service-variant-element-fees"); setSearchTerm(""); }} className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === "service-variant-element-fees" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}><Blocks className="w-3.5 h-3.5" />Variant Element Fees</button>
        </div>
        <div className="relative w-full xl:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" />
          <input type="text" placeholder="Search configurations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
                serviceFees={serviceFees} 
                totalCount={serviceFeesTotalCount}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                loading={loadingSFees} 
                canManage={canManage} 
                onEdit={(sf) => { setSelectedServiceFee(sf); setIsEditOpen(true); }} 
                onDelete={(sf) => handleDeleteRequest("service-fees", sf)} 
              />
            )}
            {activeTab === "service-variant-fees" && (
              <ServiceVariantFeesTable 
                serviceVariantFees={serviceVariantFees} 
                totalCount={serviceVariantFeesTotalCount}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                loading={loadingSVFees} 
                canManage={canManage} 
                onEdit={(svf) => { setSelectedServiceVariantFee(svf); setIsEditOpen(true); }} 
                onDelete={(svf) => handleDeleteRequest("service-variant-fees", svf)} 
              />
            )}
            {activeTab === "service-variant-element-fees" && (
              <ServiceVariantElementFeesTable 
                serviceVariantElementFees={serviceVariantElementFees} 
                totalCount={serviceVariantElementFeesTotalCount}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                loading={loadingSVEFees} 
                canManage={canManage} 
                onEdit={(svef) => { setSelectedServiceVariantElementFee(svef); setIsEditOpen(true); }} 
                onDelete={(svef) => handleDeleteRequest("service-variant-element-fees", svef)} 
              />
            )}
          </>
        )}
      </div>

      <CreateRecordDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        activeTab={activeTab} 
        fees={fees} 
        elements={elements}
        services={services}
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
