"use client";

import React, { useState } from "react";
import { ShieldAlert, X, ArrowRight } from "lucide-react";
import { FormSchema, FormField, FieldType, ServiceVariantToolbarItem, SharedChangesImpact } from "../types";
import { ServiceCategory, ServiceItem } from "@/services/catalogService";
import { FieldPalette } from "../FieldPalette";
import { FieldEditor } from "../FieldEditor";
import { FormCanvas } from "../FormCanvas";
import { FormPreviewModal } from "../FormPreviewModal";
import { UnsavedChangesDialog } from "../UnsavedChangesDialog";
import { VariantPropagationDialog } from "../canvas/VariantPropagationDialog";
import {
  VersionActionConfirmDialog,
  PendingVersionAction,
} from "../canvas/VersionActionConfirmDialog";
import { BlockedDeletionNotice } from "./useBuilderFieldActions";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { ToastNotification, ToastMessage } from "@/components/ui/toast-notification";
import { BuilderTopToolbar } from "./BuilderTopToolbar";

export function FormBuilderWorkspaceView(props: {
  activeForm: FormSchema;
  masterBaseForm: FormSchema | null;
  isLoadingWorkspace?: boolean;
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
  isPropagationDialogOpen: boolean;
  propagationImpact: SharedChangesImpact | null;
  blockedDeletion: BlockedDeletionNotice | null;
  deleteTarget: FormSchema | null;
  previewForm: FormSchema | null;
  toast: ToastMessage | null;
  services: ServiceItem[];
  categories: ServiceCategory[];
  backendServiceVariants: ServiceVariantToolbarItem[];
  currentFormVariants: ServiceVariantToolbarItem[];
  customizedVariantNames: string[];
  onRequestFilterOptions?: () => void;
  onLinkedServicesChanged?: (services: import("../types").LinkedServiceItem[]) => void;
  onCloseToast: () => void;
  onBackToList: () => void;
  onSelectField: (id: string | null) => void;
  onSetLeftPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSetRightPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSetVariantEditMode: (mode: boolean) => void;
  onSetSaveConfirmOpen: (open: boolean) => void;
  onOpenSaveFlow: () => void;
  onClosePropagationDialog: () => void;
  onConfirmPropagationSave: (propagateToCustomizedVariants: boolean) => void;
  onCloseBlockedDeletion: () => void;
  onSetUnsavedDialogOpen: (open: boolean) => void;
  onSetDeleteTarget: (target: FormSchema | null) => void;
  onSetPreviewForm: (form: FormSchema | null) => void;
  onUpdateForm: (updates: Partial<FormSchema>) => void;
  onAddField: (type: FieldType, atIndex?: number) => void;
  onReorderFields: (from: number, to: number) => void;
  onDuplicateField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onUpdateField: (updates: Partial<FormField>) => void;
  onSwitchVersion: (id: string) => Promise<void> | void;
  onSetActiveCurrent: () => Promise<void> | void;
  onDuplicateForm: (form: FormSchema) => Promise<void> | void;
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

  const [pendingVersionAction, setPendingVersionAction] = useState<PendingVersionAction>(null);
  const [isVersionActionProcessing, setIsVersionActionProcessing] = useState(false);

  const isCurrentVersionLive = Boolean(activeForm.isActive ?? activeForm.isPublished);
  const currentEditorVersion = activeForm.version || "1.0";
  const linkedVariantsCount = activeForm.linkedVariantsCount ?? props.currentFormVariants.length;

  const requestActivateVersion = () => {
    const currentLive = (activeForm.availableVersions ?? []).find(
      (v) => v.isActive && v.formId !== activeForm.id
    );
    setPendingVersionAction({
      kind: "activate",
      targetVersion: currentEditorVersion,
      currentActiveVersion: currentLive?.version,
    });
  };

  const requestSwitchVersion = (targetFormId: string) => {
    if (targetFormId === activeForm.id) return;
    if (isDirty) {
      // UnsavedChangesDialog handles Save & Switch / Discard & Switch when dirty
      void props.onSwitchVersion(targetFormId);
      return;
    }
    const targetVerObj = (activeForm.availableVersions ?? []).find(
      (v) => v.formId === targetFormId
    );
    setPendingVersionAction({
      kind: "switch",
      targetFormId,
      targetVersion: targetVerObj?.version || "1.0",
      targetIsActive: Boolean(targetVerObj?.isActive),
    });
  };

  const requestCreateNewVersion = () => {
    const curVer = activeForm.version || "1.0";
    const allNums = (activeForm.availableVersions ?? [])
      .map((v) => parseFloat(v.version))
      .filter((n) => !isNaN(n));
    const curNum = parseFloat(curVer);
    if (!isNaN(curNum)) allNums.push(curNum);
    const maxVer = allNums.length > 0 ? Math.max(...allNums) : NaN;
    const nextVer = !isNaN(maxVer) ? `${(Math.floor(maxVer) + 1).toFixed(1)}` : `${curVer}-copy`;

    setPendingVersionAction({
      kind: "create",
      sourceVersion: curVer,
      nextVersion: nextVer,
    });
  };

  const handleConfirmVersionAction = async () => {
    if (!pendingVersionAction) return;
    const action = pendingVersionAction;
    setIsVersionActionProcessing(true);
    try {
      if (action.kind === "activate") {
        await props.onSetActiveCurrent();
      } else if (action.kind === "switch") {
        await props.onSwitchVersion(action.targetFormId);
      } else if (action.kind === "create") {
        await props.onDuplicateForm(activeForm);
      }
    } finally {
      setIsVersionActionProcessing(false);
      setPendingVersionAction(null);
    }
  };

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
        onOpenSaveConfirm={props.onOpenSaveFlow}
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
            isLoadingWorkspace={props.isLoadingWorkspace}
            catalogServices={props.services}
            catalogCategories={props.categories}
            apiVariants={props.backendServiceVariants}
            onRequestFilterOptions={props.onRequestFilterOptions}
            onLinkedServicesChanged={props.onLinkedServicesChanged}
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
            onSwitchVersion={requestSwitchVersion}
            onSetActive={requestActivateVersion}
            onCreateNewVersion={requestCreateNewVersion}
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
              formVariants={props.currentFormVariants}
              onUpdateField={props.onUpdateField}
              onUpdateForm={props.onUpdateForm}
              onSelectField={props.onSelectField}
              onRequestSetActive={requestActivateVersion}
              selectedVariant={selectedVariant}
            />
          </div>
        )}
      </div>

      <VersionActionConfirmDialog
        action={pendingVersionAction}
        formName={activeForm.name || activeForm.serviceName || "this form"}
        selectedVariant={selectedVariant}
        currentEditorVersion={currentEditorVersion}
        linkedVariantsCount={linkedVariantsCount}
        isDirty={isDirty}
        isProcessing={isVersionActionProcessing}
        onClose={() => {
          if (!isVersionActionProcessing) setPendingVersionAction(null);
        }}
        onConfirm={() => void handleConfirmVersionAction()}
      />

      <VariantPropagationDialog
        isOpen={props.isPropagationDialogOpen}
        isSaving={isSaving}
        formName={activeForm.name || activeForm.serviceName || "Base Form"}
        impact={props.propagationImpact}
        onClose={props.onClosePropagationDialog}
        onConfirmSave={props.onConfirmPropagationSave}
      />

      {props.blockedDeletion !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onClick={props.onCloseBlockedDeletion}
        >
          <div
            className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-800/70 flex flex-col overflow-hidden"
            style={{ maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-rose-50/70 dark:bg-rose-950/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cannot Delete {props.blockedDeletion.itemKind === "section" ? "Section" : "Field"} in All Sections
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    &ldquo;{props.blockedDeletion.itemTitle}&rdquo; is currently used by{" "}
                    <strong>{props.blockedDeletion.usedByVariantNames.length}</strong> Service{" "}
                    {props.blockedDeletion.usedByVariantNames.length === 1 ? "Variant" : "Variants"}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={props.onCloseBlockedDeletion}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                To protect live client applications, sections and fields in <strong>All Sections &amp; Fields</strong> can only be permanently deleted once they are no longer used by any Service Variant. Click a Service Variant below to open its view and remove it there first:
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {props.blockedDeletion.usedByVariantNames.map((vName) => (
                  <button
                    key={vName}
                    type="button"
                    onClick={() => {
                      props.onCloseBlockedDeletion();
                      props.onSelectVariant(vName);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-950 dark:hover:bg-indigo-950/40 text-left flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <span className="truncate pr-2">{vName}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 flex justify-end">
              <button
                type="button"
                onClick={props.onCloseBlockedDeletion}
                className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmActionDialog
        isOpen={isSaveConfirmOpen}
        onClose={() => !isSaving && props.onSetSaveConfirmOpen(false)}
        title={`Save Form Changes (v${currentEditorVersion})`}
        description={
          isCurrentVersionLive
            ? `Are you sure you want to save all changes to "${activeForm.name || activeForm.serviceName || "this form"}" (v${currentEditorVersion} — Active on Client)? Because this is the live version, saving will immediately update the Client Application UI.`
            : `Are you sure you want to save all changes to Draft v${currentEditorVersion} of "${activeForm.name || activeForm.serviceName || "this form"}"? Live client applications will remain on the current active version until this draft is activated.`
        }
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
