"use client";

import React, { useState, useEffect, Suspense } from "react";
import { FileText, Plus, Search, Loader2, Sparkles, BookOpen, Layers } from "lucide-react";
import { useFeesService } from "@/services/feesService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { useSWRConfig } from "swr";
import { SoaNote } from "@edge/api";
import { Button } from "@/components/ui/button";
import { SoaNotesTable } from "@/components/soa-notes/SoaNotesTable";
import { SoaNoteDialog } from "@/components/soa-notes/SoaNoteDialog";
import { SoaNoteDetailsDialog } from "@/components/soa-notes/SoaNoteDetailsDialog";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { isForbiddenError, PageForbiddenState } from "@/components/PageForbiddenState";
import { ToastNotification, ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";

function SoaNotesContent() {
  const { isSystemAdmin } = useAdminScope();
  const canManage = isSystemAdmin;
  const { mutate: globalMutate } = useSWRConfig();

  const { useSoaNotes, createSoaNote, updateSoaNote, deleteSoaNote } = useFeesService();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SoaNote | null>(null);
  const [viewingNote, setViewingNote] = useState<SoaNote | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingNote, setDeletingNote] = useState<SoaNote | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const {
    data: notes = [],
    totalCount = 0,
    mutate: mutateNotes,
    isLoading: loadingNotes,
    error: errorNotes,
  } = useSoaNotes(currentPage, pageSize, searchTerm, true);

  if (isForbiddenError(errorNotes)) {
    return <PageForbiddenState />;
  }

  const handleOpenCreate = () => {
    setEditingNote(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (note: SoaNote) => {
    setEditingNote(note);
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (note: SoaNote) => {
    setDeletingNote(note);
    setConfirmOpen(true);
  };

  const handleSubmit = async (formData: { code?: string; title?: string; notes: string }) => {
    setIsSubmitting(true);
    try {
      if (editingNote) {
        await updateSoaNote(editingNote.id, {
          id: editingNote.id,
          notes: formData.notes,
          code: formData.code,
          title: formData.title,
        });
        setToast({ message: "SOA note template updated successfully.", type: "success" });
      } else {
        await createSoaNote({
          notes: formData.notes,
          code: formData.code,
          title: formData.title,
        });
        setToast({ message: "SOA note template created successfully.", type: "success" });
      }
      setIsDialogOpen(false);
      setEditingNote(null);
      await mutateNotes();
      globalMutate(
        (key: unknown) => typeof key === "string" && key.startsWith("/api/v2/soa-notes"),
        undefined,
        { revalidate: true }
      );
    } catch (err: unknown) {
      setToast({ message: getErrorMessage(err, "Failed to save SOA note template."), type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNote) return;
    setIsProcessingDelete(true);
    try {
      await deleteSoaNote(deletingNote.id);
      setToast({ message: "SOA note template deleted successfully.", type: "success" });
      setConfirmOpen(false);
      setDeletingNote(null);
      await mutateNotes();
      globalMutate(
        (key: unknown) => typeof key === "string" && key.startsWith("/api/v2/soa-notes"),
        undefined,
        { revalidate: true }
      );
    } catch (err: unknown) {
      setToast({ message: getErrorMessage(err, "Failed to delete SOA note template."), type: "error" });
    } finally {
      setIsProcessingDelete(false);
    }
  };

  return (
    <div className="space-y-6 transition-colors duration-200">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Hero Header Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/60 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FileText className="w-64 h-64 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Statement of Account Terms & Notes
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              SOA Note Templates & Terms
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Configure master templates, regulatory disclaimers, and payment instructions available when generating Statements of Account (SOA).
            </p>
          </div>

          {canManage && (
            <Button
              onClick={handleOpenCreate}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New SOA Note</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by code, title, or terms content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Active Templates:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold font-mono">
            {totalCount}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="animate-fade-in">
        <SoaNotesTable
          notes={notes}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          loading={loadingNotes}
          canManage={canManage}
          onViewDetails={(note) => setViewingNote(note)}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      {/* View Details Dialog */}
      <SoaNoteDetailsDialog
        open={Boolean(viewingNote)}
        onOpenChange={(open) => !open && setViewingNote(null)}
        note={viewingNote}
        canManage={canManage}
        onEdit={(note) => {
          setViewingNote(null);
          handleOpenEdit(note);
        }}
      />

      {/* Create / Edit Dialog */}
      <SoaNoteDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingNote={editingNote}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmActionDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete SOA Note Template"
        description={`Are you sure you want to delete the SOA note template "${deletingNote?.title || deletingNote?.code || 'this template'}"? This action cannot be undone.`}
        confirmLabel="Delete Template"
        cancelLabel="Cancel"
        loading={isProcessingDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default function SoaNotesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-500">Loading SOA note templates...</p>
          </div>
        </div>
      }
    >
      <SoaNotesContent />
    </Suspense>
  );
}
