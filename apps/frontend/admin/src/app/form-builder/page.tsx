"use client";

import React, { useState, useCallback, useEffect, useRef, Suspense } from "react";
import {
  ArrowLeft,
  Eye,
  CheckCircle2,
  Globe,
  EyeOff,
  Loader2,
  ClipboardList,
  Sparkles,
  Layers,
  Building2,
} from "lucide-react";
import { FormSchema, FormField, FieldType } from "@/components/form-builder/types";
import {
  useLocalForms,
  saveFormSchema,
  deleteFormSchema,
  createDefaultField,
  generateId,
  convertBackendFormToSchema,
  convertSchemaToBackendSections,
  reorderFieldsWithSections,
  duplicateFieldWithSection,
} from "@/components/form-builder/utils";
import { useFormBuilderService } from "@/services/formBuilderService";
import { useCatalogService, ServiceCategory, ServiceItem } from "@/services/catalogService";
import { FieldPalette } from "@/components/form-builder/FieldPalette";
import { FieldEditor } from "@/components/form-builder/FieldEditor";
import { FormCanvas } from "@/components/form-builder/FormCanvas";
import { FormPreviewModal } from "@/components/form-builder/FormPreviewModal";
import { FormsList } from "@/components/form-builder/FormsList";
import { CreateFormDialog } from "@/components/form-builder/CreateFormDialog";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { UnsavedChangesDialog } from "@/components/form-builder/UnsavedChangesDialog";
import { ToastNotification, ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";

type View = "list" | "builder";

function FormBuilderContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const {
    useForms,
    getFormById,
    createForm,
    updateForm,
    deleteForm,
    duplicateForm,
  } = useFormBuilderService();
  const { data: apiResponse, mutate } = useForms(
    currentPage,
    pageSize,
    searchTerm,
    selectedServiceId || undefined
  );

  const { useServiceCategories, useServices } = useCatalogService();
  const { data: categoriesResponse } = useServiceCategories();
  const { data: servicesResponse } = useServices(undefined, 1, 200);

  const categories: ServiceCategory[] = React.useMemo(() => {
    if (!categoriesResponse) return [];
    return Array.isArray(categoriesResponse)
      ? categoriesResponse
      : categoriesResponse.data && Array.isArray(categoriesResponse.data)
      ? categoriesResponse.data
      : [];
  }, [categoriesResponse]);

  const services: ServiceItem[] = React.useMemo(() => {
    if (!servicesResponse) return [];
    return Array.isArray(servicesResponse)
      ? servicesResponse
      : servicesResponse.data && Array.isArray(servicesResponse.data)
      ? servicesResponse.data
      : [];
  }, [servicesResponse]);

  const [view, setView] = useState<View>("list");
  const localForms = useLocalForms();
  const [activeForm, setActiveForm] = useState<FormSchema | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<FormSchema | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FormSchema | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isUnsavedDialogOpen, setIsUnsavedDialogOpen] = useState(false);
  const originalFormRef = useRef<string | null>(null);

  // Warn on browser tab / window navigation if unsaved changes exist
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (view === "builder" && isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [view, isDirty]);

  // Parse backend and seeded forms
  const backendForms: FormSchema[] = React.useMemo(() => {
    if (!apiResponse) return [];
    const rawList = Array.isArray(apiResponse)
      ? apiResponse
      : apiResponse.data && Array.isArray(apiResponse.data)
      ? apiResponse.data
      : [];
    return rawList.map((f: unknown) => convertBackendFormToSchema(f as Parameters<typeof convertBackendFormToSchema>[0]));
  }, [apiResponse]);

  // Forms list reflecting backend API response
  const forms = React.useMemo(() => {
    if (apiResponse && apiResponse.succeeded !== false) {
      return backendForms;
    }
    // Offline / fallback when backend is unavailable
    return localForms;
  }, [apiResponse, backendForms, localForms]);

  // Backend persistence called ONLY on explicit Save
  const persistFormToBackend = useCallback(
    async (
      formToSave: FormSchema
    ): Promise<{ success: boolean; message: string; form: FormSchema }> => {
      setIsSaving(true);
      try {
        // Save locally first for instant resiliency
        saveFormSchema(formToSave);

        let current = formToSave;

        // If form has a serviceId, synchronize to backend API
        if (formToSave.serviceId) {
          const sections = convertSchemaToBackendSections(formToSave.fields);

          try {
            const updateRes = await updateForm(formToSave.id, {
              id: formToSave.id,
              serviceId: formToSave.serviceId,
              version: "1.0",
              categorySelectionRequired: false,
              sections,
            });

            if (updateRes && updateRes.succeeded) {
              await mutate();
              return {
                success: true,
                message: updateRes.message || "Form template updated successfully.",
                form: current,
              };
            } else if (updateRes && !updateRes.succeeded) {
              return {
                success: false,
                message: updateRes.message || "Failed to update form template.",
                form: current,
              };
            }
          } catch (updateErr: unknown) {
            const status = (updateErr as { response?: { status?: number } })?.response?.status;
            // If 404 (client-generated UUID not yet created on backend), create on backend
            if (status === 404) {
              try {
                const createRes = await createForm({
                  serviceId: formToSave.serviceId,
                  version: "1.0",
                  categorySelectionRequired: false,
                  sections,
                });

                if (createRes && createRes.formId) {
                  const updatedWithNewId: FormSchema = {
                    ...formToSave,
                    id: createRes.formId,
                  };
                  saveFormSchema(updatedWithNewId);
                  setActiveForm(updatedWithNewId);
                  current = updatedWithNewId;
                  await mutate();
                  return {
                    success: true,
                    message: "Form template created and saved successfully.",
                    form: current,
                  };
                }
              } catch (createErr: unknown) {
                const errMsg = getErrorMessage(createErr, "Failed to create form on backend.");
                return {
                  success: false,
                  message: errMsg,
                  form: current,
                };
              }
            } else {
              const errMsg = getErrorMessage(updateErr, "Failed to update form on backend.");
              return {
                success: false,
                message: errMsg,
                form: current,
              };
            }
          }
        }

        return {
          success: true,
          message: "Form saved successfully.",
          form: current,
        };
      } catch (err: unknown) {
        const errMsg = getErrorMessage(err, "An error occurred while saving the form.");
        return {
          success: false,
          message: errMsg,
          form: formToSave,
        };
      } finally {
        setIsSaving(false);
      }
    },
    [updateForm, createForm, mutate]
  );

  // --- Builder actions (no auto-save; marks form as dirty) ---

  const handleUpdateForm = useCallback(
    (updates: Partial<FormSchema>) => {
      if (!activeForm) return;
      const updated: FormSchema = {
        ...activeForm,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(updated);
      setIsDirty(true);
    },
    [activeForm]
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
      setIsDirty(true);
    },
    [activeForm]
  );

  const handleReorderFields = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!activeForm) return;
      const fields = reorderFieldsWithSections(activeForm.fields, fromIndex, toIndex);
      const updated: FormSchema = {
        ...activeForm,
        fields,
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(updated);
      setIsDirty(true);
    },
    [activeForm]
  );

  const handleDuplicateField = useCallback(
    (id: string) => {
      if (!activeForm) return;
      const fields = duplicateFieldWithSection(activeForm.fields, id);
      const updated: FormSchema = {
        ...activeForm,
        fields,
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(updated);
      setIsDirty(true);
    },
    [activeForm]
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
      setIsDirty(true);
    },
    [activeForm, selectedFieldId]
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
      setIsDirty(true);
    },
    [activeForm, selectedFieldId]
  );

  const handleManualSave = async () => {
    if (!activeForm) return;
    const result = await persistFormToBackend(activeForm);
    if (result.success) {
      originalFormRef.current = JSON.stringify(result.form);
      setIsDirty(false);
      setToast({
        message: result.message || "Form template saved to backend successfully.",
        type: "success",
      });
    } else {
      setToast({
        message: result.message || "Failed to save form to backend.",
        type: "error",
      });
    }
  };

  // Auto-save on changes/drags (debounced 1200ms)
  useEffect(() => {
    if (!isDirty || !activeForm || isSaving) return;

    const timer = setTimeout(() => {
      persistFormToBackend(activeForm).then((result) => {
        if (result.success) {
          originalFormRef.current = JSON.stringify(result.form);
          setIsDirty(false);
        }
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [isDirty, activeForm, isSaving, persistFormToBackend]);

  const handleTogglePublish = async () => {
    if (!activeForm) return;
    const targetState = !activeForm.isPublished;
    const updated: FormSchema = {
      ...activeForm,
      isPublished: targetState,
      updatedAt: new Date().toISOString(),
    };
    setActiveForm(updated);
    const result = await persistFormToBackend(updated);
    if (result.success) {
      originalFormRef.current = JSON.stringify(result.form);
      setIsDirty(false);
      setToast({
        message: targetState
          ? "Form published successfully."
          : "Form unpublished.",
        type: "success",
      });
    } else {
      setActiveForm((prev) =>
        prev ? { ...prev, isPublished: !targetState } : prev
      );
      setToast({
        message: `Failed to update publication status: ${result.message}`,
        type: "error",
      });
    }
  };

  // --- List actions ---

  const handleOpenEditor = async (form: FormSchema) => {
    setActiveForm(form);
    setSelectedFieldId(null);
    setIsDirty(false);
    originalFormRef.current = JSON.stringify(form);
    setView("builder");

    if (form.id) {
      try {
        const res = await getFormById(form.id).catch(() => null);
        if (res && res.succeeded && res.data) {
          const freshSchema = convertBackendFormToSchema(res.data);
          const combined: FormSchema = {
            ...freshSchema,
            name: form.name || freshSchema.name,
            description: form.description || freshSchema.description,
            serviceName: form.serviceName || freshSchema.serviceName,
            serviceCode: form.serviceCode || freshSchema.serviceCode,
          };
          setActiveForm((prev) => (prev && prev.id === form.id ? combined : prev));
          originalFormRef.current = JSON.stringify(combined);
          setIsDirty(false);
        }
      } catch {
        // Graceful fallback to initial form schema
      }
    }
  };

  const handleOpenPreview = async (form: FormSchema) => {
    setPreviewForm(form);

    if (form.id) {
      try {
        const res = await getFormById(form.id).catch(() => null);
        if (res && res.succeeded && res.data) {
          const freshSchema = convertBackendFormToSchema(res.data);
          setPreviewForm({
            ...freshSchema,
            name: form.name || freshSchema.name,
            description: form.description || freshSchema.description,
            serviceName: form.serviceName || freshSchema.serviceName,
            serviceCode: form.serviceCode || freshSchema.serviceCode,
          });
        }
      } catch {
        // Fallback to active preview
      }
    }
  };

  const handleCreateNew = (
    name: string,
    description: string,
    serviceId?: string,
    serviceName?: string
  ) => {
    const now = new Date().toISOString();
    const newForm: FormSchema = {
      id: generateId(),
      name,
      description,
      serviceId,
      serviceName,
      fields: [],
      createdAt: now,
      updatedAt: now,
      isPublished: false,
    };
    saveFormSchema(newForm);
    setIsCreateDialogOpen(false);
    handleOpenEditor(newForm);
    setToast({ message: "Form created. Start adding fields!", type: "success" });
  };

  const handleDuplicateForm = async (form: FormSchema) => {
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
    if (form.serviceId) {
      await duplicateForm(form.id).catch(() => null);
      await mutate();
    }
    setToast({ message: "Form duplicated.", type: "success" });
  };

  const handleDeleteFormConfirm = async () => {
    if (!deleteTarget) return;
    deleteFormSchema(deleteTarget.id);
    if (deleteTarget.serviceId) {
      await deleteForm(deleteTarget.id).catch(() => null);
      await mutate();
    }
    if (activeForm?.id === deleteTarget.id) {
      setActiveForm(null);
      setView("list");
      setIsDirty(false);
    }
    setToast({ message: "Form deleted.", type: "success" });
    setDeleteTarget(null);
  };

  const handleBackToList = () => {
    if (isDirty) {
      setIsUnsavedDialogOpen(true);
    } else {
      setView("list");
      setActiveForm(null);
      setSelectedFieldId(null);
      setIsDirty(false);
    }
  };

  const handleSaveAndExit = async () => {
    if (!activeForm) return;
    const result = await persistFormToBackend(activeForm);
    if (result.success) {
      setIsDirty(false);
      setIsUnsavedDialogOpen(false);
      setView("list");
      setActiveForm(null);
      setSelectedFieldId(null);
      setToast({
        message: "Form template saved successfully.",
        type: "success",
      });
    } else {
      setToast({
        message: result.message || "Failed to save form to backend.",
        type: "error",
      });
    }
  };

  const handleDiscardAndExit = () => {
    if (originalFormRef.current) {
      try {
        const original = JSON.parse(originalFormRef.current) as FormSchema;
        saveFormSchema(original);
      } catch {
        // ignore
      }
    }
    setIsDirty(false);
    setIsUnsavedDialogOpen(false);
    setView("list");
    setActiveForm(null);
    setSelectedFieldId(null);
    setToast({ message: "Unsaved modifications discarded.", type: "info" });
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
              <ClipboardList className="w-4 h-4 text-indigo-500 shrink-0" />
              <span
                className="text-sm font-semibold text-slate-800 dark:text-white max-w-[200px] truncate"
                title={activeForm.name || "Untitled Form"}
              >
                {activeForm.name || "Untitled Form"}
              </span>
              {activeForm.serviceName && (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 max-w-[360px]"
                  title={`Associated Service: ${activeForm.serviceName}${activeForm.serviceCode ? ` (${activeForm.serviceCode})` : ""}`}
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 truncate">
                    {activeForm.serviceName}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Background Saving Load Indicator / Auto-Save Status */}
            {isSaving ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span>Saving in background…</span>
              </div>
            ) : !isDirty ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>All changes saved</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Syncing…</span>
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

        {/* Top Background Loading Progress Bar */}
        <div className="h-0.5 w-full bg-slate-200/30 dark:bg-slate-800/30 overflow-hidden relative z-20">
          {isSaving && (
            <div className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600 animate-pulse w-full shadow-sm shadow-indigo-500/50" />
          )}
        </div>

        {/* Three-panel layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Field Palette */}
          <div className="w-60 flex-shrink-0 overflow-hidden">
            <FieldPalette onAddField={handleAddField} />
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

          {/* Right Panel: Field Properties & Form Details */}
          <div className="w-80 flex-shrink-0 overflow-hidden">
            <FieldEditor
              field={selectedField}
              form={activeForm}
              onUpdateField={handleUpdateField}
              onUpdateForm={handleUpdateForm}
              onSelectField={setSelectedFieldId}
            />
          </div>
        </div>

        {/* Unsaved Changes Confirmation Dialog */}
        <UnsavedChangesDialog
          open={isUnsavedDialogOpen}
          onClose={() => setIsUnsavedDialogOpen(false)}
          onSaveAndExit={handleSaveAndExit}
          onDiscard={handleDiscardAndExit}
          isSaving={isSaving}
          formTitle={activeForm.name || activeForm.serviceName || "this form"}
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
              <span
                className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-500/20 flex items-center gap-1.5"
                suppressHydrationWarning
              >
                <Layers className="w-3.5 h-3.5" />
                {`${apiResponse?.totalCount ?? forms.length} Forms`}
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
        onPreview={handleOpenPreview}
        onDuplicate={handleDuplicateForm}
        onDelete={(form) => setDeleteTarget(form)}
        onCreateNew={() => setIsCreateDialogOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={(term) => {
          setSearchTerm(term);
          setCurrentPage(1);
        }}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={(catId) => {
          setSelectedCategoryId(catId);
          setCurrentPage(1);
        }}
        selectedServiceId={selectedServiceId}
        onServiceChange={(svcId) => {
          setSelectedServiceId(svcId);
          setCurrentPage(1);
        }}
        categories={categories}
        services={services}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={apiResponse?.totalCount ?? forms.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
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
