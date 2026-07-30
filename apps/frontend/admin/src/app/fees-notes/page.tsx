"use client";

import React, { useState, useEffect } from "react";
import { CircleDollarSign, Plus, Search, Coins, Tag, BookOpen, CheckCircle2, Layers, Blocks, Scale } from "lucide-react";
import { useFeesNotesService } from "@/services/feesNotesService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { mutate } from "swr";
import { Fee, ServiceFee, Note, Element, ServiceVariantFee, ServiceVariantElementFee } from "@edge/api";
import { Button } from "@/components/ui/button";
import { FeesTable } from "@/components/fees-notes/FeesTable";
import { ServiceFeesTable } from "@/components/fees-notes/ServiceFeesTable";
import { ElementsTable } from "@/components/fees-notes/ElementsTable";
import { ServiceVariantFeesTable } from "@/components/fees-notes/ServiceVariantFeesTable";
import { ServiceVariantElementFeesTable } from "@/components/fees-notes/ServiceVariantElementFeesTable";
import { NotesTable } from "@/components/fees-notes/NotesTable";
import { CreateRecordDialog } from "@/components/fees-notes/CreateRecordDialog";
import { EditRecordDialog } from "@/components/fees-notes/EditRecordDialog";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";

type TabType = "fees" | "service-fees" | "notes" | "elements" | "service-variant-fees" | "service-variant-element-fees";

interface ConfirmConfig {
  title: string;
  description: string;
  actionType: "create" | "edit" | "delete" | "toggle-status";
  payload: any;
}

export default function FeesNotesPage() {
  const { isSystemAdmin } = useAdminScope();
  const canManage = isSystemAdmin;

  const {
    useFees, createFee, updateFee, deleteFee, toggleFeeStatus,
    useServiceFees, createServiceFee, updateServiceFee, deleteServiceFee,
    useElements, createElement, updateElement, deleteElement,
    useServiceVariantFees, createServiceVariantFee, updateServiceVariantFee, deleteServiceVariantFee,
    useServiceVariantElementFees, createServiceVariantElementFee, updateServiceVariantElementFee, deleteServiceVariantElementFee,
    useNotes, createNote, updateNote, deleteNote,
    useServices, useServiceCategories
  } = useFeesNotesService();

  const [activeTab, setActiveTab] = useState<TabType>("fees");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [selectedServiceFee, setSelectedServiceFee] = useState<ServiceFee | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
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

  const { data: fees = [], totalCount: feesTotalCount, mutate: mutateFees, isLoading: loadingFees } = useFees(
    activeTab === "fees" ? currentPage : 1,
    activeTab === "fees" ? pageSize : 9999,
    activeTab === "fees" ? searchTerm : undefined,
    activeTab === "fees" || activeTab === "service-fees" || isCreateOpen || isEditOpen
  );
  const { data: serviceFees = [], totalCount: serviceFeesTotalCount, mutate: mutateServiceFees, isLoading: loadingSFees } = useServiceFees(
    activeTab === "service-fees" ? currentPage : 1,
    activeTab === "service-fees" ? pageSize : 9999,
    activeTab === "service-fees" ? searchTerm : undefined,
    activeTab === "service-fees" || activeTab === "fees" || isCreateOpen || isEditOpen
  );
  const { data: elements = [], totalCount: elementsTotalCount, mutate: mutateElements, isLoading: loadingElements } = useElements(
    activeTab === "elements" ? currentPage : 1,
    activeTab === "elements" ? pageSize : 9999,
    activeTab === "elements" ? searchTerm : undefined,
    activeTab === "elements" || activeTab === "service-variant-element-fees" || isCreateOpen || isEditOpen
  );
  const { data: serviceVariantFees = [], totalCount: serviceVariantFeesTotalCount, mutate: mutateServiceVariantFees, isLoading: loadingSVFees } = useServiceVariantFees(
    undefined,
    activeTab === "service-variant-fees" ? currentPage : 1,
    activeTab === "service-variant-fees" ? pageSize : 9999,
    activeTab === "service-variant-fees" ? searchTerm : undefined,
    activeTab === "service-variant-fees"
  );
  const { data: serviceVariantElementFees = [], totalCount: serviceVariantElementFeesTotalCount, mutate: mutateServiceVariantElementFees, isLoading: loadingSVEFees } = useServiceVariantElementFees(
    undefined,
    activeTab === "service-variant-element-fees" ? currentPage : 1,
    activeTab === "service-variant-element-fees" ? pageSize : 9999,
    activeTab === "service-variant-element-fees" ? searchTerm : undefined,
    activeTab === "service-variant-element-fees"
  );
  const { data: notes = [], totalCount: notesTotalCount, mutate: mutateNotes, isLoading: loadingNotes } = useNotes(
    currentPage,
    pageSize,
    activeTab === "notes" ? searchTerm : undefined,
    activeTab === "notes"
  );
  const { data: services = [] } = useServices(
    isCreateOpen || isEditOpen || activeTab === "service-fees"
  );
  const { data: categories = [] } = useServiceCategories(
    isCreateOpen || isEditOpen || activeTab === "notes"
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const invalidatePrefix = (prefix: string) => {
    mutate(
      (key) => typeof key === "string" && key.startsWith(prefix),
      undefined,
      { revalidate: true }
    );
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
      } else if (tab === "elements") {
        await createElement({ code: data.code.toUpperCase(), name: data.name, description: data.description || null });
        invalidatePrefix("/api/v2/elements");
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
      } else {
        await createNote({ notes: data.notes, serviceCategoryId: data.serviceCategoryId });
        invalidatePrefix("/api/v2/notes");
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
      } else if (tab === "elements" && selectedElement !== null) {
        await updateElement(selectedElement.id, { code: data.code.toUpperCase(), name: data.name, description: data.description || null });
        invalidatePrefix("/api/v2/elements");
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
      } else if (tab === "notes" && selectedNote !== null) {
        await updateNote(selectedNote.id, { notes: data.notes, serviceCategoryId: data.serviceCategoryId });
        invalidatePrefix("/api/v2/notes");
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
    else if (tab === "elements") desc = `billing element '${item.code}'`;
    else if (tab === "service-fees") desc = "service fee rate";
    else if (tab === "service-variant-fees") desc = "service variant fee mapping";
    else if (tab === "service-variant-element-fees") desc = "service variant element fee mapping";
    else desc = "compliance note";

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
        } else if (tab === "elements") {
          await deleteElement(item.id);
          invalidatePrefix("/api/v2/elements");
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
        } else {
          await deleteNote(item.id);
          invalidatePrefix("/api/v2/notes");
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

      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/60 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><CircleDollarSign className="w-64 h-64 text-indigo-400" /></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5"><CircleDollarSign className="w-3.5 h-3.5" /> Fees & Service Guidelines</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Fees & Regulatory Notes</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">Configure system-wide administrative fees, map charges to service standards, variants, billing elements, and attach regulatory compliance notes.</p>
          </div>
          {canManage && (
            <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              <span>
                {activeTab === "fees" && "Add Fee Code"}
                {activeTab === "elements" && "Add Billing Element"}
                {activeTab === "service-fees" && "Configure Service Charge"}
                {activeTab === "service-variant-fees" && "Configure Variant Fee"}
                {activeTab === "service-variant-element-fees" && "Configure Variant Element Fee"}
                {activeTab === "notes" && "Add Regulatory Note"}
              </span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setActiveTab("fees"); setSearchTerm(""); }} className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === "fees" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}><Coins className="w-3.5 h-3.5" />Fee Catalog</button>
          <button onClick={() => { setActiveTab("elements"); setSearchTerm(""); }} className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === "elements" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}><Layers className="w-3.5 h-3.5" />Elements</button>
          <button onClick={() => { setActiveTab("service-fees"); setSearchTerm(""); }} className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === "service-fees" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}><Tag className="w-3.5 h-3.5" />Service Fee Rates</button>
          <button onClick={() => { setActiveTab("service-variant-fees"); setSearchTerm(""); }} className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === "service-variant-fees" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}><Scale className="w-3.5 h-3.5" />Variant Fees</button>
          <button onClick={() => { setActiveTab("service-variant-element-fees"); setSearchTerm(""); }} className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === "service-variant-element-fees" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}><Blocks className="w-3.5 h-3.5" />Variant Element Fees</button>
          <button onClick={() => { setActiveTab("notes"); setSearchTerm(""); }} className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${activeTab === "notes" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}><BookOpen className="w-3.5 h-3.5" />Service Notes</button>
        </div>
        <div className="relative w-full xl:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input type="text" placeholder="Search configurations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        </div>
      </div>

      <div className="animate-fade-in">
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
        {activeTab === "elements" && (
          <ElementsTable 
            elements={elements} 
            totalCount={elementsTotalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            loading={loadingElements} 
            canManage={canManage} 
            onEdit={(elem) => { setSelectedElement(elem); setIsEditOpen(true); }} 
            onDelete={(elem) => handleDeleteRequest("elements", elem)} 
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
        {activeTab === "notes" && (
          <NotesTable 
            notes={notes} 
            totalCount={notesTotalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            categories={categories}
            loading={loadingNotes} 
            canManage={canManage} 
            onEdit={(n) => { setSelectedNote(n); setIsEditOpen(true); }} 
            onDelete={(n) => handleDeleteRequest("notes", n)} 
          />
        )}
      </div>

      <CreateRecordDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        activeTab={activeTab} 
        fees={fees} 
        elements={elements}
        services={services}
        categories={categories}
        onSubmit={handleCreateSubmit} 
      />
      <EditRecordDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        activeTab={activeTab} 
        fees={fees} 
        elements={elements}
        services={services}
        categories={categories}
        selectedFee={selectedFee} 
        selectedServiceFee={selectedServiceFee} 
        selectedNote={selectedNote} 
        selectedElement={selectedElement}
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
