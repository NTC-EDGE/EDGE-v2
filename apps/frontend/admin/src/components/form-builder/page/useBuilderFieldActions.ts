import { useCallback, MutableRefObject } from "react";
import { FormSchema, FormField, FieldType } from "../types";
import {
  createDefaultField, generateId, reorderFieldsWithSections, duplicateFieldWithSection,
  deleteFieldOrSectionForVariant, resetVariantToBaseFields, isExclusiveToVariant,
  excludeVariantFromField, isFormSchema,
} from "../utils";
import { ToastMessage } from "@/components/ui/toast-notification";

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
}) {
  const {
    activeForm, setActiveForm, selectedFieldId, setSelectedFieldId, selectedVariant,
    setSelectedVariant, setIsVariantEditMode, setIsDirty, setToast, allVariantNames, originalFormRef,
  } = params;

  const executeSelectVariant = useCallback(
    (variantName: string) => {
      setSelectedVariant(variantName);
      setIsVariantEditMode(variantName !== "ALL");
      setSelectedFieldId(null);
    },
    [setSelectedVariant, setIsVariantEditMode, setSelectedFieldId]
  );

  const handleSelectVariant = useCallback(
    (variantName: string) => {
      if (variantName !== selectedVariant) executeSelectVariant(variantName);
    },
    [selectedVariant, executeSelectVariant]
  );

  const handleCustomizeVariant = useCallback(
    (variantName: string) => {
      if (!activeForm || variantName === "ALL") return;
      setSelectedVariant(variantName);
      setIsVariantEditMode(true);
      setSelectedFieldId(null);
    },
    [activeForm, setSelectedVariant, setIsVariantEditMode, setSelectedFieldId]
  );

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
    (variantName: string) => {
      if (!activeForm || variantName === "ALL") return;
      setSelectedVariant("ALL");
      setIsVariantEditMode(false);
    },
    [activeForm, setSelectedVariant, setIsVariantEditMode]
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

  const handleReorderFields = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!activeForm) return;
      const fields = reorderFieldsWithSections(activeForm.fields, fromIndex, toIndex);
      setActiveForm({ ...activeForm, fields, updatedAt: new Date().toISOString() });
      setIsDirty(true);
    },
    [activeForm, setActiveForm, setIsDirty]
  );

  const handleDuplicateField = useCallback(
    (id: string) => {
      if (!activeForm) return;
      const fields = duplicateFieldWithSection(activeForm.fields, id, selectedVariant);
      setActiveForm({ ...activeForm, fields, updatedAt: new Date().toISOString() });
      setIsDirty(true);
    },
    [activeForm, selectedVariant, setActiveForm, setIsDirty]
  );

  const handleDeleteField = useCallback(
    (id: string) => {
      if (!activeForm) return;
      const fields = deleteFieldOrSectionForVariant(activeForm.fields, id, selectedVariant, allVariantNames);
      if (selectedFieldId !== null && !fields.some((f) => f.id === selectedFieldId)) setSelectedFieldId(null);
      setActiveForm({ ...activeForm, fields, updatedAt: new Date().toISOString() });
      setIsDirty(true);
    },
    [activeForm, selectedFieldId, selectedVariant, allVariantNames, setActiveForm, setSelectedFieldId, setIsDirty]
  );

  const handleUpdateField = useCallback(
    (fieldUpdates: Partial<FormField>) => {
      if (!activeForm || !selectedFieldId) return;
      const targetIndex = activeForm.fields.findIndex((f) => f.id === selectedFieldId);
      const targetField = targetIndex >= 0 ? activeForm.fields[targetIndex] : undefined;
      if (!targetField) return;

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
