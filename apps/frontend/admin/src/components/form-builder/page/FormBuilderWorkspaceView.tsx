"use client";

import React from "react";
import { FormSchema, FormField, FieldType, ServiceVariantToolbarItem } from "../types";
import { ServiceCategory, ServiceItem } from "@/services/catalogService";
import { FieldPalette } from "../FieldPalette";
import { FieldEditor } from "../FieldEditor";
import { FormCanvas } from "../FormCanvas";
import { FormPreviewModal } from "../FormPreviewModal";
import { UnsavedChangesDialog } from "../UnsavedChangesDialog";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { ToastNotification, ToastMessage } from "@/components/ui/toast-notification";
import { BuilderTopToolbar } from "./BuilderTopToolbar";

export function FormBuilderWorkspaceView(props: {
  activeForm: FormSchema;
  masterBaseForm: FormSchema | null;
  selectedField: FormField | null;
  selectedFieldId: string | null;
  selectedVariant: string;
  isVariantEditMode: boolean;
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  isSaving: boolean;
  isDirty: boolean;
  isSaveConfirmOpen: boolean;
  isUnsavedDialogOpen: boolean;
  deleteTarget: FormSchema | null;
  previewForm: FormSchema | null;
  toast: ToastMessage | null;
  services: ServiceItem[];
  categories: ServiceCategory[];
  backendServiceVariants: ServiceVariantToolbarItem[];
  customizedVariantNames: string[];
  onCloseToast: () => void;
  onBackToList: () => void;
  onSelectField: (id: string | null) => void;
  onSetLeftPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSetRightPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSetVariantEditMode: (mode: boolean) => void;
  onSetSaveConfirmOpen: (open: boolean) => void;
  onSetUnsavedDialogOpen: (open: boolean) => void;
  onSetDeleteTarget: (target: FormSchema | null) => void;
  onSetPreviewForm: (form: FormSchema | null) => void;
  onUpdateForm: (updates: Partial<FormSchema>) => void;
  onAddField: (type: FieldType, atIndex?: number) => void;
  onReorderFields: (from: number, to: number) => void;
  onDuplicateField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onUpdateField: (updates: Partial<FormField>) => void;
  onSwitchVersion: (id: string) => void;
  onSetActiveCurrent: () => void;
  onDuplicateForm: (form: FormSchema) => void;
  onSelectVariant: (variant: string) => void;
  onCustomizeVariant: (variant: string) => void;
  onResetFromBaseForm: () => void;
  onRevertVariantToBase: (variant: string) => void;
  onResetChanges: () => void;
  onManualSave: () => void;
  onSaveAndExit: () => void;
  onDiscardAndExit: () => void;
  onDeleteFormConfirm: () => void;
}) {
  const {
    activeForm,
    masterBaseForm,
    selectedField,
    selectedFieldId,
    selectedVariant,
    isVariantEditMode,
    isLeftPanelOpen,
    isRightPanelOpen,
    isSaving,
    isDirty,
    isSaveConfirmOpen,
    isUnsavedDialogOpen,
    deleteTarget,
    previewForm,
    toast,
  } = props;

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-100 dark:bg-slate-950 z-10">
      <ToastNotification toast={toast} onClose={props.onCloseToast} />
      <BuilderTopToolbar
        activeForm={activeForm}
        selectedVariant={selectedVariant}
        isLeftPanelOpen={isLeftPanelOpen}
        isRightPanelOpen={isRightPanelOpen}
        isSaving={isSaving}
        isDirty={isDirty}
        onBackToList={props.onBackToList}
        onInspectFormOverview={() => {
          props.onSelectField(null);
          props.onSetRightPanelOpen(true);
        }}
        onToggleLeftPanel={() => props.onSetLeftPanelOpen((p) => !p)}
        onToggleRightPanel={() => props.onSetRightPanelOpen((p) => !p)}
        onResetChanges={props.onResetChanges}
        onOpenSaveConfirm={() => props.onSetSaveConfirmOpen(true)}
        onPreview={() => props.onSetPreviewForm(activeForm)}
      />

      <div className="flex flex-1 overflow-hidden">
        {isLeftPanelOpen && (
          <div className="w-64 xl:w-72 2xl:w-80 flex-shrink-0 overflow-hidden transition-all duration-200">
            <FieldPalette onAddField={props.onAddField} disabled={false} />
          </div>
        )}

        <div className="flex-1 min-w-0 overflow-hidden">
          <FormCanvas
            form={activeForm}
            baseForm={masterBaseForm}
            catalogServices={props.services}
            catalogCategories={props.categories}
            apiVariants={props.backendServiceVariants}
            selectedFieldId={selectedFieldId}
            onSelectField={(fieldId) => {
              props.onSelectField(fieldId);
              if (fieldId !== null) props.onSetRightPanelOpen(true);
            }}
            onUpdateForm={props.onUpdateForm}
            onAddField={props.onAddField}
            onReorderFields={props.onReorderFields}
            onDuplicateField={props.onDuplicateField}
            onDeleteField={props.onDeleteField}
            onSwitchVersion={props.onSwitchVersion}
            onSetActive={props.onSetActiveCurrent}
            onCreateNewVersion={() => props.onDuplicateForm(activeForm)}
            onDeleteVersion={() => props.onSetDeleteTarget(activeForm)}
            selectedVariant={selectedVariant}
            onSelectVariant={props.onSelectVariant}
            isVariantEditMode={isVariantEditMode}
            onSetVariantEditMode={props.onSetVariantEditMode}
            onCustomizeVariant={props.onCustomizeVariant}
            onResetFromBaseForm={props.onResetFromBaseForm}
            onRevertVariantToBase={props.onRevertVariantToBase}
            customizedVariantNames={props.customizedVariantNames}
          />
        </div>

        {isRightPanelOpen && (
          <div className="w-80 lg:w-96 xl:w-[420px] 2xl:w-[460px] flex-shrink-0 overflow-hidden transition-all duration-200">
            <FieldEditor
              field={selectedField}
              form={activeForm}
              onUpdateField={props.onUpdateField}
              onUpdateForm={props.onUpdateForm}
              onSelectField={props.onSelectField}
              selectedVariant={selectedVariant}
            />
          </div>
        )}
      </div>

      <ConfirmActionDialog
        isOpen={isSaveConfirmOpen}
        onClose={() => !isSaving && props.onSetSaveConfirmOpen(false)}
        title="Save Form Changes"
        description={`Are you sure you want to save all changes to "${activeForm.name || activeForm.serviceName || "this form"}"? This will update the form structure and reflect in client applications.`}
        confirmLabel="Confirm & Save Changes"
        cancelLabel="Keep Editing"
        loading={isSaving}
        onConfirm={props.onManualSave}
      />

      <UnsavedChangesDialog
        open={isUnsavedDialogOpen}
        onClose={() => props.onSetUnsavedDialogOpen(false)}
        onSaveAndExit={props.onSaveAndExit}
        onDiscard={props.onDiscardAndExit}
        isSaving={isSaving}
        formTitle={activeForm.name || activeForm.serviceName || "this form"}
      />

      <ConfirmActionDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => props.onSetDeleteTarget(null)}
        title="Delete Form Version"
        description={`Are you sure you want to delete "${deleteTarget?.name ?? "this form"}" (v${deleteTarget?.version || "1.0"})? This action cannot be undone.`}
        confirmLabel="Delete Version"
        cancelLabel="Cancel"
        loading={false}
        onConfirm={props.onDeleteFormConfirm}
      />

      {previewForm && (
        <FormPreviewModal
          open={Boolean(previewForm)}
          onOpenChange={(open) => !open && props.onSetPreviewForm(null)}
          form={previewForm}
        />
      )}
    </div>
  );
}
