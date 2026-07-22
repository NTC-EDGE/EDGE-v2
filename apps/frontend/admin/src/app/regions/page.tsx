"use client";

import { useState } from "react";
import { Plus, MapPin, Loader2, Search, CheckCircle2 } from "lucide-react";
import { useRegionService } from "@/services/regionService";
import { useProvinceService } from "@/services/provinceService";
import { Button } from "@/components/ui/button";
import { RegionsTable } from "@/components/geographics/RegionsTable";
import { CreateRegionDialog, EditRegionDialog } from "@/components/geographics/RegionDialogs";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { Region } from "@edge/api";

type FilterType = "all" | "active" | "inactive";

interface ConfirmConfig {
  title: string;
  description: string;
  actionType: "delete" | "toggle-status";
  payload: any;
}

export default function RegionsPage() {
  const { useRegions, createRegion, updateRegion, deleteRegion } = useRegionService();
  const { useProvinces } = useProvinceService();

  const { data: regionsResponse, isLoading, mutate, error } = useRegions();
  const regions = regionsResponse?.data ?? [];

  // Load provinces to check references for deletion prevention
  const { data: provincesResponse } = useProvinces();
  const provinces = provincesResponse?.data ?? [];

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Modal Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  // Confirmation States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const hasProvinces = (regionId: string) => {
    return provinces.some((p) => p.regionId === regionId);
  };

  // Filtered list
  const filteredRegions = regions.filter((region) => {
    const matchesSearch =
      region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      region.code.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === "active") return matchesSearch && region.isActive;
    if (activeFilter === "inactive") return matchesSearch && !region.isActive;
    return matchesSearch;
  });

  const handleCreateSubmit = async (data: { code: string; name: string }): Promise<void> => {
    const res = await createRegion({ code: data.code.toUpperCase(), name: data.name });
    if (res.succeeded) {
      setIsCreateOpen(false);
      mutate();
      showToast("Region registered successfully!");
    } else {
      throw new Error(res.message || "Failed to register region.");
    }
  };

  const handleEditSubmit = async (id: string, data: { code: string; name: string }): Promise<void> => {
    const current = regions.find((r) => r.id === id);
    const res = await updateRegion(id, {
      id,
      code: data.code.toUpperCase(),
      name: data.name,
      isActive: current?.isActive ?? true,
    });
    if (res.succeeded) {
      setIsEditOpen(false);
      mutate();
      showToast("Region details updated successfully!");
    } else {
      throw new Error(res.message || "Failed to update region.");
    }
  };

  const handleDeleteRequest = (item: Region) => {
    setConfirmConfig({
      title: "Confirm Deletion",
      description: `Are you sure you want to permanently delete region '${item.name}'? This action cannot be undone.`,
      actionType: "delete",
      payload: { item },
    });
    setConfirmOpen(true);
  };

  const handleToggleStatusRequest = (item: Region) => {
    const newStatus = item.isActive !== false ? false : true;
    setConfirmConfig({
      title: "Confirm Status Change",
      description: `Are you sure you want to set the status of region '${item.name}' to ${newStatus ? "ACTIVE" : "INACTIVE"}?`,
      actionType: "toggle-status",
      payload: { item, newStatus },
    });
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (confirmConfig === null) return;
    setIsProcessing(true);
    const { actionType, payload } = confirmConfig;

    try {
      if (actionType === "delete") {
        const { item } = payload;
        const res = await deleteRegion(item.id);
        if (res.succeeded) {
          mutate();
          showToast(`Region '${item.name}' has been deleted.`);
        } else {
          showToast(res.message || "Failed to delete region.");
        }
      } 
      else if (actionType === "toggle-status") {
        const { item, newStatus } = payload;
        const res = await updateRegion(item.id, {
          id: item.id,
          code: item.code,
          name: item.name,
          isActive: newStatus,
        });
        if (res.succeeded) {
          mutate();
          showToast(`Region '${item.code}' status updated to ${newStatus ? "Active" : "Inactive"}.`);
        } else {
          showToast(res.message || "Failed to toggle status.");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred executing this operation.");
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

      {/* Header section */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/60 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><MapPin className="w-64 h-64 text-indigo-400" /></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Regions Directory</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">Configure primary administrative regions for geographic reference mapping.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Add New Region</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex gap-2">
          <button onClick={() => setActiveFilter("all")} className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${activeFilter === "all" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}>All Regions</button>
          <button onClick={() => setActiveFilter("active")} className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${activeFilter === "active" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}>Active Only</button>
          <button onClick={() => setActiveFilter("inactive")} className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${activeFilter === "inactive" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}>Inactive Only</button>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input type="text" placeholder="Search regions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        </div>
      </div>

      {/* Error state */}
      {!!error && (
        <div className="text-center py-16 px-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-sm font-semibold text-red-500">Failed to load regions database.</p>
          <Button onClick={() => mutate()} className="mt-4" size="sm" variant="outline">Retry</Button>
        </div>
      )}

      {/* Table grid */}
      {!error && (
        <div className="animate-fade-in">
          <RegionsTable
            regions={filteredRegions}
            loading={isLoading}
            canManage={true}
            searchTerm={searchTerm}
            hasProvinces={hasProvinces}
            onEdit={(r) => { setSelectedRegion(r); setIsEditOpen(true); }}
            onDelete={handleDeleteRequest}
            onToggleStatus={handleToggleStatusRequest}
          />
        </div>
      )}

      <CreateRegionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSubmit={handleCreateSubmit} />
      <EditRegionDialog open={isEditOpen} onOpenChange={setIsEditOpen} selectedRegion={selectedRegion} onSubmit={handleEditSubmit} />

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
