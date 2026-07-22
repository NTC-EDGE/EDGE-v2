"use client";

import React, { useState } from "react";
import { CircleDollarSign, Plus, Search, Coins, Tag, BookOpen, CheckCircle2 } from "lucide-react";
import { useFeesNotesService } from "@/services/feesNotesService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { Fee, ServiceFee, Note } from "@edge/api";
import { Button } from "@/components/ui/button";
import { FeesTable } from "@/components/fees-notes/FeesTable";
import { ServiceFeesTable } from "@/components/fees-notes/ServiceFeesTable";
import { NotesTable } from "@/components/fees-notes/NotesTable";
import { CreateRecordDialog } from "@/components/fees-notes/CreateRecordDialog";
import { EditRecordDialog } from "@/components/fees-notes/EditRecordDialog";
import { DeleteRecordDialog } from "@/components/fees-notes/DeleteRecordDialog";

type TabType = "fees" | "service-fees" | "notes";

export default function FeesNotesPage() {
  const { isSystemAdmin } = useAdminScope();
  const canManage = isSystemAdmin;

  const {
    useFees, createFee, updateFee, deleteFee,
    useServiceFees, createServiceFee, updateServiceFee, deleteServiceFee,
    useNotes, createNote, updateNote, deleteNote
  } = useFeesNotesService();

  const [activeTab, setActiveTab] = useState<TabType>("fees");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [selectedServiceFee, setSelectedServiceFee] = useState<ServiceFee | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { data: fees = [], mutate: mutateFees, isLoading: loadingFees } = useFees();
  const { data: serviceFees = [], mutate: mutateServiceFees, isLoading: loadingSFees } = useServiceFees();
  const { data: notes = [], mutate: mutateNotes, isLoading: loadingNotes } = useNotes();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCreateSubmit = async (tab: TabType, data: {
    code: string; name: string; description: string;
    serviceId: string; feeId: string; amount: number;
    notes: string; serviceCategoryId: string;
  }) => {
    if (tab === "fees") {
      await createFee({ code: data.code.toUpperCase(), name: data.name, description: data.description || null });
      await mutateFees();
    } else if (tab === "service-fees") {
      await createServiceFee({ serviceId: data.serviceId, feeId: data.feeId, amount: data.amount });
      await mutateServiceFees();
    } else {
      await createNote({ notes: data.notes, serviceCategoryId: data.serviceCategoryId });
      await mutateNotes();
    }
    showToast("Record successfully created!");
  };

  const handleEditSubmit = async (tab: TabType, data: {
    code: string; name: string; description: string;
    serviceId: string; feeId: string; amount: number;
    notes: string; serviceCategoryId: string;
  }) => {
    if (tab === "fees" && selectedFee !== null) {
      await updateFee(selectedFee.id, { code: data.code.toUpperCase(), name: data.name, description: data.description || null });
      await mutateFees();
      await mutateServiceFees();
    } else if (tab === "service-fees" && selectedServiceFee !== null) {
      await updateServiceFee(selectedServiceFee.id, { serviceId: data.serviceId, feeId: data.feeId, amount: data.amount });
      await mutateServiceFees();
    } else if (tab === "notes" && selectedNote !== null) {
      await updateNote(selectedNote.id, { notes: data.notes, serviceCategoryId: data.serviceCategoryId });
      await mutateNotes();
    }
    showToast("Record updated successfully!");
  };

  const handleDeleteConfirm = async () => {
    if (activeTab === "fees" && selectedFee !== null) {
      await deleteFee(selectedFee.id);
      await mutateFees();
      await mutateServiceFees();
    } else if (activeTab === "service-fees" && selectedServiceFee !== null) {
      await deleteServiceFee(selectedServiceFee.id);
      await mutateServiceFees();
    } else if (activeTab === "notes" && selectedNote !== null) {
      await deleteNote(selectedNote.id);
      await mutateNotes();
    }
    showToast("Record deleted.");
  };

  return (
    <div className="space-y-6">
      {toastMsg !== null && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between shadow-xl">
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
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">Configure system-wide administrative fees, map charges to service standards, and attach regulatory compliance notes.</p>
          </div>
          {canManage && (
            <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              <span>{activeTab === "fees" && "Add New Fee Code"}{activeTab === "service-fees" && "Configure Service Charge"}{activeTab === "notes" && "Add Regulatory Note"}</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex gap-2">
          <button onClick={() => { setActiveTab("fees"); setSearchTerm(""); }} className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 ${activeTab === "fees" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}><Coins className="w-3.5 h-3.5" />Fee Catalog</button>
          <button onClick={() => { setActiveTab("service-fees"); setSearchTerm(""); }} className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 ${activeTab === "service-fees" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}><Tag className="w-3.5 h-3.5" />Service Fee Rates</button>
          <button onClick={() => { setActiveTab("notes"); setSearchTerm(""); }} className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 ${activeTab === "notes" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}><BookOpen className="w-3.5 h-3.5" />Service Notes</button>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input type="text" placeholder="Search configurations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" />
        </div>
      </div>

      <div className="animate-fade-in">
        {activeTab === "fees" && <FeesTable fees={fees} loading={loadingFees} canManage={canManage} searchTerm={searchTerm} onEdit={(f) => { setSelectedFee(f); setIsEditOpen(true); }} onDelete={(f) => { setSelectedFee(f); setIsDeleteOpen(true); }} />}
        {activeTab === "service-fees" && <ServiceFeesTable serviceFees={serviceFees} fees={fees} loading={loadingSFees} canManage={canManage} searchTerm={searchTerm} onEdit={(sf) => { setSelectedServiceFee(sf); setIsEditOpen(true); }} onDelete={(sf) => { setSelectedServiceFee(sf); setIsDeleteOpen(true); }} />}
        {activeTab === "notes" && <NotesTable notes={notes} loading={loadingNotes} canManage={canManage} searchTerm={searchTerm} onEdit={(n) => { setSelectedNote(n); setIsEditOpen(true); }} onDelete={(n) => { setSelectedNote(n); setIsDeleteOpen(true); }} />}
      </div>

      <CreateRecordDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} activeTab={activeTab} fees={fees} onSubmit={handleCreateSubmit} />
      <EditRecordDialog open={isEditOpen} onOpenChange={setIsEditOpen} activeTab={activeTab} fees={fees} selectedFee={selectedFee} selectedServiceFee={selectedServiceFee} selectedNote={selectedNote} onSubmit={handleEditSubmit} />
      <DeleteRecordDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} activeTab={activeTab} selectedFee={selectedFee} selectedServiceFee={selectedServiceFee} selectedNote={selectedNote} onConfirm={handleDeleteConfirm} />
    </div>
  );
}
