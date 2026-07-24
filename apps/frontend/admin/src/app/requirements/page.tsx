"use client";

import React, { useState } from "react";
import { ClipboardList, Plus, Search, Link2, CheckCircle2, FileText } from "lucide-react";
import { useRequirementsService } from "@/services/requirementsService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { Requirement, ServiceVariantRequirement } from "@edge/api";
import { Button } from "@/components/ui/button";
import { RequirementsTable } from "@/components/requirements/RequirementsTable";
import { ServiceVariantRequirementsTable } from "@/components/requirements/ServiceVariantRequirementsTable";
import { CreateRequirementDialog } from "@/components/requirements/CreateRequirementDialog";
import { EditRequirementDialog } from "@/components/requirements/EditRequirementDialog";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";

type TabType = "requirements" | "service-requirements";

interface ConfirmConfig {
  title: string;
  description: string;
  actionType: "create" | "edit" | "delete";
  payload: {
    tab: TabType;
    item: Requirement | ServiceVariantRequirement;
  };
}

export default function RequirementsPage() {
  const { isSystemAdmin } = useAdminScope();
  const canManage = isSystemAdmin;

  const {
    useRequirements,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    useServiceVariantRequirements,
    createServiceVariantRequirement,
    updateServiceVariantRequirement,
    deleteServiceVariantRequirement,
  } = useRequirementsService();

  const [activeTab, setActiveTab] = useState<TabType>("requirements");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [selectedSvr, setSelectedSvr] = useState<ServiceVariantRequirement | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Confirmation States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: requirements = [], mutate: mutateReqs, isLoading: loadingReqs } = useRequirements();
  const { data: serviceVariantRequirements = [], mutate: mutateSvr, isLoading: loadingSvr } = useServiceVariantRequirements();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCreateSubmit = async (
    tab: TabType,
    data: {
      name: string;
      description: string;
      serviceVariantId: string;
      requirementsList: { requirementId: string; applicationTypeKey: string | null; isRequired: boolean }[];
    }
  ): Promise<void> => {
    try {
      if (tab === "requirements") {
        await createRequirement({
          name: data.name,
          description: data.description !== "" ? data.description : null,
        });
        await mutateReqs();
      } else {
        await createServiceVariantRequirement({
          serviceVariantId: data.serviceVariantId,
          requirements: data.requirementsList,
        });
        await mutateSvr();
      }
      setIsCreateOpen(false);
      showToast("Requirement registered successfully!");
    } catch (err: unknown) {
      console.error(err);
      showToast("An error occurred while registering the requirement.");
    }
  };

  const handleEditSubmit = async (
    tab: TabType,
    data: {
      name: string;
      description: string;
      requirementId: string;
      serviceVariantId: string;
      applicationTypeKey: string | null;
      isRequired: boolean;
    }
  ): Promise<void> => {
    try {
      if (tab === "requirements" && selectedReq !== null) {
        await updateRequirement(selectedReq.id, {
          name: data.name,
          description: data.description !== "" ? data.description : null,
        });
        await mutateReqs();
        await mutateSvr();
      } else if (tab === "service-requirements" && selectedSvr !== null) {
        await updateServiceVariantRequirement(selectedSvr.id, {
          requirementId: data.requirementId,
          serviceVariantId: data.serviceVariantId,
          applicationTypeKey: data.applicationTypeKey,
          isRequired: data.isRequired,
        });
        await mutateSvr();
      }
      setIsEditOpen(false);
      showToast("Requirement updated successfully!");
    } catch (err: unknown) {
      console.error(err);
      showToast("An error occurred while updating the requirement.");
    }
  };

  const handleDeleteRequest = (tab: TabType, item: Requirement | ServiceVariantRequirement) => {
    const label =
      tab === "requirements" && "name" in item
        ? `requirement catalog entry '${item.name}'`
        : "service requirement mapping";
    setConfirmConfig({
      title: "Confirm Deletion",
      description: `Are you sure you want to permanently delete this ${label}? This action cannot be undone.`,
      actionType: "delete",
      payload: { tab, item },
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
        if (tab === "requirements") {
          await deleteRequirement(item.id);
          await mutateReqs();
          await mutateSvr();
        } else {
          await deleteServiceVariantRequirement(item.id);
          await mutateSvr();
        }
        showToast("Record deleted successfully.");
      }
    } catch (err: unknown) {
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
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FileText className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Service Requirements Manager
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Service Requirements</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Configure system-wide master requirements and map specific criteria checklist rules to service standards and variants.
            </p>
          </div>
          {canManage && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === "requirements" ? "Add Master Requirement" : "Map Service Requirement"}</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab("requirements");
              setSearchTerm("");
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === "requirements" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" /> Requirement Catalog
          </button>
          <button
            onClick={() => {
              setActiveTab("service-requirements");
              setSearchTerm("");
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === "service-requirements" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" /> Service Mappings
          </button>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="animate-fade-in">
        {activeTab === "requirements" ? (
          <RequirementsTable
            requirements={requirements}
            serviceVariantRequirements={serviceVariantRequirements}
            loading={loadingReqs}
            canManage={canManage}
            searchTerm={searchTerm}
            onEdit={(req) => {
              setSelectedReq(req);
              setIsEditOpen(true);
            }}
            onDelete={(req) => handleDeleteRequest("requirements", req)}
          />
        ) : (
          <ServiceVariantRequirementsTable
            serviceVariantRequirements={serviceVariantRequirements}
            loading={loadingSvr}
            canManage={canManage}
            searchTerm={searchTerm}
            onEdit={(svr) => {
              setSelectedSvr(svr);
              setIsEditOpen(true);
            }}
            onDelete={(svr) => handleDeleteRequest("service-requirements", svr)}
          />
        )}
      </div>

      <CreateRequirementDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        activeTab={activeTab}
        requirements={requirements}
        onSubmit={handleCreateSubmit}
      />
      
      <EditRequirementDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        activeTab={activeTab}
        requirements={requirements}
        selectedRequirement={selectedReq}
        selectedSvr={selectedSvr}
        onSubmit={handleEditSubmit}
      />

      <ConfirmActionDialog
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmConfig(null);
        }}
        onConfirm={handleConfirmAction}
        title={confirmConfig?.title}
        description={confirmConfig?.description}
        loading={isProcessing}
      />
    </div>
  );
}
