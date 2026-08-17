"use client";

import React, { useState, useCallback, useRef, Suspense } from "react";
import {
  ArrowLeft,
  Eye,
  Save,
  Globe,
  EyeOff,
  Loader2,
  ClipboardList,
  Sparkles,
  Layers,
} from "lucide-react";
import { FormSchema, FormField, FieldType } from "@/components/form-builder/types";
import {
  loadForms,
  saveFormSchema,
  deleteFormSchema,
  createDefaultField,
  generateId,
} from "@/components/form-builder/utils";
import { FieldPalette } from "@/components/form-builder/FieldPalette";
import { FieldEditor } from "@/components/form-builder/FieldEditor";
import { FormCanvas } from "@/components/form-builder/FormCanvas";
import { FormPreviewModal } from "@/components/form-builder/FormPreviewModal";
import { FormsList } from "@/components/form-builder/FormsList";
import { CreateFormDialog } from "@/components/form-builder/CreateFormDialog";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { ToastNotification, ToastMessage } from "@/components/ui/toast-notification";

type View = "list" | "builder";

function FormBuilderContent() {
  const [view, setView] = useState<View>("list");
  const [forms, setForms] = useState<FormSchema[]>(() => loadForms());
  const [activeForm, setActiveForm] = useState<FormSchema | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<FormSchema | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FormSchema | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save with debounce
  const scheduleAutoSave = useCallback((form: FormSchema) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setIsSaving(true);
      try {
        saveFormSchema(form);
        setForms(loadForms());
      } finally {
        setIsSaving(false);
      }
    }, 800);
  }, []);

  // --- Builder actions ---

  const handleUpdateForm = useCallback(
    (updates: Partial<FormSchema>) => {
      if (!activeForm) return;
      const updated: FormSchema = {
        ...activeForm,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(updated);
      scheduleAutoSave(updated);
    },
    [activeForm, scheduleAutoSave]
  );

  const handleAddField = useCallback(
    (type: FieldType, atIndex?: number) => {
      if (!activeForm) return;
      const newField = createDefaultField(type);
      const fields = [...activeForm.fields];
      if (atIndex !== undefined) {
        fields.splice(atIndex, 0, newField);
      } else {
        fields.push(newField);
      }
      const updated: FormSchema = {
        ...activeForm,
        fields,
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(updated);
      setSelectedFieldId(newField.id);
      scheduleAutoSave(updated);
    },
    [activeForm, scheduleAutoSave]
  );

  const handleReorderFields = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!activeForm) return;
      const fields = [...activeForm.fields];
      const [removed] = fields.splice(fromIndex, 1);
      if (!removed) return;
      const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex;
      fields.splice(adjustedTo, 0, removed);
      const updated: FormSchema = {
        ...activeForm,
        fields,
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(updated);
      scheduleAutoSave(updated);
    },
    [activeForm, scheduleAutoSave]
  );

  const handleDuplicateField = useCallback(
    (id: string) => {
      if (!activeForm) return;
      const original = activeForm.fields.find((f) => f.id === id);
      if (!original) return;
      const duplicate: FormField = { ...original, id: generateId(), label: `${original.label} (Copy)` };
      const idx = activeForm.fields.findIndex((f) => f.id === id);
      const fields = [...activeForm.fields];
      fields.splice(idx + 1, 0, duplicate);
      const updated: FormSchema = {
        ...activeForm,
        fields,
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(updated);
      scheduleAutoSave(updated);
    },
    [activeForm, scheduleAutoSave]
  );

  const handleDeleteField = useCallback(
    (id: string) => {
      if (!activeForm) return;
      const fields = activeForm.fields.filter((f) => f.id !== id);
      if (selectedFieldId === id) setSelectedFieldId(null);
      const updated: FormSchema = {
        ...activeForm,
        fields,
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(updated);
      scheduleAutoSave(updated);
    },
    [activeForm, selectedFieldId, scheduleAutoSave]
  );

  const handleUpdateField = useCallback(
    (fieldUpdates: Partial<FormField>) => {
      if (!activeForm || !selectedFieldId) return;
      const fields = activeForm.fields.map((f) =>
        f.id === selectedFieldId ? { ...f, ...fieldUpdates } : f
      );
      const updated: FormSchema = {
        ...activeForm,
        fields,
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(updated);
      scheduleAutoSave(updated);
    },
    [activeForm, selectedFieldId, scheduleAutoSave]
  );

  const handleManualSave = () => {
    if (!activeForm) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsSaving(true);
    try {
      saveFormSchema(activeForm);
      setForms(loadForms());
      setToast({ message: "Form saved successfully.", type: "success" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = () => {
    if (!activeForm) return;
    const updated: FormSchema = {
      ...activeForm,
      isPublished: !activeForm.isPublished,
      updatedAt: new Date().toISOString(),
    };
    setActiveForm(updated);
    saveFormSchema(updated);
    setForms(loadForms());
    setToast({
      message: updated.isPublished ? "Form published successfully." : "Form unpublished.",
      type: "success",
    });
  };

  // --- List actions ---

  const handleOpenEditor = (form: FormSchema) => {
    setActiveForm(form);
    setSelectedFieldId(null);
    setView("builder");
  };

  const handleCreateNew = (name: string, description: string) => {
    const now = new Date().toISOString();
    const newForm: FormSchema = {
      id: generateId(),
      name,
      description,
      fields: [],
      createdAt: now,
      updatedAt: now,
      isPublished: false,
    };
    saveFormSchema(newForm);
    setForms(loadForms());
    setIsCreateDialogOpen(false);
    handleOpenEditor(newForm);
    setToast({ message: "Form created. Start adding fields!", type: "success" });
  };

  const handleDuplicateForm = (form: FormSchema) => {
    const now = new Date().toISOString();
    const duplicate: FormSchema = {
      ...form,
      id: generateId(),
      name: `${form.name} (Copy)`,
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    };
    saveFormSchema(duplicate);
    setForms(loadForms());
    setToast({ message: "Form duplicated.", type: "success" });
  };

  const handleDeleteFormConfirm = () => {
    if (!deleteTarget) return;
    deleteFormSchema(deleteTarget.id);
    setForms(loadForms());
    if (activeForm?.id === deleteTarget.id) {
      setActiveForm(null);
      setView("list");
    }
    setToast({ message: "Form deleted.", type: "success" });
    setDeleteTarget(null);
  };

  const handleBackToList = () => {
    if (activeForm) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      saveFormSchema(activeForm);
      setForms(loadForms());
    }
    setView("list");
    setActiveForm(null);
    setSelectedFieldId(null);
  };

  const selectedField = activeForm?.fields.find((f) => f.id === selectedFieldId) ?? null;

  // ---- BUILDER VIEW ----
  if (view === "builder" && activeForm) {
    return (
      <div className="fixed inset-0 flex flex-col bg-slate-100 dark:bg-slate-950 z-10">
        <ToastNotification toast={toast} onClose={() => setToast(null)} />

        {/* Builder Toolbar */}
        <div className="h-14 flex items-center justify-between px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToList}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Forms
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-slate-800 dark:text-white max-w-[200px] truncate">
                {activeForm.name || "Untitled Form"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSaving && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving…
              </div>
            )}
            <button
              type="button"
              onClick={() => setPreviewForm(activeForm)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              type="button"
              onClick={handleManualSave}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 font-medium transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
            <button
              type="button"
              onClick={handleTogglePublish}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeForm.isPublished
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
              }`}
            >
              {activeForm.isPublished ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  Unpublish
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>

        {/* Three-panel layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Field Palette */}
          <div className="w-60 flex-shrink-0 overflow-hidden">
            <FieldPalette />
          </div>

          {/* Center Panel: Canvas */}
          <div className="flex-1 overflow-hidden">
            <FormCanvas
              form={activeForm}
              selectedFieldId={selectedFieldId}
              onSelectField={setSelectedFieldId}
              onUpdateForm={handleUpdateForm}
              onAddField={handleAddField}
              onReorderFields={handleReorderFields}
              onDuplicateField={handleDuplicateField}
              onDeleteField={handleDeleteField}
            />
          </div>

          {/* Right Panel: Field Editor */}
          <div className="w-72 flex-shrink-0 overflow-hidden">
            <FieldEditor field={selectedField} onUpdateField={handleUpdateField} />
          </div>
        </div>

        {/* Preview Modal */}
        {previewForm && (
          <FormPreviewModal
            open={Boolean(previewForm)}
            onOpenChange={(open) => !open && setPreviewForm(null)}
            form={previewForm}
          />
        )}
      </div>
    );
  }

  // ---- LIST VIEW ----
  return (
    <div className="space-y-6 transition-colors duration-200">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Hero Banner */}
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
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-500/20 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {forms.length} Forms
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Form Builder
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Design and manage dynamic forms with a drag-and-drop interface. Build application forms, surveys,
              and checklists — all stored locally and ready to deploy.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0 transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            <span>New Form</span>
          </button>
        </div>
      </div>

      {/* Forms List */}
      <FormsList
        forms={forms}
        onEdit={handleOpenEditor}
        onPreview={(form) => setPreviewForm(form)}
        onDuplicate={handleDuplicateForm}
        onDelete={(form) => setDeleteTarget(form)}
        onCreateNew={() => setIsCreateDialogOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Create Dialog */}
      <CreateFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreateNew}
      />

      {/* Delete Confirmation */}
      <ConfirmActionDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Form"
        description={`Are you sure you want to delete "${deleteTarget?.name ?? "this form"}"? This action cannot be undone.`}
        confirmLabel="Delete Form"
        cancelLabel="Cancel"
        loading={false}
        onConfirm={handleDeleteFormConfirm}
      />

      {/* Preview Modal */}
      {previewForm && (
        <FormPreviewModal
          open={Boolean(previewForm)}
          onOpenChange={(open) => !open && setPreviewForm(null)}
          form={previewForm}
        />
      )}
    </div>
  );
}

export default function FormBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-500">Loading Form Builder…</p>
          </div>
        </div>
      }
    >
      <FormBuilderContent />
    </Suspense>
  );
}
