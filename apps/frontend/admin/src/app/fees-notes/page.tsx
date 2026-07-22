"use client";

import React, { useState } from "react";
import {
  CircleDollarSign,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Coins,
  Tag,
  BookOpen,
  CheckCircle2,
  Building2,
  MapPin
} from "lucide-react";
import {
  useFeesNotesService,
  MOCK_SERVICES,
  MOCK_CATEGORIES
} from "@/services/feesNotesService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { Fee, ServiceFee, Note } from "@edge/api";
import { Button } from "@/components/ui/button";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type TabType = "fees" | "service-fees" | "notes";

export default function FeesNotesPage() {
  const { isSystemAdmin } = useAdminScope();
  const canManage = isSystemAdmin; // Full access for System Admin

  const {
    useFees,
    createFee,
    updateFee,
    deleteFee,
    useServiceFees,
    createServiceFee,
    updateServiceFee,
    deleteServiceFee,
    useNotes,
    createNote,
    updateNote,
    deleteNote
  } = useFeesNotesService();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<TabType>("fees");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [feesPage, setFeesPage] = useState(1);
  const [feesPageSize, setFeesPageSize] = useState(10);

  const [serviceFeesPage, setServiceFeesPage] = useState(1);
  const [serviceFeesPageSize, setServiceFeesPageSize] = useState(10);

  const [notesPage, setNotesPage] = useState(1);
  const [notesPageSize, setNotesPageSize] = useState(10);

  // Data fetching
  const { data: fees = [], mutate: mutateFees, isLoading: loadingFees } = useFees();
  const { data: serviceFees = [], mutate: mutateServiceFees, isLoading: loadingServiceFees } = useServiceFees();
  const { data: notes = [], mutate: mutateNotes, isLoading: loadingNotes } = useNotes();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected item states
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [selectedServiceFee, setSelectedServiceFee] = useState<ServiceFee | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Feedback states
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [feeForm, setFeeForm] = useState({
    code: "",
    name: "",
    description: "",
  });

  const [serviceFeeForm, setServiceFeeForm] = useState({
    serviceId: MOCK_SERVICES[0]?.id ?? "",
    feeId: fees[0]?.id ?? "",
    amount: 0,
  });

  const [noteForm, setNoteForm] = useState({
    notes: "",
    serviceCategoryId: MOCK_CATEGORIES[0]?.id ?? "",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Helper to open create modal
  const handleOpenCreate = () => {
    setErrorMsg(null);
    if (activeTab === "fees") {
      setFeeForm({ code: "", name: "", description: "" });
    } else if (activeTab === "service-fees") {
      setServiceFeeForm({
        serviceId: MOCK_SERVICES[0]?.id ?? "",
        feeId: fees[0]?.id ?? "",
        amount: 0,
      });
    } else {
      setNoteForm({
        notes: "",
        serviceCategoryId: MOCK_CATEGORIES[0]?.id ?? "",
      });
    }
    setIsCreateOpen(true);
  };

  // Helper to open edit modal
  const handleOpenEdit = (item: Fee | ServiceFee | Note) => {
    setErrorMsg(null);
    if (activeTab === "fees") {
      const fee = item as Fee;
      setSelectedFee(fee);
      setFeeForm({
        code: fee.code,
        name: fee.name,
        description: fee.description ?? "",
      });
    } else if (activeTab === "service-fees") {
      const sf = item as ServiceFee;
      setSelectedServiceFee(sf);
      setServiceFeeForm({
        serviceId: sf.serviceId,
        feeId: sf.feeId,
        amount: sf.amount,
      });
    } else {
      const n = item as Note;
      setSelectedNote(n);
      setNoteForm({
        notes: n.notes,
        serviceCategoryId: n.serviceCategoryId,
      });
    }
    setIsEditOpen(true);
  };

  // Helper to open delete confirmation modal
  const handleOpenDelete = (item: Fee | ServiceFee | Note) => {
    setErrorMsg(null);
    if (activeTab === "fees") {
      setSelectedFee(item as Fee);
    } else if (activeTab === "service-fees") {
      setSelectedServiceFee(item as ServiceFee);
    } else {
      setSelectedNote(item as Note);
    }
    setIsDeleteOpen(true);
  };

  // Create Submission Handler
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (activeTab === "fees") {
        await createFee({
          code: feeForm.code.trim().toUpperCase(),
          name: feeForm.name.trim(),
          description: feeForm.description.trim() || null,
        });
        await mutateFees();
        showToast(`Fee "${feeForm.code}" created successfully!`);
      } else if (activeTab === "service-fees") {
        if (!serviceFeeForm.feeId) {
          setErrorMsg("Please select a Fee to map.");
          setSubmitting(false);
          return;
        }
        await createServiceFee({
          serviceId: serviceFeeForm.serviceId,
          feeId: serviceFeeForm.feeId,
          amount: Number(serviceFeeForm.amount),
        });
        await mutateServiceFees();
        showToast("Service Fee mapping successfully created!");
      } else {
        await createNote({
          notes: noteForm.notes.trim(),
          serviceCategoryId: noteForm.serviceCategoryId,
        });
        await mutateNotes();
        showToast("Regulatory Note successfully added!");
      }
      setIsCreateOpen(false);
    } catch (err: unknown) {
      setErrorMsg("Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Submission Handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (activeTab === "fees" && selectedFee !== null) {
        await updateFee(selectedFee.id, {
          code: feeForm.code.trim().toUpperCase(),
          name: feeForm.name.trim(),
          description: feeForm.description.trim() || null,
        });
        await mutateFees();
        await mutateServiceFees(); // Re-fetch mapped service fees to get updated codes/names
        showToast(`Fee "${feeForm.code}" updated successfully!`);
      } else if (activeTab === "service-fees" && selectedServiceFee !== null) {
        await updateServiceFee(selectedServiceFee.id, {
          serviceId: serviceFeeForm.serviceId,
          feeId: serviceFeeForm.feeId,
          amount: Number(serviceFeeForm.amount),
        });
        await mutateServiceFees();
        showToast("Service Fee mapping updated successfully!");
      } else if (activeTab === "notes" && selectedNote !== null) {
        await updateNote(selectedNote.id, {
          notes: noteForm.notes.trim(),
          serviceCategoryId: noteForm.serviceCategoryId,
        });
        await mutateNotes();
        showToast("Regulatory Note updated successfully!");
      }
      setIsEditOpen(false);
    } catch (err: unknown) {
      setErrorMsg("Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Confirmation Handler
  const handleDeleteConfirm = async () => {
    setSubmitting(true);
    try {
      if (activeTab === "fees" && selectedFee !== null) {
        await deleteFee(selectedFee.id);
        await mutateFees();
        await mutateServiceFees(); // cascade deletions
        showToast(`Fee "${selectedFee.code}" deleted.`);
      } else if (activeTab === "service-fees" && selectedServiceFee !== null) {
        await deleteServiceFee(selectedServiceFee.id);
        await mutateServiceFees();
        showToast("Service Fee mapping deleted.");
      } else if (activeTab === "notes" && selectedNote !== null) {
        await deleteNote(selectedNote.id);
        await mutateNotes();
        showToast("Regulatory Note removed.");
      }
      setIsDeleteOpen(false);
    } catch (err: unknown) {
      setErrorMsg("Deletion failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Dataset filtering based on search
  const filteredFees = fees.filter(
    (f) =>
      f.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const filteredServiceFees = serviceFees.filter((sf) => {
    const serviceName = MOCK_SERVICES.find((s) => s.id === sf.serviceId)?.name ?? "";
    const fee = fees.find((f) => f.id === sf.feeId);
    const feeName = fee?.name ?? "";
    const feeCode = fee?.code ?? "";

    return (
      serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sf.amount.toString().includes(searchTerm)
    );
  });

  const filteredNotes = notes.filter((n) => {
    const categoryName = MOCK_CATEGORIES.find((c) => c.id === n.serviceCategoryId)?.name ?? "";
    return (
      n.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Paginated Slices
  const paginatedFees = filteredFees.slice(
    (feesPage - 1) * feesPageSize,
    feesPage * feesPageSize
  );

  const paginatedServiceFees = filteredServiceFees.slice(
    (serviceFeesPage - 1) * serviceFeesPageSize,
    serviceFeesPage * serviceFeesPageSize
  );

  const paginatedNotes = filteredNotes.slice(
    (notesPage - 1) * notesPageSize,
    notesPage * notesPageSize
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg !== null && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between shadow-xl animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/60 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <CircleDollarSign className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5">
                <CircleDollarSign className="w-3.5 h-3.5" /> Fees & Service Guidelines
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Fees & Regulatory Notes
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Configure system-wide administrative fees, map charges to service standards, and attach regulatory compliance notes.
            </p>
          </div>

          {canManage && (
            <Button
              onClick={handleOpenCreate}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeTab === "fees" && "Add New Fee Code"}
                {activeTab === "service-fees" && "Configure Service Charge"}
                {activeTab === "notes" && "Add Regulatory Note"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Switcher and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        {/* Capsules Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab("fees");
              setSearchTerm("");
              setFeesPage(1);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "fees"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Fee Catalog
          </button>
          <button
            onClick={() => {
              setActiveTab("service-fees");
              setSearchTerm("");
              setServiceFeesPage(1);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "service-fees"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Service Fee Rates
          </button>
          <button
            onClick={() => {
              setActiveTab("notes");
              setSearchTerm("");
              setNotesPage(1);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "notes"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Service Notes
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search configurations..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setFeesPage(1);
              setServiceFeesPage(1);
              setNotesPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Main Data Tables */}
      <div className="animate-fade-in">
        {/* --- FEE CATALOG TAB --- */}
        {activeTab === "fees" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold tracking-wider">
                    <th className="px-6 py-4">Fee Code</th>
                    <th className="px-6 py-4">Fee Name</th>
                    <th className="px-6 py-4">Description</th>
                    {canManage && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {loadingFees ? (
                    <tr>
                      <td colSpan={canManage ? 4 : 3} className="px-6 py-12 text-center text-slate-400">
                        <span>Loading fees catalog...</span>
                      </td>
                    </tr>
                  ) : filteredFees.length === 0 ? (
                    <tr>
                      <td colSpan={canManage ? 4 : 3} className="px-6 py-12 text-center text-slate-400">
                        <Coins className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                        <p className="font-semibold text-slate-300">No fees configured</p>
                        <p className="text-xs text-slate-500">There are no administrative fees registered in the catalog yet.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedFees.map((item) => {
                      const menuItems: ActionMenuItem[] = [
                        {
                          label: "Edit Fee Details",
                          icon: Edit2,
                          onClick: () => handleOpenEdit(item),
                        },
                        {
                          label: "Delete Fee",
                          icon: Trash2,
                          onClick: () => handleOpenDelete(item),
                          variant: "destructive",
                        },
                      ];

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                          <td className="px-6 py-4">
                            <span className="font-mono text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                              {item.code}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-white">{item.name}</td>
                          <td className="px-6 py-4 text-slate-400 text-xs">{item.description ?? "—"}</td>
                          {canManage && (
                            <td className="px-6 py-4 text-right">
                              <ActionMenu items={menuItems} />
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredFees.length > 0 && (
              <Pagination
                currentPage={feesPage}
                totalItems={filteredFees.length}
                pageSize={feesPageSize}
                onPageChange={setFeesPage}
                onPageSizeChange={(sz) => {
                  setFeesPageSize(sz);
                  setFeesPage(1);
                }}
              />
            )}
          </div>
        )}

        {/* --- SERVICE FEES TAB --- */}
        {activeTab === "service-fees" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold tracking-wider">
                    <th className="px-6 py-4">Service Standard</th>
                    <th className="px-6 py-4">Mapped Fee</th>
                    <th className="px-6 py-4">Charge Amount</th>
                    {canManage && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {loadingServiceFees ? (
                    <tr>
                      <td colSpan={canManage ? 4 : 3} className="px-6 py-12 text-center text-slate-400">
                        <span>Loading service fees catalog...</span>
                      </td>
                    </tr>
                  ) : filteredServiceFees.length === 0 ? (
                    <tr>
                      <td colSpan={canManage ? 4 : 3} className="px-6 py-12 text-center text-slate-400">
                        <Tag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                        <p className="font-semibold text-slate-300">No service fees configured</p>
                        <p className="text-xs text-slate-500">No fees have been mapped to services catalog items yet.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedServiceFees.map((item) => {
                      const serviceName = MOCK_SERVICES.find((s) => s.id === item.serviceId)?.name ?? "Unknown Service";
                      const fee = fees.find((f) => f.id === item.feeId);
                      const menuItems: ActionMenuItem[] = [
                        {
                          label: "Modify Charge",
                          icon: Edit2,
                          onClick: () => handleOpenEdit(item),
                        },
                        {
                          label: "Remove Charge Rule",
                          icon: Trash2,
                          onClick: () => handleOpenDelete(item),
                          variant: "destructive",
                        },
                      ];

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                          <td className="px-6 py-4 font-semibold text-slate-200">{serviceName}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-mono text-emerald-400">{fee?.code ?? "UNKNOWN"}</span>
                              <span className="text-xs text-slate-400">{fee?.name ?? "Unknown Fee"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-white text-sm bg-slate-950/70 border border-slate-800 px-3 py-1 rounded-lg">
                              ₱{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>
                          {canManage && (
                            <td className="px-6 py-4 text-right">
                              <ActionMenu items={menuItems} />
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredServiceFees.length > 0 && (
              <Pagination
                currentPage={serviceFeesPage}
                totalItems={filteredServiceFees.length}
                pageSize={serviceFeesPageSize}
                onPageChange={setServiceFeesPage}
                onPageSizeChange={(sz) => {
                  setServiceFeesPageSize(sz);
                  setServiceFeesPage(1);
                }}
              />
            )}
          </div>
        )}

        {/* --- SERVICE NOTES TAB --- */}
        {activeTab === "notes" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold tracking-wider">
                    <th className="px-6 py-4">Service Category Scope</th>
                    <th className="px-6 py-4">Regulatory Guideline Notes</th>
                    {canManage && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {loadingNotes ? (
                    <tr>
                      <td colSpan={canManage ? 3 : 2} className="px-6 py-12 text-center text-slate-400">
                        <span>Loading regulatory notes...</span>
                      </td>
                    </tr>
                  ) : filteredNotes.length === 0 ? (
                    <tr>
                      <td colSpan={canManage ? 3 : 2} className="px-6 py-12 text-center text-slate-400">
                        <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                        <p className="font-semibold text-slate-300">No regulatory notes</p>
                        <p className="text-xs text-slate-500">There are no procedural compliance notes configured for service categories.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedNotes.map((item) => {
                      const categoryName = MOCK_CATEGORIES.find((c) => c.id === item.serviceCategoryId)?.name ?? "Global";
                      const menuItems: ActionMenuItem[] = [
                        {
                          label: "Edit Guideline Note",
                          icon: Edit2,
                          onClick: () => handleOpenEdit(item),
                        },
                        {
                          label: "Remove Note",
                          icon: Trash2,
                          onClick: () => handleOpenDelete(item),
                          variant: "destructive",
                        },
                      ];

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                          <td className="px-6 py-4">
                            <span className="font-semibold text-indigo-300 text-xs bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                              {categoryName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-slate-300 text-xs leading-relaxed max-w-xl whitespace-pre-wrap">{item.notes}</p>
                          </td>
                          {canManage && (
                            <td className="px-6 py-4 text-right">
                              <ActionMenu items={menuItems} />
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredNotes.length > 0 && (
              <Pagination
                currentPage={notesPage}
                totalItems={filteredNotes.length}
                pageSize={notesPageSize}
                onPageChange={setNotesPage}
                onPageSizeChange={(sz) => {
                  setNotesPageSize(sz);
                  setNotesPage(1);
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* --- CREATE DIALOG --- */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              {activeTab === "fees" && "Register New Fee Code"}
              {activeTab === "service-fees" && "Configure Service Fee"}
              {activeTab === "notes" && "Add Guideline Instruction"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Create and store new configurations. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            {errorMsg !== null && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {activeTab === "fees" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Fee Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FILING_FEE"
                    value={feeForm.code}
                    onChange={(e) => setFeeForm({ ...feeForm, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Fee Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Licensing Application Filing Fee"
                    value={feeForm.name}
                    onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
                  <textarea
                    placeholder="Provide context about what this fee applies to."
                    value={feeForm.description}
                    onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                  />
                </div>
              </>
            )}

            {activeTab === "service-fees" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Service Standard *</label>
                  <select
                    value={serviceFeeForm.serviceId}
                    onChange={(e) => setServiceFeeForm({ ...serviceFeeForm, serviceId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {MOCK_SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Mapped Fee Code *</label>
                  <select
                    value={serviceFeeForm.feeId}
                    onChange={(e) => setServiceFeeForm({ ...serviceFeeForm, feeId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Select Fee Code --</option>
                    {fees.map((f) => (
                      <option key={f.id} value={f.id}>
                        [{f.code}] {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold pointer-events-none">₱</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={serviceFeeForm.amount}
                      onChange={(e) => setServiceFeeForm({ ...serviceFeeForm, amount: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === "notes" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Service Category Scope *</label>
                  <select
                    value={noteForm.serviceCategoryId}
                    onChange={(e) => setNoteForm({ ...noteForm, serviceCategoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {MOCK_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Guideline Instruction Text *</label>
                  <textarea
                    required
                    placeholder="Enter compliance rules, document requirements, or general process instructions..."
                    value={noteForm.notes}
                    onChange={(e) => setNoteForm({ ...noteForm, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                  />
                </div>
              </>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg"
              >
                {submitting ? "Saving..." : "Create Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- EDIT DIALOG --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              {activeTab === "fees" && "Edit Fee Code details"}
              {activeTab === "service-fees" && "Modify Mapped Service Fee"}
              {activeTab === "notes" && "Update Guideline Instruction"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Modify the configuration parameters. Saved changes update instantly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            {errorMsg !== null && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {activeTab === "fees" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Fee Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FILING_FEE"
                    value={feeForm.code}
                    onChange={(e) => setFeeForm({ ...feeForm, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Fee Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Licensing Application Filing Fee"
                    value={feeForm.name}
                    onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
                  <textarea
                    placeholder="Provide context about what this fee applies to."
                    value={feeForm.description}
                    onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                  />
                </div>
              </>
            )}

            {activeTab === "service-fees" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Service Standard *</label>
                  <select
                    value={serviceFeeForm.serviceId}
                    onChange={(e) => setServiceFeeForm({ ...serviceFeeForm, serviceId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {MOCK_SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Mapped Fee Code *</label>
                  <select
                    value={serviceFeeForm.feeId}
                    onChange={(e) => setServiceFeeForm({ ...serviceFeeForm, feeId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Select Fee Code --</option>
                    {fees.map((f) => (
                      <option key={f.id} value={f.id}>
                        [{f.code}] {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold pointer-events-none">₱</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={serviceFeeForm.amount}
                      onChange={(e) => setServiceFeeForm({ ...serviceFeeForm, amount: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === "notes" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Service Category Scope *</label>
                  <select
                    value={noteForm.serviceCategoryId}
                    onChange={(e) => setNoteForm({ ...noteForm, serviceCategoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {MOCK_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Guideline Instruction Text *</label>
                  <textarea
                    required
                    placeholder="Enter compliance rules, document requirements, or general process instructions..."
                    value={noteForm.notes}
                    onChange={(e) => setNoteForm({ ...noteForm, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                  />
                </div>
              </>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg"
              >
                {submitting ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- DELETE DIALOG --- */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-400">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Are you sure you want to permanently delete this configuration? This action is irreversible.
            </DialogDescription>
          </DialogHeader>

          {activeTab === "fees" && selectedFee !== null && (
            <div className="py-2 space-y-2">
              <p className="text-sm">
                Deleting fee code <strong className="text-white">{selectedFee.code}</strong> (
                {selectedFee.name}) will also cascade-delete any Service Fee charge mappings associated
                with it.
              </p>
            </div>
          )}

          {activeTab === "service-fees" && selectedServiceFee !== null && (
            <div className="py-2 space-y-2">
              <p className="text-sm">
                Are you sure you want to delete the mapping fee rule for:
                <br />
                <strong className="text-white">
                  {MOCK_SERVICES.find((s) => s.id === selectedServiceFee.serviceId)?.name}
                </strong>
                ?
              </p>
            </div>
          )}

          {activeTab === "notes" && selectedNote !== null && (
            <div className="py-2 space-y-2">
              <p className="text-sm">
                Are you sure you want to delete the regulatory guideline for category:
                <br />
                <strong className="text-indigo-300">
                  {MOCK_CATEGORIES.find((c) => c.id === selectedNote.serviceCategoryId)?.name}
                </strong>
                ?
              </p>
            </div>
          )}

          {errorMsg !== null && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDeleteOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={handleDeleteConfirm}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg"
            >
              {submitting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
