import { useCallback, MutableRefObject } from "react";
import { FormSchema, FormField, FieldType, ServiceVariantToolbarItem } from "../types";
import {
  createDefaultField, generateId, reorderFieldsWithSections, duplicateFieldWithSection,
  deleteFieldOrSectionForVariant, resetVariantToBaseFields, isExclusiveToVariant,
  excludeVariantFromField, isFormSchema, convertBackendFormToSchema, findMatchingVariant,
} from "../utils";
import { ToastMessage } from "@/components/ui/toast-notification";
import { useFormBuilderService } from "@/services/formBuilderService";
import { PendingNavState } from "./useFormSaveAndNavigation";

export function useBuilderFieldActions(params: {
  activeForm: FormSchema | null;
  setActiveForm: React.Dispatch<React.SetStateAction<FormSchema | null>>;
  selectedFieldId: string | null;
  setSelectedFieldId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedVariant: string;
  setSelectedVariant: React.Dispatch<React.SetStateAction<string>>;
  setIsVariantEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  setToast: React.Dispatch<React.SetStateAction<ToastMessage | null>>;
  allVariantNames: string[];
  originalFormRef: MutableRefObject<string | null>;
  masterBaseForm?: FormSchema | null;
  backendServiceVariants?: ServiceVariantToolbarItem[];
  formService?: ReturnType<typeof useFormBuilderService>;
  mutate?: () => Promise<unknown>;
  setPendingNav?: React.Dispatch<React.SetStateAction<PendingNavState>>;
  setIsUnsavedDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isDirty?: boolean;
}) {
  const {
    activeForm, setActiveForm, selectedFieldId, setSelectedFieldId, selectedVariant,
    setSelectedVariant, setIsVariantEditMode, setIsDirty, setToast, allVariantNames, originalFormRef,
    masterBaseForm, backendServiceVariants, formService, mutate, setPendingNav, setIsUnsavedDialogOpen,
    isDirty,
  } = params;

  const executeSelectVariant = useCallback(
    async (variantName: string) => {
      setSelectedVariant(variantName);
      setIsVariantEditMode(variantName !== "ALL");
      setSelectedFieldId(null);

      if (variantName === "ALL") {
        if (masterBaseForm) {
          setActiveForm(masterBaseForm);
          originalFormRef.current = JSON.stringify(masterBaseForm);
          setIsDirty(false);
        }
        return;
      }

      // Check if we can fetch dedicated variant form from the dedicated endpoint
      const matchedVariant = findMatchingVariant(backendServiceVariants, variantName);
      if (matchedVariant?.id && !matchedVariant.id.startsWith("var-")) {
        let loadedCustomized = false;
        if (formService?.getVariantForm) {
          try {
            const res = await formService.getVariantForm(matchedVariant.id).catch(() => null);
            if (res && res.succeeded && res.data) {
              const freshSchema = convertBackendFormToSchema(res.data);
              const combined: FormSchema = {
                ...freshSchema,
                name: activeForm?.name || freshSchema.name,
                description: activeForm?.description || freshSchema.description,
                serviceName: activeForm?.serviceName || freshSchema.serviceName,
                serviceCode: activeForm?.serviceCode || freshSchema.serviceCode,
                serviceVariantId: matchedVariant.id,
                serviceVariantName: matchedVariant.name,
              };
              setActiveForm(combined);
              originalFormRef.current = JSON.stringify(combined);
              setIsDirty(false);
              loadedCustomized = true;
            }
          } catch {
            // If variant form fails to load, fallback to base form with variant scope
          }
        }
        if (!loadedCustomized) {
          const base = masterBaseForm || activeForm;
          if (base) {
            const initializedVariantForm: FormSchema = {
              ...base,
              serviceVariantId: matchedVariant.id,
              serviceVariantName: matchedVariant.name,
              baseFormId: base.baseFormId || base.id,
              name: `${matchedVariant.name} Form`,
              isPublished: true,
              isActive: true,
              updatedAt: new Date().toISOString(),
            };
            setActiveForm(initializedVariantForm);
            originalFormRef.current = JSON.stringify(initializedVariantForm);
            setIsDirty(false);
          }
        }
      }
    },
    [
      setSelectedVariant,
      setIsVariantEditMode,
      setSelectedFieldId,
      masterBaseForm,
      setActiveForm,
      originalFormRef,
      setIsDirty,
      backendServiceVariants,
      formService,
      activeForm?.name,
      activeForm?.description,
      activeForm?.serviceName,
      activeForm?.serviceCode,
    ]
  );

  const handleSelectVariant = useCallback(
    (v: string) => {
      if (v === selectedVariant) return;
      if (isDirty && setPendingNav && setIsUnsavedDialogOpen) {
        setPendingNav({ type: "variant", variantName: v });
        setIsUnsavedDialogOpen(true);
        return;
      }
      void executeSelectVariant(v);
    },
    [selectedVariant, isDirty, setPendingNav, setIsUnsavedDialogOpen, executeSelectVariant]
  );

  const handleCustomizeVariant = useCallback((v: string) => {
    if (!activeForm || v === "ALL") return;
    setSelectedVariant(v);
    setIsVariantEditMode(true);
    setSelectedFieldId(null);
  }, [activeForm, setSelectedVariant, setIsVariantEditMode, setSelectedFieldId]);

  const handleResetFromBaseForm = useCallback(() => {
    if (!activeForm || selectedVariant === "ALL") return;
    const restoredFields = resetVariantToBaseFields(activeForm.fields, selectedVariant, allVariantNames);
    setActiveForm({ ...activeForm, fields: restoredFields, updatedAt: new Date().toISOString() });
    setIsDirty(true);
    setSelectedFieldId(null);
    setToast({
      message: `Restored all base form sections and fields for "${selectedVariant}". Click Save Changes to persist.`,
      type: "info",
    });
  }, [activeForm, selectedVariant, allVariantNames, setActiveForm, setIsDirty, setSelectedFieldId, setToast]);

  const handleRevertVariantToBase = useCallback(
    async (v: string) => {
      if (!activeForm || v === "ALL") return;

      const matchedVariant = findMatchingVariant(backendServiceVariants, v);

      if (matchedVariant?.id && !matchedVariant.id.startsWith("var-") && formService?.revertVariantForm) {
        try {
          const res = await formService.revertVariantForm(matchedVariant.id);
          if (res && res.succeeded) {
            setToast({
              message: `Variant "${v}" reverted to base form template.`,
              type: "success",
            });
            await mutate?.();
          }
        } catch {
          setToast({
            message: "Failed to revert variant form on backend.",
            type: "error",
          });
        }
      }

      if (masterBaseForm) {
        setActiveForm(masterBaseForm);
        originalFormRef.current = JSON.stringify(masterBaseForm);
      }
      setSelectedVariant("ALL");
      setIsVariantEditMode(false);
      setIsDirty(false);
    },
    [
      activeForm,
      backendServiceVariants,
      formService,
      setToast,
      mutate,
      masterBaseForm,
      setActiveForm,
      originalFormRef,
      setSelectedVariant,
      setIsVariantEditMode,
      setIsDirty,
    ]
  );

  const handleUpdateForm = useCallback(
    (updates: Partial<FormSchema>) => {
      if (!activeForm) return;
      setActiveForm({ ...activeForm, ...updates, updatedAt: new Date().toISOString() });
      setIsDirty(true);
    },
    [activeForm, setActiveForm, setIsDirty]
  );

  const handleAddField = useCallback(
    (type: FieldType, atIndex?: number) => {
      if (!activeForm) return;
      const baseField = createDefaultField(type);
      const newField: FormField =
        selectedVariant !== "ALL"
          ? { ...baseField, condition: { variants: [selectedVariant] }, visibilityCondition: JSON.stringify({ variants: [selectedVariant] }) }
          : baseField;

      const fields = [...activeForm.fields];
      if (atIndex !== undefined) {
        fields.splice(atIndex, 0, newField);
      } else if (type !== "section-header" && selectedFieldId !== null) {
        const selectedIdx = fields.findIndex((f) => f.id === selectedFieldId);
        if (selectedIdx >= 0) {
          if (fields[selectedIdx]?.type === "section-header") {
            let sectionEndIdx = selectedIdx + 1;
            while (sectionEndIdx < fields.length && fields[sectionEndIdx]?.type !== "section-header") sectionEndIdx++;
            fields.splice(sectionEndIdx, 0, newField);
          } else {
            fields.splice(selectedIdx + 1, 0, newField);
          }
        } else {
          fields.push(newField);
        }
      } else {
        fields.push(newField);
      }
      setActiveForm({ ...activeForm, fields, updatedAt: new Date().toISOString() });
      setSelectedFieldId(newField.id);
      setIsDirty(true);
    },
    [activeForm, selectedFieldId, selectedVariant, setActiveForm, setSelectedFieldId, setIsDirty]
  );

  const handleReorderFields = useCallback((fromIndex: number, toIndex: number) => {
    if (!activeForm) return;
    setActiveForm({ ...activeForm, fields: reorderFieldsWithSections(activeForm.fields, fromIndex, toIndex), updatedAt: new Date().toISOString() });
    setIsDirty(true);
  }, [activeForm, setActiveForm, setIsDirty]);

  const handleDuplicateField = useCallback((id: string) => {
    if (!activeForm) return;
    setActiveForm({ ...activeForm, fields: duplicateFieldWithSection(activeForm.fields, id, selectedVariant), updatedAt: new Date().toISOString() });
    setIsDirty(true);
  }, [activeForm, selectedVariant, setActiveForm, setIsDirty]);

  const handleDeleteField = useCallback((id: string) => {
    if (!activeForm) return;
    const fields = deleteFieldOrSectionForVariant(activeForm.fields, id, selectedVariant, allVariantNames);
    if (selectedFieldId !== null && !fields.some((f) => f.id === selectedFieldId)) setSelectedFieldId(null);
    setActiveForm({ ...activeForm, fields, updatedAt: new Date().toISOString() });
    setIsDirty(true);
  }, [activeForm, selectedFieldId, selectedVariant, allVariantNames, setActiveForm, setSelectedFieldId, setIsDirty]);

  const handleUpdateField = useCallback(
    (fieldUpdates: Partial<FormField>) => {
      if (!activeForm || !selectedFieldId) return;
      const targetIndex = activeForm.fields.findIndex((f) => f.id === selectedFieldId);
      const targetField = targetIndex >= 0 ? activeForm.fields[targetIndex] : undefined;
      if (!targetField) return;

      if (selectedVariant !== "ALL" && targetField.type === "section-header") {
        if ("sectionTitle" in fieldUpdates || "label" in fieldUpdates || "variantTitles" in fieldUpdates) {
          const nextTitle =
            fieldUpdates.variantTitles?.[selectedVariant] ??
            fieldUpdates.sectionTitle ??
            fieldUpdates.label ??
            targetField.variantTitles?.[selectedVariant] ??
            targetField.sectionTitle ??
            targetField.label ?? "";
          const nextVariantTitles: Record<string, string> = {
            ...(targetField.variantTitles ?? {}),
            [selectedVariant]: nextTitle,
          };
          const updatedField: FormField = { ...targetField, variantTitles: nextVariantTitles };
          const fields = activeForm.fields.map((f) => (f.id === selectedFieldId ? updatedField : f));
          setActiveForm({ ...activeForm, fields, updatedAt: new Date().toISOString() });
          setIsDirty(true);
          return;
        }
      }

      const isConditionUpdate = "condition" in fieldUpdates || "visibilityCondition" in fieldUpdates;
      if (selectedVariant !== "ALL" && !isConditionUpdate && targetField.type !== "section-header" && !isExclusiveToVariant(targetField, selectedVariant)) {
        const excludedOriginal = excludeVariantFromField(targetField, selectedVariant, allVariantNames);
        const variantCond = { ...targetField.condition, variants: [selectedVariant], excludedVariants: undefined, applicationTypes: undefined };
        const forkedField: FormField = {
          ...targetField, ...fieldUpdates, id: generateId(), condition: variantCond, visibilityCondition: JSON.stringify(variantCond),
        };
        const fields = [...activeForm.fields];
        fields.splice(targetIndex, 1, excludedOriginal, forkedField);
        setActiveForm({ ...activeForm, fields, updatedAt: new Date().toISOString() });
        setSelectedFieldId(forkedField.id);
        setIsDirty(true);
        return;
      }

      const fields = activeForm.fields.map((f) => (f.id === selectedFieldId ? { ...f, ...fieldUpdates } : f));
      setActiveForm({ ...activeForm, fields, updatedAt: new Date().toISOString() });
      setIsDirty(true);
    },
    [activeForm, selectedFieldId, selectedVariant, allVariantNames, setActiveForm, setSelectedFieldId, setIsDirty]
  );

  const handleResetChanges = useCallback(() => {
    if (!originalFormRef.current) return;
    try {
      const parsed: unknown = JSON.parse(originalFormRef.current);
      if (isFormSchema(parsed)) {
        setActiveForm(parsed);
        setSelectedFieldId(null);
        setIsDirty(false);
        setToast({ message: "Unsaved changes reverted to last saved version.", type: "info" });
      }
    } catch { /* ignore */ }
  }, [originalFormRef, setActiveForm, setSelectedFieldId, setIsDirty, setToast]);

  return {
    executeSelectVariant, handleSelectVariant, handleCustomizeVariant, handleResetFromBaseForm,
    handleRevertVariantToBase, handleUpdateForm, handleAddField, handleReorderFields,
    handleDuplicateField, handleDeleteField, handleUpdateField, handleResetChanges,
  };
}
