"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { FormSchema } from "@/components/form-builder/types";
import { ToastMessage } from "@/components/ui/toast-notification";
import { useFormBuilderCatalogAndList } from "@/components/form-builder/page/useFormBuilderCatalogAndList";
import { useFormPersistenceAndLifecycle } from "@/components/form-builder/page/useFormPersistenceAndLifecycle";
import { useFormSaveAndNavigation, PendingNavState } from "@/components/form-builder/page/useFormSaveAndNavigation";
import { useBuilderFieldActions } from "@/components/form-builder/page/useBuilderFieldActions";
import { FormBuilderWorkspaceView } from "@/components/form-builder/page/FormBuilderWorkspaceView";
import { FormBuilderListView } from "@/components/form-builder/page/FormBuilderListView";

function FormBuilderContent() {
  const [view, setView] = useState<"list" | "builder">("list");
  const [activeForm, setActiveForm] = useState<FormSchema | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<FormSchema | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FormSchema | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isUnsavedDialogOpen, setIsUnsavedDialogOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [masterBaseForm, setMasterBaseForm] = useState<FormSchema | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("ALL");
  const [isVariantEditMode, setIsVariantEditMode] = useState<boolean>(false);
  const [pendingNav, setPendingNav] = useState<PendingNavState>(null);
  const originalFormRef = useRef<string | null>(null);

  const catalog = useFormBuilderCatalogAndList(activeForm);

  const lifecycle = useFormPersistenceAndLifecycle({
    activeForm, setActiveForm, setMasterBaseForm, setSelectedFieldId, setSelectedVariant,
    setIsVariantEditMode, setIsDirty, setView, setPreviewForm, setIsCreateDialogOpen,
    deleteTarget, setDeleteTarget, setToast, originalFormRef,
    backendForms: catalog.backendForms, formService: catalog.formService, mutate: catalog.mutate,
  });

  const fieldActions = useBuilderFieldActions({
    activeForm, setActiveForm, selectedFieldId, setSelectedFieldId, selectedVariant,
    setSelectedVariant, setIsVariantEditMode, setIsDirty, setToast,
    allVariantNames: catalog.allVariantNames, originalFormRef,
  });

  const saveNav = useFormSaveAndNavigation({
    activeForm, setActiveForm, setMasterBaseForm, setSelectedFieldId, setIsDirty, setIsSaving,
    setIsSaveConfirmOpen, setIsUnsavedDialogOpen, pendingNav, setPendingNav, setView, setToast,
    originalFormRef, formService: catalog.formService, mutate: catalog.mutate,
    executeSelectVariant: fieldActions.executeSelectVariant,
    executeSwitchVersion: lifecycle.executeSwitchVersion,
    handleSetActive: lifecycle.handleSetActive,
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (view === "builder" && isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [view, isDirty]);

  const selectedField = activeForm?.fields.find((f) => f.id === selectedFieldId) ?? null;

  if (view === "builder" && activeForm) {
    return (
      <FormBuilderWorkspaceView
        activeForm={activeForm}
        masterBaseForm={masterBaseForm}
        selectedField={selectedField}
        selectedFieldId={selectedFieldId}
        selectedVariant={selectedVariant}
        isVariantEditMode={isVariantEditMode}
        isLeftPanelOpen={isLeftPanelOpen}
        isRightPanelOpen={isRightPanelOpen}
        isSaving={isSaving}
        isDirty={isDirty}
        isSaveConfirmOpen={isSaveConfirmOpen}
        isUnsavedDialogOpen={isUnsavedDialogOpen}
        deleteTarget={deleteTarget}
        previewForm={previewForm}
        toast={toast}
        services={catalog.services}
        categories={catalog.categories}
        backendServiceVariants={catalog.backendServiceVariants}
        customizedVariantNames={catalog.customizedVariantNames}
        onCloseToast={() => setToast(null)}
        onBackToList={() => saveNav.handleBackToList(isDirty)}
        onSelectField={setSelectedFieldId}
        onSetLeftPanelOpen={setIsLeftPanelOpen}
        onSetRightPanelOpen={setIsRightPanelOpen}
        onSetVariantEditMode={setIsVariantEditMode}
        onSetSaveConfirmOpen={setIsSaveConfirmOpen}
        onSetUnsavedDialogOpen={setIsUnsavedDialogOpen}
        onSetDeleteTarget={setDeleteTarget}
        onSetPreviewForm={setPreviewForm}
        onUpdateForm={fieldActions.handleUpdateForm}
        onAddField={fieldActions.handleAddField}
        onReorderFields={fieldActions.handleReorderFields}
        onDuplicateField={fieldActions.handleDuplicateField}
        onDeleteField={fieldActions.handleDeleteField}
        onUpdateField={fieldActions.handleUpdateField}
        onSwitchVersion={(id) => void saveNav.handleSwitchVersion(id, isDirty)}
        onSetActiveCurrent={saveNav.handleSetActiveCurrent}
        onDuplicateForm={lifecycle.handleDuplicateForm}
        onSelectVariant={fieldActions.handleSelectVariant}
        onCustomizeVariant={fieldActions.handleCustomizeVariant}
        onResetFromBaseForm={fieldActions.handleResetFromBaseForm}
        onRevertVariantToBase={fieldActions.handleRevertVariantToBase}
        onResetChanges={fieldActions.handleResetChanges}
        onManualSave={saveNav.handleManualSave}
        onSaveAndExit={saveNav.handleSaveAndExit}
        onDiscardAndExit={saveNav.handleDiscardAndExit}
        onDeleteFormConfirm={lifecycle.handleDeleteFormConfirm}
      />
    );
  }

  return (
    <FormBuilderListView
      forms={catalog.forms}
      resolvedTotalCount={catalog.resolvedTotalCount}
      searchTerm={catalog.searchTerm}
      selectedCategoryId={catalog.selectedCategoryId}
      selectedServiceId={catalog.selectedServiceId}
      statusFilter={catalog.statusFilter}
      categories={catalog.categories}
      services={catalog.services}
      currentPage={catalog.currentPage}
      pageSize={catalog.pageSize}
      loadingForms={catalog.loadingForms}
      formsError={catalog.formsError}
      isCreateDialogOpen={isCreateDialogOpen}
      deleteTarget={deleteTarget}
      previewForm={previewForm}
      toast={toast}
      onCloseToast={() => setToast(null)}
      onEdit={lifecycle.handleOpenEditor}
      onPreview={lifecycle.handleOpenPreview}
      onDuplicate={lifecycle.handleDuplicateForm}
      onDelete={(form) => setDeleteTarget(form)}
      onSetActive={lifecycle.handleSetActive}
      onSetCreateDialogOpen={setIsCreateDialogOpen}
      onCreateNew={lifecycle.handleCreateNew}
      onSearchChange={(term) => { catalog.setSearchTerm(term); catalog.setCurrentPage(1); }}
      onCategoryChange={(catId) => { catalog.setSelectedCategoryId(catId); catalog.setCurrentPage(1); }}
      onServiceChange={(svcId) => { catalog.setSelectedServiceId(svcId); catalog.setCurrentPage(1); }}
      onStatusFilterChange={(nextStatus) => { catalog.setStatusFilter(nextStatus); catalog.setCurrentPage(1); }}
      onPageChange={catalog.setCurrentPage}
      onPageSizeChange={(newSize) => { catalog.setPageSize(newSize); catalog.setCurrentPage(1); }}
      onRetry={() => void catalog.mutate()}
      onSetDeleteTarget={setDeleteTarget}
      onDeleteFormConfirm={lifecycle.handleDeleteFormConfirm}
      onSetPreviewForm={setPreviewForm}
    />
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
