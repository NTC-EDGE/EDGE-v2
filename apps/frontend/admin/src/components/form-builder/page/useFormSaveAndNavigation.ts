import { useCallback, MutableRefObject } from "react";
import { FormSchema } from "../types";
import { convertBackendFormToSchema, convertSchemaToBackendSections, isRecord } from "../utils";
import { ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";
import { useFormBuilderService } from "@/services/formBuilderService";

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
  executeSelectVariant: (variantName: string) => void;
  executeSwitchVersion: (targetFormId: string) => Promise<void>;
  handleSetActive: (form: FormSchema) => Promise<void>;
}) {
  const {
    activeForm, setActiveForm, setMasterBaseForm, setSelectedFieldId, setIsDirty, setIsSaving,
    setIsSaveConfirmOpen, setIsUnsavedDialogOpen, pendingNav, setPendingNav, setView, setToast,
    originalFormRef, formService, mutate, executeSelectVariant, executeSwitchVersion, handleSetActive,
  } = params;
  const { getFormById, createForm, updateForm } = formService;

  const persistFormToBackend = useCallback(
    async (formToSave: FormSchema): Promise<{ success: boolean; message: string; form: FormSchema }> => {
      setIsSaving(true);
      try {
        let current = formToSave;
        if (!formToSave.serviceId) {
          return {
            success: false,
            message: "Please associate this form template with an Application Type (Service) before saving.",
            form: current,
          };
        }
        const sections = convertSchemaToBackendSections(formToSave.fields);
        const resolvedKey = formToSave.key || (formToSave.serviceCode ? formToSave.serviceCode : undefined);
        const payload = {
          serviceId: formToSave.serviceId,
          key: resolvedKey,
          serviceVariantId: undefined,
          baseFormId: undefined,
          name: formToSave.name,
          version: formToSave.version || "1.0",
          isActive: formToSave.isPublished ?? formToSave.isActive ?? false,
          categorySelectionRequired: false,
          sections,
        };

        try {
          const updateRes = await updateForm(formToSave.id, { id: formToSave.id, ...payload });
          if (updateRes && updateRes.succeeded) {
            await mutate();
            setMasterBaseForm(current);
            return { success: true, message: updateRes.message || "Form template updated successfully.", form: current };
          }
          if (updateRes && !updateRes.succeeded) {
            return { success: false, message: updateRes.message || "Failed to update form template.", form: current };
          }
        } catch (updateErr: unknown) {
          if (getHttpStatus(updateErr) === 404) {
            try {
              const createRes = await createForm(payload);
              if (createRes && createRes.formId) {
                current = { ...formToSave, id: createRes.formId };
                setActiveForm(current);
                await mutate();
                setMasterBaseForm(current);
                return { success: true, message: "Form template created and saved successfully.", form: current };
              }
            } catch (createErr: unknown) {
              return { success: false, message: getErrorMessage(createErr, "Failed to create form on backend."), form: current };
            }
          } else {
            return { success: false, message: getErrorMessage(updateErr, "Failed to update form on backend."), form: current };
          }
        }
        return { success: true, message: "Form template saved successfully.", form: current };
      } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err, "An error occurred while saving the form."), form: formToSave };
      } finally {
        setIsSaving(false);
      }
    },
    [updateForm, createForm, mutate, setActiveForm, setIsSaving, setMasterBaseForm]
  );

  const handleManualSave = async () => {
    if (!activeForm) return;
    const result = await persistFormToBackend(activeForm);
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

  const handleSetActiveCurrent = async () => {
    if (!activeForm) return;
    await handleSetActive(activeForm);
    try {
      const res = await getFormById(activeForm.id);
      if (res && res.succeeded && res.data) {
        const freshSchema = convertBackendFormToSchema(res.data);
        setActiveForm(freshSchema);
        originalFormRef.current = JSON.stringify(freshSchema);
      }
    } catch { /* ignore */ }
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
    const result = await persistFormToBackend(activeForm);
    if (result.success) {
      setIsDirty(false);
      setIsUnsavedDialogOpen(false);
      const nav = pendingNav;
      setPendingNav(null);
      if (nav?.type === "variant") executeSelectVariant(nav.variantName);
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
    if (nav?.type === "variant") executeSelectVariant(nav.variantName);
    else if (nav?.type === "version") void executeSwitchVersion(nav.targetFormId);
    else {
      setView("list");
      setActiveForm(null);
      setSelectedFieldId(null);
      setToast({ message: "Unsaved modifications discarded.", type: "info" });
    }
  };

  return {
    persistFormToBackend, handleManualSave, handleSwitchVersion,
    handleSetActiveCurrent, handleBackToList, handleSaveAndExit, handleDiscardAndExit,
  };
}
