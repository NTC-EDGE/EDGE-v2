import { useCallback, MutableRefObject } from "react";
import { FormSchema, FormField, FieldType, ServiceVariantToolbarItem } from "../types";
import { createDefaultField, isFormSchema } from "../utils/fieldDefaults";
import { reorderFieldsWithSections, duplicateFieldWithSection } from "../utils/fieldOperations";
import { convertBackendFormToSchema } from "../utils/schemaFromBackend";
import {
  deleteFieldWithSection,
  deleteFieldOrSectionForVariant,
  resetVariantToBaseFields,
  isExclusiveToVariant,
  applyVariantPropertyOverride,
  getVariantsUsingField,
  getVariantsUsingSection,
  findMatchingVariant,
} from "../utils/variantConditionUtils";
import { ToastMessage } from "@/components/ui/toast-notification";
import { useFormBuilderService } from "@/services/formBuilderService";
import { PendingNavState } from "./useFormSaveAndNavigation";

export interface BlockedDeletionNotice {
  itemTitle: string;
  itemKind: "section" | "field";
  usedByVariantNames: string[];
}

export function useBuilderFieldActions(params: {
  activeForm: FormSchema | null;
  setActiveForm: React.Dispatch<React.SetStateAction<FormSchema | null>>;
  setMasterBaseForm?: React.Dispatch<React.SetStateAction<FormSchema | null>>;
  setIsLoadingWorkspace?: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFieldId: string | null;
  setSelectedFieldId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedVariant: string;
  setSelectedVariant: React.Dispatch<React.SetStateAction<string>>;
  setIsVariantEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  setToast: React.Dispatch<React.SetStateAction<ToastMessage | null>>;
  allVariantNames: string[];
  currentFormVariants?: ServiceVariantToolbarItem[];
  originalFormRef: MutableRefObject<string | null>;
  masterBaseForm?: FormSchema | null;
  backendServiceVariants?: ServiceVariantToolbarItem[];
  formService?: ReturnType<typeof useFormBuilderService>;
  mutate?: () => Promise<unknown>;
  setPendingNav?: React.Dispatch<React.SetStateAction<PendingNavState>>;
  setIsUnsavedDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setBlockedDeletion?: React.Dispatch<React.SetStateAction<BlockedDeletionNotice | null>>;
  isDirty?: boolean;
}) {
  const {
    activeForm,
    setActiveForm,
    setMasterBaseForm,
    setIsLoadingWorkspace,
    selectedFieldId,
    setSelectedFieldId,
    selectedVariant,
    setSelectedVariant,
    setIsVariantEditMode,
    setIsDirty,
    setToast,
    allVariantNames,
    currentFormVariants = [],
    originalFormRef,
    masterBaseForm,
    backendServiceVariants,
    formService,
    mutate,
    setPendingNav,
    setIsUnsavedDialogOpen,
    setBlockedDeletion,
    isDirty,
  } = params;

  const isDedicatedVariantLoaded = Boolean(
    selectedVariant && selectedVariant !== "ALL" && activeForm?.serviceVariantId
  );

  const executeSelectVariant = useCallback(
    async (variantName: string) => {
      setSelectedFieldId(null);

      // 1. Switching back to "All Sections & Fields" ("ALL"): load fresh Master Base Form superset
      if (!variantName || variantName === "ALL") {
        setSelectedVariant("ALL");
        setIsVariantEditMode(false);

        const baseId = masterBaseForm?.id || activeForm?.baseFormId || activeForm?.id;
        if (baseId && formService?.getFormWorkspace) {
          setIsLoadingWorkspace?.(true);
          try {
            const wsRes = await formService.getFormWorkspace(baseId).catch(() => null);
            if (wsRes && wsRes.succeeded && wsRes.data) {
              const freshBase = convertBackendFormToSchema(wsRes.data.form);
              const mergedBase: FormSchema = {
                ...freshBase,
                name: freshBase.name || masterBaseForm?.name || "",
                description: freshBase.description || masterBaseForm?.description || "",
                serviceName: freshBase.serviceName || masterBaseForm?.serviceName,
                serviceCode: freshBase.serviceCode || masterBaseForm?.serviceCode,
              };
              setActiveForm(mergedBase);
              setMasterBaseForm?.(mergedBase);
              originalFormRef.current = JSON.stringify(mergedBase);
              setIsDirty(false);
              return;
            }
          } finally {
            setIsLoadingWorkspace?.(false);
          }
        }

        if (masterBaseForm) {
          setActiveForm(masterBaseForm);
          originalFormRef.current = JSON.stringify(masterBaseForm);
          setIsDirty(false);
        }
        return;
      }

      // 2. Clicking a specific Service Variant: make a dedicated API call to load ONLY its needed sections & fields!
      setSelectedVariant(variantName);
      setIsVariantEditMode(true);

      const matchedVariant = findMatchingVariant(backendServiceVariants, variantName);
      if (
        matchedVariant?.id &&
        !matchedVariant.id.startsWith("var-") &&
        !matchedVariant.id.startsWith("default-") &&
        formService?.getVariantForm
      ) {
        setIsLoadingWorkspace?.(true);
        try {
          const varRes = await formService.getVariantForm(matchedVariant.id).catch(() => null);
          if (varRes && varRes.succeeded && varRes.data) {
            const variantSchema = convertBackendFormToSchema(varRes.data);
            const enrichedVariantSchema: FormSchema = {
              ...variantSchema,
              serviceName: variantSchema.serviceName || masterBaseForm?.serviceName || activeForm?.serviceName,
              serviceCode: variantSchema.serviceCode || masterBaseForm?.serviceCode || activeForm?.serviceCode,
              linkedServices: masterBaseForm?.linkedServices ?? activeForm?.linkedServices,
              linkedVariants: masterBaseForm?.linkedVariants ?? activeForm?.linkedVariants,
            };
            setActiveForm(enrichedVariantSchema);
            originalFormRef.current = JSON.stringify(enrichedVariantSchema);
            setIsDirty(false);
          }
        } finally {
          setIsLoadingWorkspace?.(false);
        }
      }
    },
    [
      activeForm,
      masterBaseForm,
      backendServiceVariants,
      formService,
      originalFormRef,
      setActiveForm,
      setMasterBaseForm,
      setIsLoadingWorkspace,
      setSelectedVariant,
      setIsVariantEditMode,
      setSelectedFieldId,
      setIsDirty,
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

  const handleCustomizeVariant = useCallback(
    (v: string) => {
      if (!activeForm || v === "ALL") return;
      void executeSelectVariant(v);
    },
    [activeForm, executeSelectVariant]
  );

  const handleResetFromBaseForm = useCallback(async () => {
    if (!activeForm || selectedVariant === "ALL") return;
    const matchedVariant = findMatchingVariant(backendServiceVariants, selectedVariant);
    if (
      matchedVariant?.id &&
      !matchedVariant.id.startsWith("var-") &&
      !matchedVariant.id.startsWith("default-") &&
      formService?.revertVariantForm
    ) {
      await formService.revertVariantForm(matchedVariant.id).catch(() => null);
      const baseId = masterBaseForm?.id || activeForm.baseFormId || activeForm.id;
      if (baseId && formService.getFormWorkspace) {
        const wsRes = await formService.getFormWorkspace(baseId).catch(() => null);
        if (wsRes && wsRes.succeeded && wsRes.data) {
          const freshBase = convertBackendFormToSchema(wsRes.data.form);
          setMasterBaseForm?.((prev) => ({
            ...freshBase,
            name: freshBase.name || prev?.name || "",
            description: freshBase.description || prev?.description || "",
            serviceName: freshBase.serviceName || prev?.serviceName,
            serviceCode: freshBase.serviceCode || prev?.serviceCode,
            customizedVariantIds: freshBase.customizedVariantIds,
          }));
        }
      } else {
        setMasterBaseForm?.((prev) =>
          prev
            ? {
                ...prev,
                customizedVariantIds: (prev.customizedVariantIds ?? []).filter(
                  (id) => id.toLowerCase() !== matchedVariant.id.toLowerCase()
                ),
              }
            : prev
        );
      }
      await mutate?.();
      await executeSelectVariant(selectedVariant);
      setToast({
        message: `Reset "${selectedVariant}" back to the Base Form blueprint.`,
        type: "info",
      });
      return;
    }

    const sourceFields = (masterBaseForm ?? activeForm).fields;
    const restoredFields = resetVariantToBaseFields(sourceFields, selectedVariant, allVariantNames);
    const updated: FormSchema = { ...activeForm, fields: restoredFields, updatedAt: new Date().toISOString() };
    setActiveForm(updated);
    setIsDirty(true);
    setSelectedFieldId(null);
    setToast({
      message: `Restored Base Form sections and fields for "${selectedVariant}". Click Save Changes to persist.`,
      type: "info",
    });
  }, [
    activeForm,
    masterBaseForm,
    selectedVariant,
    allVariantNames,
    backendServiceVariants,
    formService,
    mutate,
    executeSelectVariant,
    setActiveForm,
    setMasterBaseForm,
    setIsDirty,
    setSelectedFieldId,
    setToast,
  ]);

  const handleRevertVariantToBase = useCallback(
    async (v: string) => {
      if (!activeForm || v === "ALL") return;

      const matchedVariant = findMatchingVariant(backendServiceVariants, v);
      if (
        matchedVariant?.id &&
        !matchedVariant.id.startsWith("var-") &&
        !matchedVariant.id.startsWith("default-") &&
        formService?.revertVariantForm
      ) {
        try {
          const res = await formService.revertVariantForm(matchedVariant.id);
          if (res && res.succeeded) {
            await mutate?.();
            setToast({
              message: `Variant "${v}" reverted to Base Form template.`,
              type: "success",
            });
            await executeSelectVariant("ALL");
            return;
          }
        } catch {
          setToast({
            message: "Failed to revert variant form on backend.",
            type: "error",
          });
        }
      }

      const cleanedFields = resetVariantToBaseFields(activeForm.fields, v, allVariantNames);
      const updated: FormSchema = { ...activeForm, fields: cleanedFields, updatedAt: new Date().toISOString() };
      setActiveForm(updated);
      setMasterBaseForm?.(updated);
      setIsDirty(true);
      setSelectedVariant("ALL");
      setIsVariantEditMode(false);
    },
    [
      activeForm,
      allVariantNames,
      backendServiceVariants,
      formService,
      executeSelectVariant,
      setToast,
      mutate,
      setActiveForm,
      setMasterBaseForm,
      setSelectedVariant,
      setIsVariantEditMode,
      setIsDirty,
    ]
  );

  const handleUpdateForm = useCallback(
    (updates: Partial<FormSchema>) => {
      if (!activeForm) return;
      const next: FormSchema = { ...activeForm, ...updates, updatedAt: new Date().toISOString() };
      setActiveForm(next);
      if (!selectedVariant || selectedVariant === "ALL") {
        setMasterBaseForm?.(next);
      }
      setIsDirty(true);
    },
    [activeForm, selectedVariant, setActiveForm, setMasterBaseForm, setIsDirty]
  );

  const handleAddField = useCallback(
    (type: FieldType, atIndex?: number) => {
      if (!activeForm) return;
      const baseField = createDefaultField(type);
      const newField: FormField =
        selectedVariant !== "ALL" && !isDedicatedVariantLoaded
          ? {
              ...baseField,
              condition: { variants: [selectedVariant] },
              visibilityCondition: JSON.stringify({ variants: [selectedVariant] }),
            }
          : baseField;

      const fields = [...activeForm.fields];
      if (atIndex !== undefined) {
        fields.splice(atIndex, 0, newField);
      } else if (type !== "section-header" && selectedFieldId !== null) {
        const selectedIdx = fields.findIndex((f) => f.id === selectedFieldId);
        if (selectedIdx >= 0) {
          if (fields[selectedIdx]?.type === "section-header") {
            let sectionEndIdx = selectedIdx + 1;
            while (sectionEndIdx < fields.length && fields[sectionEndIdx]?.type !== "section-header") {
              sectionEndIdx++;
            }
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
      const nextForm: FormSchema = { ...activeForm, fields, updatedAt: new Date().toISOString() };
      setActiveForm(nextForm);
      if (!selectedVariant || selectedVariant === "ALL") {
        setMasterBaseForm?.(nextForm);
      }
      setSelectedFieldId(newField.id);
      setIsDirty(true);
    },
    [
      activeForm,
      selectedFieldId,
      selectedVariant,
      isDedicatedVariantLoaded,
      setActiveForm,
      setMasterBaseForm,
      setSelectedFieldId,
      setIsDirty,
    ]
  );

  const handleReorderFields = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!activeForm) return;
      const nextForm: FormSchema = {
        ...activeForm,
        fields: reorderFieldsWithSections(activeForm.fields, fromIndex, toIndex),
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(nextForm);
      if (!selectedVariant || selectedVariant === "ALL") {
        setMasterBaseForm?.(nextForm);
      }
      setIsDirty(true);
    },
    [activeForm, selectedVariant, setActiveForm, setMasterBaseForm, setIsDirty]
  );

  const handleDuplicateField = useCallback(
    (id: string) => {
      if (!activeForm) return;
      const effectiveScope = isDedicatedVariantLoaded ? "ALL" : selectedVariant;
      const nextForm: FormSchema = {
        ...activeForm,
        fields: duplicateFieldWithSection(activeForm.fields, id, effectiveScope),
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(nextForm);
      if (!selectedVariant || selectedVariant === "ALL") {
        setMasterBaseForm?.(nextForm);
      }
      setIsDirty(true);
    },
    [activeForm, selectedVariant, isDedicatedVariantLoaded, setActiveForm, setMasterBaseForm, setIsDirty]
  );

  const handleDeleteField = useCallback(
    (id: string) => {
      if (!activeForm) return;

      // Strict Deletion Protection in "All Sections & Fields":
      // Disallow deleting any Section or Form Field if it is currently used by >= 1 Service Variant!
      if (!selectedVariant || selectedVariant === "ALL") {
        if (id === "default-section") {
          let firstSecIdx = 0;
          while (firstSecIdx < activeForm.fields.length && activeForm.fields[firstSecIdx]?.type !== "section-header") {
            firstSecIdx++;
          }
          const childBlock = activeForm.fields.slice(0, firstSecIdx);
          const usingVars = getVariantsUsingSection(null, childBlock, currentFormVariants);
          if (usingVars.length > 0) {
            const names = usingVars.map((v) => v.name);
            if (setBlockedDeletion) {
              setBlockedDeletion({
                itemTitle: "General Information",
                itemKind: "section",
                usedByVariantNames: names,
              });
            } else {
              setToast({
                message: `Cannot delete section "General Information" in All Sections because it is used by ${names.length} Service Variant(s).`,
                type: "error",
              });
            }
            return;
          }
        } else {
          const targetIdx = activeForm.fields.findIndex((f) => f.id === id);
          const targetField = targetIdx >= 0 ? activeForm.fields[targetIdx] : undefined;
          if (targetField && targetField.type !== "divider") {
            if (targetField.type === "section-header") {
              let blockEnd = targetIdx + 1;
              while (blockEnd < activeForm.fields.length && activeForm.fields[blockEnd]?.type !== "section-header") {
                blockEnd++;
              }
              const childBlock = activeForm.fields.slice(targetIdx + 1, blockEnd);
              const usingVars = getVariantsUsingSection(targetField, childBlock, currentFormVariants);
              if (usingVars.length > 0) {
                const names = usingVars.map((v) => v.name);
                const secTitle = targetField.sectionTitle || targetField.label || "Untitled Section";
                if (setBlockedDeletion) {
                  setBlockedDeletion({
                    itemTitle: secTitle,
                    itemKind: "section",
                    usedByVariantNames: names,
                  });
                } else {
                  setToast({
                    message: `Cannot delete section "${secTitle}" in All Sections because it is used by ${names.length} Service Variant(s).`,
                    type: "error",
                  });
                }
                return;
              }
            } else {
              const usingVars = getVariantsUsingField(targetField, currentFormVariants);
              if (usingVars.length > 0) {
                const names = usingVars.map((v) => v.name);
                if (setBlockedDeletion) {
                  setBlockedDeletion({
                    itemTitle: targetField.label || "Untitled Field",
                    itemKind: "field",
                    usedByVariantNames: names,
                  });
                } else {
                  setToast({
                    message: `Cannot delete "${targetField.label}" in All Sections because it is used by ${names.length} Service Variant(s). Remove it from those Service Variants first.`,
                    type: "error",
                  });
                }
                return;
              }
            }
          }
        }
      }

      const fields = isDedicatedVariantLoaded
        ? deleteFieldWithSection(activeForm.fields, id)
        : deleteFieldOrSectionForVariant(activeForm.fields, id, selectedVariant, allVariantNames);

      if (selectedFieldId !== null && !fields.some((f) => f.id === selectedFieldId)) {
        setSelectedFieldId(null);
      }
      const nextForm: FormSchema = { ...activeForm, fields, updatedAt: new Date().toISOString() };
      setActiveForm(nextForm);
      if (!selectedVariant || selectedVariant === "ALL") {
        setMasterBaseForm?.(nextForm);
      }
      setIsDirty(true);
    },
    [
      activeForm,
      selectedFieldId,
      selectedVariant,
      isDedicatedVariantLoaded,
      allVariantNames,
      currentFormVariants,
      setActiveForm,
      setMasterBaseForm,
      setSelectedFieldId,
      setIsDirty,
      setBlockedDeletion,
      setToast,
    ]
  );

  const handleUpdateField = useCallback(
    (fieldUpdates: Partial<FormField>) => {
      if (!activeForm || !selectedFieldId) return;
      const targetIndex = activeForm.fields.findIndex((f) => f.id === selectedFieldId);
      const targetField = targetIndex >= 0 ? activeForm.fields[targetIndex] : undefined;
      if (!targetField) return;

      // When editing inside a dedicated variant schema loaded via API, update fields directly!
      if (isDedicatedVariantLoaded) {
        let normalizedUpdates = fieldUpdates;
        if (targetField.type === "section-header" && fieldUpdates.variantTitles?.[selectedVariant]) {
          const customTitle = fieldUpdates.variantTitles[selectedVariant];
          normalizedUpdates = { label: customTitle, sectionTitle: customTitle };
        }
        const fields = activeForm.fields.map((f) =>
          f.id === selectedFieldId ? { ...f, ...normalizedUpdates } : f
        );
        const nextForm: FormSchema = { ...activeForm, fields, updatedAt: new Date().toISOString() };
        setActiveForm(nextForm);
        setIsDirty(true);
        return;
      }

      if (selectedVariant !== "ALL" && targetField.type === "section-header") {
        if ("sectionTitle" in fieldUpdates || "label" in fieldUpdates || "variantTitles" in fieldUpdates) {
          const nextTitle =
            fieldUpdates.variantTitles?.[selectedVariant] ??
            fieldUpdates.sectionTitle ??
            fieldUpdates.label ??
            targetField.variantTitles?.[selectedVariant] ??
            targetField.sectionTitle ??
            targetField.label ??
            "";
          const nextVariantTitles: Record<string, string> = {
            ...(targetField.variantTitles ?? {}),
            [selectedVariant]: nextTitle,
          };
          const updatedField: FormField = { ...targetField, variantTitles: nextVariantTitles };
          const fields = activeForm.fields.map((f) => (f.id === selectedFieldId ? updatedField : f));
          const nextForm: FormSchema = { ...activeForm, fields, updatedAt: new Date().toISOString() };
          setActiveForm(nextForm);
          setMasterBaseForm?.(nextForm);
          setIsDirty(true);
          return;
        }
      }

      const isConditionUpdate = "condition" in fieldUpdates || "visibilityCondition" in fieldUpdates;
      if (
        selectedVariant !== "ALL" &&
        !isConditionUpdate &&
        targetField.type !== "section-header" &&
        !isExclusiveToVariant(targetField, selectedVariant)
      ) {
        const overriddenField = applyVariantPropertyOverride(targetField, selectedVariant, fieldUpdates);
        const fields = activeForm.fields.map((f) => (f.id === selectedFieldId ? overriddenField : f));
        const nextForm: FormSchema = { ...activeForm, fields, updatedAt: new Date().toISOString() };
        setActiveForm(nextForm);
        setMasterBaseForm?.(nextForm);
        setIsDirty(true);
        return;
      }

      const fields = activeForm.fields.map((f) => (f.id === selectedFieldId ? { ...f, ...fieldUpdates } : f));
      const nextForm: FormSchema = { ...activeForm, fields, updatedAt: new Date().toISOString() };
      setActiveForm(nextForm);
      setMasterBaseForm?.(nextForm);
      setIsDirty(true);
    },
    [activeForm, selectedFieldId, selectedVariant, isDedicatedVariantLoaded, setActiveForm, setMasterBaseForm, setIsDirty]
  );

  const handleResetChanges = useCallback(() => {
    if (!originalFormRef.current) return;
    try {
      const parsed: unknown = JSON.parse(originalFormRef.current);
      if (isFormSchema(parsed)) {
        setActiveForm(parsed);
        if (!selectedVariant || selectedVariant === "ALL") {
          setMasterBaseForm?.(parsed);
        }
        setSelectedFieldId(null);
        setIsDirty(false);
        setToast({ message: "Unsaved changes reverted to last saved version.", type: "info" });
      }
    } catch {
      // ignore
    }
  }, [originalFormRef, selectedVariant, setActiveForm, setMasterBaseForm, setSelectedFieldId, setIsDirty, setToast]);

  return {
    executeSelectVariant,
    handleSelectVariant,
    handleCustomizeVariant,
    handleResetFromBaseForm,
    handleRevertVariantToBase,
    handleUpdateForm,
    handleAddField,
    handleReorderFields,
    handleDuplicateField,
    handleDeleteField,
    handleUpdateField,
    handleResetChanges,
  };
}
