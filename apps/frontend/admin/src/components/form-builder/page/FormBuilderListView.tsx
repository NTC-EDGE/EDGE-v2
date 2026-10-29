"use client";

import React from "react";
import { ClipboardList, Sparkles, Layers } from "lucide-react";
import { FormSchema } from "../types";
import { ServiceCategory, ServiceItem } from "@/services/catalogService";
import { FormsList } from "../FormsList";
import { CreateFormDialog } from "../CreateFormDialog";
import { FormPreviewModal } from "../FormPreviewModal";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { ToastNotification, ToastMessage } from "@/components/ui/toast-notification";

export function FormBuilderListView({
  forms,
  resolvedTotalCount,
  searchTerm,
  selectedCategoryId,
  selectedServiceId,
  statusFilter,
  categories,
  services,
  currentPage,
  pageSize,
  loadingForms,
  formsError,
  isCreateDialogOpen,
  deleteTarget,
  previewForm,
  toast,
  onCloseToast,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onSetActive,
  onSetCreateDialogOpen,
  onCreateNew,
  onSearchChange,
  onCategoryChange,
  onServiceChange,
  onStatusFilterChange,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onSetDeleteTarget,
  onDeleteFormConfirm,
  onSetPreviewForm,
}: {
  forms: FormSchema[];
  resolvedTotalCount: number;
  searchTerm: string;
  selectedCategoryId: string;
  selectedServiceId: string;
  statusFilter: "all" | "active" | "draft";
  categories: ServiceCategory[];
  services: ServiceItem[];
  currentPage: number;
  pageSize: number;
  loadingForms: boolean;
  formsError: unknown;
  isCreateDialogOpen: boolean;
  deleteTarget: FormSchema | null;
  previewForm: FormSchema | null;
  toast: ToastMessage | null;
  onCloseToast: () => void;
  onEdit: (form: FormSchema) => void;
  onPreview: (form: FormSchema) => void;
  onDuplicate: (form: FormSchema) => void;
  onDelete: (form: FormSchema) => void;
  onSetActive: (form: FormSchema) => void;
  onSetCreateDialogOpen: (open: boolean) => void;
  onCreateNew: (
    name: string,
    description: string,
    version: string,
    isActive: boolean,
    serviceId?: string,
    serviceName?: string
  ) => void;
  onSearchChange: (term: string) => void;
  onCategoryChange: (catId: string) => void;
  onServiceChange: (svcId: string) => void;
  onStatusFilterChange: (status: "all" | "active" | "draft") => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onSetDeleteTarget: (target: FormSchema | null) => void;
  onDeleteFormConfirm: () => void;
  onSetPreviewForm: (form: FormSchema | null) => void;
}) {
  return (
    <div className="space-y-6 transition-colors duration-200">
      <ToastNotification toast={toast} onClose={onCloseToast} />

      <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900/90 dark:to-violet-950/60 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ClipboardList className="w-64 h-64 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-700 dark:text-violet-300 text-xs font-semibold border border-violet-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Admin Tool
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-500/20 flex items-center gap-1.5"
                suppressHydrationWarning
              >
                <Layers className="w-3.5 h-3.5" />
                {`${resolvedTotalCount} Forms`}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Form Builder
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Design and manage dynamic forms with a drag-and-drop interface. Build application forms,
              surveys, and checklists — all synchronized with the backend.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSetCreateDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0 transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            <span>New Form</span>
          </button>
        </div>
      </div>

      <FormsList
        forms={forms}
        onEdit={onEdit}
        onPreview={onPreview}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onSetActive={onSetActive}
        onCreateNew={() => onSetCreateDialogOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={onCategoryChange}
        selectedServiceId={selectedServiceId}
        onServiceChange={onServiceChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        categories={categories}
        services={services}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={resolvedTotalCount}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        loading={loadingForms}
        isError={Boolean(formsError)}
        onRetry={onRetry}
      />

      <CreateFormDialog
        open={isCreateDialogOpen}
        onOpenChange={onSetCreateDialogOpen}
        onCreate={onCreateNew}
        existingForms={forms}
      />

      <ConfirmActionDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => onSetDeleteTarget(null)}
        title="Delete Form"
        description={`Are you sure you want to delete "${deleteTarget?.name ?? "this form"}"? This action cannot be undone.`}
        confirmLabel="Delete Form"
        cancelLabel="Cancel"
        loading={false}
        onConfirm={onDeleteFormConfirm}
      />

      {previewForm && (
        <FormPreviewModal
          open={Boolean(previewForm)}
          onOpenChange={(open) => !open && onSetPreviewForm(null)}
          form={previewForm}
        />
      )}
    </div>
  );
}
