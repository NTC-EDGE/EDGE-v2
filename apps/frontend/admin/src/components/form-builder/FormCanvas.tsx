"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { FormSchema, FieldType, LinkedServiceItem, ServiceVariantToolbarItem } from "./types";
import { ServiceVariantToolbar } from "./ServiceVariantToolbar";
import { collectAllFormVariants, getEffectiveLinkedServices } from "./canonicalFormServices";
import { ServiceItem, ServiceCategory } from "@/services/catalogService";
import { useCanvasSections } from "./canvas/useCanvasSections";
import { isFieldApplicableForVariant } from "./utils/variantConditionUtils";
import { CanvasVersionBar, CanvasSectionsControlBar } from "./canvas/CanvasVersionAndControlsBar";
import { CanvasEmptyFormState, CanvasEmptyVariantState } from "./canvas/CanvasEmptyStates";
import { CanvasSectionCard } from "./canvas/CanvasSectionCard";
import { CanvasDialogs } from "./canvas/CanvasDialogs";

interface FormCanvasProps {
  form: FormSchema;
  baseForm?: FormSchema | null;
  isLoadingWorkspace?: boolean;
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  onUpdateForm: (updates: Partial<FormSchema>) => void;
  onAddField: (type: FieldType, atIndex?: number) => void;
  onReorderFields: (fromIndex: number, toIndex: number) => void;
  onDuplicateField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onSwitchVersion?: (formId: string) => void; onSetActive?: () => void;
  onCreateNewVersion?: () => void; onDeleteVersion?: () => void;
  catalogServices?: ServiceItem[]; catalogCategories?: ServiceCategory[];
  apiVariants?: ServiceVariantToolbarItem[];
  onRequestFilterOptions?: () => void;
  onLinkedServicesChanged?: (services: LinkedServiceItem[]) => void;
  selectedVariant: string; onSelectVariant: (variantName: string) => void;
  isVariantEditMode: boolean; onSetVariantEditMode: (editMode: boolean) => void;
  onCustomizeVariant?: (variantName: string) => void;
  onResetFromBaseForm?: () => void;
  onRevertVariantToBase?: (variantName: string) => void;
  customizedVariantNames?: string[];
}

const VALID_FIELD_TYPES = new Set<string>([
  "text", "textarea", "number", "email", "phone", "date", "time", "select", "radio", "checkbox", "file", "repeater", "section-header", "divider"
]);
function isFieldType(val: string): val is FieldType {
  return VALID_FIELD_TYPES.has(val);
}

export function FormCanvas({
  form,
  baseForm,
  isLoadingWorkspace = false,
  selectedFieldId,
  onSelectField,
  onUpdateForm,
  onAddField,
  onReorderFields,
  onDuplicateField,
  onDeleteField,
  onSwitchVersion,
  onSetActive,
  onCreateNewVersion,
  onDeleteVersion,
  catalogServices = [],
  catalogCategories = [],
  apiVariants = [],
  onRequestFilterOptions,
  onLinkedServicesChanged,
  selectedVariant,
  onSelectVariant,
  onResetFromBaseForm,
  onRevertVariantToBase,
  customizedVariantNames = [],
}: FormCanvasProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isLinkServiceModalOpen, setIsLinkServiceModalOpen] = useState(false);
  const [sectionDeleteTarget, setSectionDeleteTarget] = useState<{
    id: string;
    title: string;
    childCount: number;
    contractRequired?: boolean;
  } | null>(null);

  const formVariants = useMemo(
    () => collectAllFormVariants(form, catalogServices, apiVariants),
    [form, catalogServices, apiVariants]
  );
  const effectiveLinkedServices = useMemo(
    () => getEffectiveLinkedServices(form, catalogServices),
    [form, catalogServices]
  );

  const {
    collapsedSectionIds,
    toggleSectionCollapse,
    collapseAllSections,
    expandAllSections,
    sectionGroups,
    displayedSectionGroups,
    applicableFieldsCount,
    sectionCount,
  } = useCanvasSections(form, selectedVariant, selectedFieldId, onSelectField);

  const baseFieldsCount = useMemo(
    () =>
      (baseForm ? baseForm.fields : form.fields).filter((f) =>
        isFieldApplicableForVariant(f, "ALL")
      ).length,
    [baseForm, form.fields]
  );

  const handleCanvasDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOverCanvas(true);
  }, []);

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOverCanvas(false);
      const rawFieldType = e.dataTransfer.getData("fieldType");
      if (isFieldType(rawFieldType)) onAddField(rawFieldType);
    },
    [onAddField]
  );

  const handleFieldDrop = (e: React.DragEvent<HTMLDivElement>, toIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    const canvasFieldId = e.dataTransfer.getData("canvasFieldId");
    const rawFieldType = e.dataTransfer.getData("fieldType");
    if (canvasFieldId) {
      const fromIndex = form.fields.findIndex((f) => f.id === canvasFieldId);
      if (fromIndex >= 0 && fromIndex !== toIndex) onReorderFields(fromIndex, toIndex);
    } else if (isFieldType(rawFieldType)) {
      onAddField(rawFieldType, toIndex);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950" onClick={() => onSelectField(null)}>
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1600px] mx-auto py-6 px-6 lg:px-10 min-h-full">
          <CanvasVersionBar
            form={form}
            selectedVariant={selectedVariant}
            linkedVariantsCount={form.linkedVariantsCount ?? formVariants.length}
            onSwitchVersion={onSwitchVersion}
            onSetActive={onSetActive}
            onCreateNewVersion={onCreateNewVersion}
            onDeleteVersion={onDeleteVersion}
          />
          <ServiceVariantToolbar
            variants={formVariants}
            selectedVariant={selectedVariant}
            onSelectVariant={onSelectVariant}
            onOpenLinkServiceModal={() => {
              onRequestFilterOptions?.();
              setIsLinkServiceModalOpen(true);
            }}
            totalFieldsCount={baseFieldsCount}
            applicableFieldsCount={applicableFieldsCount}
            linkedServicesCount={effectiveLinkedServices.length}
            customizedVariantNames={customizedVariantNames}
            onRevertVariantToBase={onRevertVariantToBase}
          />
          <CanvasSectionsControlBar sectionCount={sectionCount} totalFieldsCount={baseFieldsCount} applicableFieldsCount={applicableFieldsCount} selectedVariant={selectedVariant} hasSections={sectionGroups.length > 0} onCollapseAll={collapseAllSections} onExpandAll={expandAllSections} onOpenResetConfirm={() => setIsResetConfirmOpen(true)} onAddField={onAddField} canResetVariant={Boolean(onResetFromBaseForm)} />
          {isLoadingWorkspace ? (
            <div className="py-24 flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Loading Form Workspace &amp; Service Variants…
              </p>
            </div>
          ) : form.fields.length === 0 ? (
            <CanvasEmptyFormState isDragOverCanvas={isDragOverCanvas} onDragOver={handleCanvasDragOver} onDragLeave={() => setIsDragOverCanvas(false)} onDrop={handleCanvasDrop} />
          ) : displayedSectionGroups.length === 0 ? (
            <CanvasEmptyVariantState selectedVariant={selectedVariant} onSelectVariant={onSelectVariant} />
          ) : (
            <div onDragOver={handleCanvasDragOver} onDragLeave={() => setIsDragOverCanvas(false)} onDrop={handleCanvasDrop} className="space-y-6">
              {displayedSectionGroups.map((group) => (
                <CanvasSectionCard
                  key={group.id}
                  group={group}
                  allFields={form.fields}
                  formVariants={formVariants}
                  isCollapsed={collapsedSectionIds.has(group.id)}
                  selectedFieldId={selectedFieldId}
                  dragOverIndex={dragOverIndex}
                  selectedVariant={selectedVariant}
                  isReadOnly={false}
                  onToggleCollapse={toggleSectionCollapse}
                  onSelectField={onSelectField}
                  onDuplicateField={onDuplicateField}
                  onDeleteField={onDeleteField}
                  onRequestDeleteSection={setSectionDeleteTarget}
                  onFieldDragStart={(e, id) => { e.dataTransfer.setData("canvasFieldId", id); e.dataTransfer.effectAllowed = "move"; }}
                  onFieldDragOver={(e, idx) => { e.preventDefault(); e.stopPropagation(); setDragOverIndex(idx); }}
                  onFieldDrop={handleFieldDrop}
                  onSetDragOverIndex={setDragOverIndex}
                />
              ))}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOverIndex(form.fields.length); }}
                onDrop={(e) => handleFieldDrop(e, form.fields.length)}
                onDragEnd={() => setDragOverIndex(null)}
                className={`h-12 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center text-xs font-semibold ${
                  dragOverIndex === form.fields.length
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600"
                    : "border-slate-300 dark:border-slate-700 text-slate-400 hover:border-indigo-400 hover:text-indigo-600"
                }`}
              >
                + Drop new field or section at the end
              </div>
            </div>
          )}
        </div>
      </div>

      <CanvasDialogs
        form={form}
        catalogServices={catalogServices}
        catalogCategories={catalogCategories}
        selectedVariant={selectedVariant}
        isLinkServiceModalOpen={isLinkServiceModalOpen}
        onCloseLinkServiceModal={() => setIsLinkServiceModalOpen(false)}
        onSaveLinkedServices={(services: LinkedServiceItem[], variants?: string[]) => {
          onUpdateForm({ linkedServices: services, linkedVariants: variants });
          onLinkedServicesChanged?.(services);
        }}
        isResetConfirmOpen={isResetConfirmOpen}
        onCloseResetConfirm={() => setIsResetConfirmOpen(false)}
        onResetFromBaseForm={onResetFromBaseForm}
        sectionDeleteTarget={sectionDeleteTarget}
        onCloseSectionDelete={() => setSectionDeleteTarget(null)}
        onDeleteField={onDeleteField}
      />
    </div>
  );
}
