import { useCallback, useState, MutableRefObject } from "react";
import { FormSchema, ServiceVariantToolbarItem, SharedChangesImpact } from "../types";
import { isRecord, isFormSchema } from "../utils/fieldDefaults";
import { convertBackendFormToSchema } from "../utils/schemaFromBackend";
import { convertSchemaToBackendSections } from "../utils/schemaToBackend";
import {
  findMatchingVariant,
  detectSharedChangesImpact,
} from "../utils/variantConditionUtils";
import { ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";
import { useFormBuilderService, UpdateFormRequest } from "@/services/formBuilderService";

export type PendingNavState =
  | { type: "list" }
  | { type: "variant"; variantName: string }
  | { type: "version"; targetFormId: string }
  | null;

function getHttpStatus(err: unknown): number | undefined {
  if (isRecord(err) && isRecord(err["response"]) && typeof err["response"]["status"] === "number") {
    return err["response"]["status"];
  }
  return undefined;
}

export function useFormSaveAndNavigation(params: {
  activeForm: FormSchema | null;
  setActiveForm: React.Dispatch<React.SetStateAction<FormSchema | null>>;
  setMasterBaseForm: React.Dispatch<React.SetStateAction<FormSchema | null>>;
  setSelectedFieldId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSaveConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsUnsavedDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pendingNav: PendingNavState;
  setPendingNav: React.Dispatch<React.SetStateAction<PendingNavState>>;
  setView: React.Dispatch<React.SetStateAction<"list" | "builder">>;
  setToast: React.Dispatch<React.SetStateAction<ToastMessage | null>>;
  originalFormRef: MutableRefObject<string | null>;
  formService: ReturnType<typeof useFormBuilderService>;
  mutate: () => Promise<unknown>;
  executeSelectVariant: (variantName: string) => Promise<void> | void;
  executeSwitchVersion: (targetFormId: string) => Promise<void>;
  handleSetActive: (form: FormSchema) => Promise<void>;
  selectedVariant?: string;
  backendServiceVariants?: ServiceVariantToolbarItem[];
  currentFormVariants?: ServiceVariantToolbarItem[];
  customizedVariantNames?: string[];
  masterBaseForm?: FormSchema | null;
}) {
  const {
    activeForm,
    setActiveForm,
    setMasterBaseForm,
    setSelectedFieldId,
    setIsDirty,
    setIsSaving,
    setIsSaveConfirmOpen,
    setIsUnsavedDialogOpen,
    pendingNav,
    setPendingNav,
    setView,
    setToast,
    originalFormRef,
    formService,
    mutate,
    executeSelectVariant,
    executeSwitchVersion,
    handleSetActive,
    selectedVariant = "ALL",
    backendServiceVariants,
    currentFormVariants = [],
    customizedVariantNames = [],
    masterBaseForm,
  } = params;
  const { getFormById, getVariantForm, createForm, updateForm, saveVariantForm } = formService;

  const [propagationImpact, setPropagationImpact] = useState<SharedChangesImpact | null>(null);
  const [isPropagationDialogOpen, setIsPropagationDialogOpen] = useState(false);

  const parseOriginalForm = useCallback((): FormSchema | null => {
    if (!originalFormRef.current) return null;
    try {
      const parsed: unknown = JSON.parse(originalFormRef.current);
      return isFormSchema(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, [originalFormRef]);

  const persistFormToBackend = useCallback(
    async (
      formToSave: FormSchema,
      propagateToCustomizedVariants = false
    ): Promise<{ success: boolean; message: string; form: FormSchema }> => {
      setIsSaving(true);
      try {
        // 1. Dedicated Per-Service-Variant Save Flow (`PUT /api/v2/service-variants/{variantId}/form`)
        if (selectedVariant && selectedVariant !== "ALL") {
          const matchedVariant = findMatchingVariant(backendServiceVariants, selectedVariant);
          if (
            matchedVariant?.id &&
            !matchedVariant.id.startsWith("var-") &&
            !matchedVariant.id.startsWith("default-")
          ) {
            const variantServiceId =
              matchedVariant.serviceId || formToSave.serviceId || masterBaseForm?.serviceId;
            if (!variantServiceId) {
              return {
                success: false,
                message: "Service Variant is missing an associated Service ID.",
                form: formToSave,
              };
            }

            const isExistingVariantVersion = Boolean(formToSave.isCustomized && formToSave.serviceVariantId);
            const targetIsActive = isExistingVariantVersion
              ? Boolean(formToSave.isActive ?? formToSave.isPublished)
              : true;

            const variantSections = convertSchemaToBackendSections(formToSave.fields, matchedVariant.id);
            const variantPayload: UpdateFormRequest = {
              id: formToSave.id,
              formId: isExistingVariantVersion ? formToSave.id : undefined,
              createNewVersion: false,
              serviceId: variantServiceId,
              key: `var_${matchedVariant.id}`,
              serviceVariantId: matchedVariant.id,
              baseFormId: masterBaseForm?.id || formToSave.baseFormId,
              name: `${matchedVariant.name} Form`,
              version: formToSave.version || "1.0",
              isActive: targetIsActive,
              categorySelectionRequired: false,
              sections: variantSections,
            };

            const saveVarRes = await saveVariantForm(matchedVariant.id, variantPayload);
            if (!saveVarRes || !saveVarRes.succeeded) {
              return {
                success: false,
                message: saveVarRes?.message || `Failed to save form for "${selectedVariant}".`,
                form: formToSave,
              };
            }

            let updatedVariantForm = formToSave;
            if (saveVarRes.data) {
              const freshVarSchema = convertBackendFormToSchema(saveVarRes.data);
              updatedVariantForm = {
                ...freshVarSchema,
                serviceName: freshVarSchema.serviceName || masterBaseForm?.serviceName || formToSave.serviceName,
                serviceCode: freshVarSchema.serviceCode || masterBaseForm?.serviceCode || formToSave.serviceCode,
                linkedServices: masterBaseForm?.linkedServices ?? formToSave.linkedServices,
                linkedVariants: masterBaseForm?.linkedVariants ?? formToSave.linkedVariants,
              };
              if (saveVarRes.data.customizedVariantIds) {
                setMasterBaseForm((prev) =>
                  prev ? { ...prev, customizedVariantIds: saveVarRes.data.customizedVariantIds } : prev
                );
              }
            }

            setActiveForm(updatedVariantForm);
            await mutate();

            const msg = targetIsActive
              ? `Saved "${selectedVariant}" (v${updatedVariantForm.version || "1.0"} — Active) and synced updates to All Sections & Fields.`
              : `Saved Draft v${updatedVariantForm.version || "1.0"} for "${selectedVariant}".`;

            return { success: true, message: msg, form: updatedVariantForm };
          }
        }

        // 2. Master Base Form ("All Sections & Fields") Save Flow (`PUT /api/v2/forms/{id}`)
        let current: FormSchema = propagateToCustomizedVariants
          ? {
              ...formToSave,
              fields: formToSave.fields.map((f) => ({
                ...f,
                variantOverrides: undefined,
                variantTitles: undefined,
              })),
            }
          : formToSave;

        if (!current.serviceId) {
          return {
            success: false,
            message: "Please associate this form template with an Application Type (Service) before saving.",
            form: current,
          };
        }

        const formMetadata = {
          description: current.description,
          linkedServices: current.linkedServices,
          linkedVariants: current.linkedVariants,
        };

        const resolvedKey = current.key || (current.serviceCode ? current.serviceCode : undefined);
        const isLiveVersion = Boolean(current.isActive ?? current.isPublished ?? true);

        const baseSections = convertSchemaToBackendSections(current.fields, undefined, formMetadata);
        const basePayload: UpdateFormRequest = {
          id: current.id,
          serviceId: current.serviceId,
          key: resolvedKey,
          serviceVariantId: undefined,
          baseFormId: undefined,
          name: current.name,
          version: current.version || "1.0",
          isActive: isLiveVersion,
          categorySelectionRequired: false,
          propagateToCustomizedVariants,
          sections: baseSections,
        };

        try {
          const updateRes = await updateForm(current.id, basePayload);
          if (updateRes && !updateRes.succeeded) {
            return {
              success: false,
              message: updateRes.message || "Failed to update form template.",
              form: current,
            };
          }
          if (updateRes && updateRes.succeeded && updateRes.data) {
            const freshSchema = convertBackendFormToSchema(updateRes.data);
            current = {
              ...freshSchema,
              name: current.name || freshSchema.name,
              description: current.description || freshSchema.description,
              serviceName: current.serviceName || freshSchema.serviceName,
              serviceCode: current.serviceCode || freshSchema.serviceCode,
              linkedServices: current.linkedServices ?? freshSchema.linkedServices,
              linkedVariants: current.linkedVariants ?? freshSchema.linkedVariants,
            };
          }
        } catch (updateErr: unknown) {
          if (getHttpStatus(updateErr) === 404) {
            try {
              const createRes = await createForm(basePayload);
              if (createRes && createRes.formId) {
                current = { ...current, id: createRes.formId };
              }
            } catch (createErr: unknown) {
              return {
                success: false,
                message: getErrorMessage(createErr, "Failed to create form on backend."),
                form: current,
              };
            }
          } else {
            return {
              success: false,
              message: getErrorMessage(updateErr, "Failed to update form on backend."),
              form: current,
            };
          }
        }

        setActiveForm(current);
        setMasterBaseForm(current);
        await mutate();

        const successMsg = propagateToCustomizedVariants
          ? "Saved Base Form and applied shared updates across all Service Variants."
          : "Form template saved successfully.";

        return { success: true, message: successMsg, form: current };
      } catch (err: unknown) {
        return {
          success: false,
          message: getErrorMessage(err, "An error occurred while saving the form."),
          form: formToSave,
        };
      } finally {
        setIsSaving(false);
      }
    },
    [
      updateForm,
      createForm,
      saveVariantForm,
      mutate,
      setActiveForm,
      setIsSaving,
      setMasterBaseForm,
      selectedVariant,
      backendServiceVariants,
      masterBaseForm,
    ]
  );

  const handleOpenSaveFlow = useCallback(() => {
    if (!activeForm) return;
    if (!selectedVariant || selectedVariant === "ALL") {
      const orig = parseOriginalForm();
      const impact = detectSharedChangesImpact(
        orig,
        activeForm,
        currentFormVariants,
        customizedVariantNames
      );
      if (impact.hasSharedUpdates) {
        setPropagationImpact(impact);
        setIsPropagationDialogOpen(true);
        return;
      }
    }
    setIsSaveConfirmOpen(true);
  }, [
    activeForm,
    selectedVariant,
    parseOriginalForm,
    currentFormVariants,
    customizedVariantNames,
    setIsSaveConfirmOpen,
  ]);

  const handleConfirmPropagationSave = async (propagateToCustomizedVariants: boolean) => {
    if (!activeForm) return;
    const result = await persistFormToBackend(activeForm, propagateToCustomizedVariants);
    setIsPropagationDialogOpen(false);
    setPropagationImpact(null);
    if (result.success) {
      originalFormRef.current = JSON.stringify(result.form);
      setIsDirty(false);
      setToast({ message: result.message, type: "success" });
    } else {
      setToast({ message: result.message || "Failed to save form.", type: "error" });
    }
  };

  const handleManualSave = async () => {
    if (!activeForm) return;
    const result = await persistFormToBackend(activeForm, false);
    setIsSaveConfirmOpen(false);
    if (result.success) {
      originalFormRef.current = JSON.stringify(result.form);
      setIsDirty(false);
      setToast({ message: result.message || "Form template saved successfully.", type: "success" });
    } else {
      setToast({ message: result.message || "Failed to save form.", type: "error" });
    }
  };

  const handleSwitchVersion = async (targetFormId: string, isDirty: boolean) => {
    if (targetFormId === activeForm?.id) return;
    if (isDirty) {
      setPendingNav({ type: "version", targetFormId });
      setIsUnsavedDialogOpen(true);
      return;
    }
    await executeSwitchVersion(targetFormId);
  };

  const handleSetActiveCurrent = async (hasUnsavedChanges = false) => {
    if (!activeForm) return;
    let targetForm = activeForm;
    if (hasUnsavedChanges) {
      const saveResult = await persistFormToBackend(activeForm, false);
      if (!saveResult.success) {
        setToast({ message: saveResult.message || "Failed to save draft changes before activating.", type: "error" });
        return;
      }
      targetForm = saveResult.form;
      originalFormRef.current = JSON.stringify(targetForm);
      setIsDirty(false);
    }

    await handleSetActive(targetForm);
    try {
      if (selectedVariant && selectedVariant !== "ALL") {
        const matchedVariant = findMatchingVariant(backendServiceVariants, selectedVariant);
        if (matchedVariant?.id && !matchedVariant.id.startsWith("var-") && !matchedVariant.id.startsWith("default-")) {
          const varRes = await getVariantForm(matchedVariant.id, targetForm.id);
          if (varRes && varRes.succeeded && varRes.data) {
            const freshVarSchema = convertBackendFormToSchema(varRes.data);
            const enrichedVarSchema: FormSchema = {
              ...freshVarSchema,
              serviceName: freshVarSchema.serviceName || masterBaseForm?.serviceName,
              serviceCode: freshVarSchema.serviceCode || masterBaseForm?.serviceCode,
              linkedServices: masterBaseForm?.linkedServices,
              linkedVariants: masterBaseForm?.linkedVariants,
            };
            setActiveForm(enrichedVarSchema);
            originalFormRef.current = JSON.stringify(enrichedVarSchema);
            setIsDirty(false);
          }
          return;
        }
      }

      const res = await getFormById(targetForm.id);
      if (res && res.succeeded && res.data) {
        const freshSchema = convertBackendFormToSchema(res.data);
        setActiveForm(freshSchema);
        setMasterBaseForm(freshSchema);
        originalFormRef.current = JSON.stringify(freshSchema);
        setIsDirty(false);
      }
    } catch {
      // ignore
    }
  };

  const handleBackToList = (isDirty: boolean) => {
    if (isDirty) {
      setPendingNav({ type: "list" });
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
    const result = await persistFormToBackend(activeForm, false);
    if (result.success) {
      originalFormRef.current = JSON.stringify(result.form);
      setIsDirty(false);
      setIsUnsavedDialogOpen(false);
      const nav = pendingNav;
      setPendingNav(null);
      if (nav?.type === "variant") await executeSelectVariant(nav.variantName);
      else if (nav?.type === "version") await executeSwitchVersion(nav.targetFormId);
      else {
        setView("list");
        setActiveForm(null);
        setSelectedFieldId(null);
        setToast({ message: "Form template saved successfully.", type: "success" });
      }
    } else {
      setToast({ message: result.message || "Failed to save form.", type: "error" });
    }
  };

  const handleDiscardAndExit = () => {
    setIsDirty(false);
    setIsUnsavedDialogOpen(false);
    const nav = pendingNav;
    setPendingNav(null);
    if (nav?.type === "variant") void executeSelectVariant(nav.variantName);
    else if (nav?.type === "version") void executeSwitchVersion(nav.targetFormId);
    else {
      setView("list");
      setActiveForm(null);
      setSelectedFieldId(null);
      setToast({ message: "Unsaved modifications discarded.", type: "info" });
    }
  };

  return {
    persistFormToBackend,
    propagationImpact,
    isPropagationDialogOpen,
    setIsPropagationDialogOpen,
    handleOpenSaveFlow,
    handleConfirmPropagationSave,
    handleManualSave,
    handleSwitchVersion,
    handleSetActiveCurrent,
    handleBackToList,
    handleSaveAndExit,
    handleDiscardAndExit,
  };
}
