import { MutableRefObject } from "react";
import { FormSchema } from "../types";
import { generateId, convertBackendFormToSchema } from "../utils";
import { ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";
import { useFormBuilderService } from "@/services/formBuilderService";

export function useFormPersistenceAndLifecycle(params: {
  activeForm: FormSchema | null;
  setActiveForm: React.Dispatch<React.SetStateAction<FormSchema | null>>;
  setMasterBaseForm: React.Dispatch<React.SetStateAction<FormSchema | null>>;
  setSelectedFieldId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedVariant: React.Dispatch<React.SetStateAction<string>>;
  setIsVariantEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  setView: React.Dispatch<React.SetStateAction<"list" | "builder">>;
  setPreviewForm: React.Dispatch<React.SetStateAction<FormSchema | null>>;
  setIsCreateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteTarget: FormSchema | null;
  setDeleteTarget: React.Dispatch<React.SetStateAction<FormSchema | null>>;
  setToast: React.Dispatch<React.SetStateAction<ToastMessage | null>>;
  originalFormRef: MutableRefObject<string | null>;
  backendForms: FormSchema[];
  formService: ReturnType<typeof useFormBuilderService>;
  mutate: () => Promise<unknown>;
}) {
  const {
    activeForm, setActiveForm, setMasterBaseForm, setSelectedFieldId, setSelectedVariant,
    setIsVariantEditMode, setIsDirty, setView, setPreviewForm, setIsCreateDialogOpen,
    deleteTarget, setDeleteTarget, setToast, originalFormRef, backendForms, formService, mutate,
  } = params;
  const { getFormById, deleteForm, duplicateForm, activateForm } = formService;

  const handleOpenEditor = async (form: FormSchema) => {
    const isVariant = Boolean(form.serviceVariantId || form.baseFormId);
    if (!isVariant) {
      setMasterBaseForm(form);
      setSelectedVariant("ALL");
    } else {
      const foundBase =
        backendForms.find((b) => !b.serviceVariantId && !b.baseFormId && b.serviceId === form.serviceId) ||
        backendForms.find((b) => form.baseFormId && b.id === form.baseFormId);
      setMasterBaseForm(foundBase || form);
      setSelectedVariant(form.serviceVariantName || "Variant");
    }
    setActiveForm(form);
    setSelectedFieldId(null);
    setIsVariantEditMode(isVariant);
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
          if (!isVariant) setMasterBaseForm(combined);
          originalFormRef.current = JSON.stringify(combined);
          setIsDirty(false);
        }
      } catch { /* ignore */ }
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
      } catch { /* ignore */ }
    }
  };

  const handleCreateNew = (
    name: string, description: string, version: string, isActive: boolean, serviceId?: string, serviceName?: string
  ) => {
    const now = new Date().toISOString();
    const newForm: FormSchema = {
      id: generateId(), name, description, version: version || "1.0", serviceId, serviceName,
      fields: [], createdAt: now, updatedAt: now, isPublished: isActive, isActive,
    };
    setIsCreateDialogOpen(false);
    void handleOpenEditor(newForm);
    setToast({
      message: `Form (v${newForm.version}) created. Add fields and click Save Changes to save to backend!`,
      type: "info",
    });
  };

  const handleDuplicateForm = async (form: FormSchema) => {
    const curVer = form.version || "1.0";
    const allNums = (form.availableVersions ?? []).map((v) => parseFloat(v.version)).filter((n) => !isNaN(n));
    const curNum = parseFloat(curVer);
    if (!isNaN(curNum)) allNums.push(curNum);
    const maxVer = allNums.length > 0 ? Math.max(...allNums) : NaN;
    const nextVer = !isNaN(maxVer) ? `${(Math.floor(maxVer) + 1).toFixed(1)}` : `${curVer}-copy`;

    try {
      const dupRes = await duplicateForm(form.id, nextVer);
      if (dupRes && dupRes.succeeded) {
        await mutate();
        if (activeForm && activeForm.id === form.id) {
          const res = await getFormById(form.id).catch(() => null);
          if (res && res.succeeded && res.data) {
            const freshSchema = convertBackendFormToSchema(res.data);
            setActiveForm((prev) => (prev ? { ...prev, availableVersions: freshSchema.availableVersions } : prev));
          }
        }
        setToast({ message: `Created new draft version v${nextVer}.`, type: "success" });
      } else {
        setToast({ message: dupRes?.message || "Failed to duplicate form version.", type: "error" });
      }
    } catch (err: unknown) {
      setToast({ message: getErrorMessage(err, "Failed to duplicate form version."), type: "error" });
    }
  };

  const handleSetActive = async (form: FormSchema) => {
    if (!form.serviceId) return;
    try {
      const res = await activateForm(form.id);
      if (res && res.succeeded) {
        setToast({ message: `"${form.name}" (v${form.version || "1.0"}) is now live as active.`, type: "success" });
        await mutate();
      } else {
        setToast({ message: res?.message || "Failed to set form as active.", type: "error" });
      }
    } catch (err: unknown) {
      setToast({ message: getErrorMessage(err, "Failed to set form as active."), type: "error" });
    }
  };

  const handleDeleteFormConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.serviceId) {
        await deleteForm(deleteTarget.id);
        await mutate();
      }
      if (activeForm?.id === deleteTarget.id) {
        setActiveForm(null);
        setView("list");
        setIsDirty(false);
      }
      setToast({ message: "Form deleted from backend.", type: "success" });
    } catch (err: unknown) {
      setToast({ message: getErrorMessage(err, "Failed to delete form."), type: "error" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const executeSwitchVersion = async (targetFormId: string) => {
    if (targetFormId === activeForm?.id) return;
    try {
      const res = await getFormById(targetFormId);
      if (res && res.succeeded && res.data) {
        const freshSchema = convertBackendFormToSchema(res.data);
        setActiveForm(freshSchema);
        originalFormRef.current = JSON.stringify(freshSchema);
        setSelectedFieldId(null);
        setSelectedVariant("ALL");
        setIsVariantEditMode(false);
        setIsDirty(false);
        setToast({ message: `Switched to version v${freshSchema.version || "1.0"}.`, type: "info" });
      }
    } catch {
      setToast({ message: "Failed to load the selected form version.", type: "error" });
    }
  };

  return {
    handleOpenEditor, handleOpenPreview, handleCreateNew, handleDuplicateForm,
    handleSetActive, handleDeleteFormConfirm, executeSwitchVersion,
  };
}
