import { MutableRefObject } from "react";
import { FormSchema, LinkedServiceItem, ServiceVariantToolbarItem } from "../types";
import { generateId } from "../utils/fieldDefaults";
import { convertBackendFormToSchema } from "../utils/schemaFromBackend";
import { convertSchemaToBackendSections } from "../utils/schemaToBackend";
import {
  formatServiceVariantDisplayName,
  inferApplicationTypeFromVariantName,
  findMatchingVariant,
} from "../utils/variantConditionUtils";
import { ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";
import { useFormBuilderService } from "@/services/formBuilderService";
import { ServiceItem, ServiceVariantItem, useCatalogService } from "@/services/catalogService";

function mapVariantDtoToToolbarItem(v: ServiceVariantItem): ServiceVariantToolbarItem {
  const displayName = formatServiceVariantDisplayName(v.description, v.type);
  const sourceTag: ServiceVariantToolbarItem["source"] = "service";
  return {
    id: v.id,
    name: displayName,
    serviceId: v.serviceId,
    serviceName: v.serviceName,
    serviceCode: v.serviceCode,
    applicationType: inferApplicationTypeFromVariantName(displayName, v.type),
    source: sourceTag,
  };
}

export function useFormPersistenceAndLifecycle(params: {
  activeForm: FormSchema | null;
  masterBaseForm?: FormSchema | null;
  setActiveForm: React.Dispatch<React.SetStateAction<FormSchema | null>>;
  setMasterBaseForm: React.Dispatch<React.SetStateAction<FormSchema | null>>;
  setWorkspaceVariants: React.Dispatch<React.SetStateAction<ServiceVariantToolbarItem[]>>;
  setWorkspaceServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  setIsLoadingWorkspace: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedFieldId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedVariant: string;
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
  backendServiceVariants?: ServiceVariantToolbarItem[];
  currentFormVariants?: ServiceVariantToolbarItem[];
  formService: ReturnType<typeof useFormBuilderService>;
  catalogService: ReturnType<typeof useCatalogService>;
  mutate: () => Promise<unknown>;
}) {
  const {
    activeForm,
    masterBaseForm,
    setActiveForm,
    setMasterBaseForm,
    setWorkspaceVariants,
    setWorkspaceServices,
    setIsLoadingWorkspace,
    setSelectedFieldId,
    selectedVariant,
    setSelectedVariant,
    setIsVariantEditMode,
    setIsDirty,
    setView,
    setPreviewForm,
    setIsCreateDialogOpen,
    deleteTarget,
    setDeleteTarget,
    setToast,
    originalFormRef,
    backendServiceVariants = [],
    currentFormVariants = [],
    formService,
    catalogService,
    mutate,
  } = params;
  const {
    getFormById,
    getFormWorkspace,
    getVariantForm,
    saveVariantForm,
    deleteForm,
    duplicateForm,
    activateForm,
  } = formService;

  const handleOpenEditor = async (form: FormSchema, isNewlyCreated = false) => {
    setMasterBaseForm(form);
    setSelectedVariant("ALL");
    setIsVariantEditMode(false);
    setActiveForm(form);
    setSelectedFieldId(null);
    setIsDirty(false);
    setWorkspaceVariants([]);
    setWorkspaceServices([]);
    originalFormRef.current = JSON.stringify(form);
    setView("builder");

    if (isNewlyCreated) {
      if (form.serviceId) {
        setIsLoadingWorkspace(true);
        try {
          const varRes = await catalogService.getServiceVariantsByServiceId(form.serviceId).catch(() => null);
          if (varRes?.data) {
            setWorkspaceVariants(varRes.data.map(mapVariantDtoToToolbarItem));
          }
        } finally {
          setIsLoadingWorkspace(false);
        }
      }
      return;
    }

    if (form.id) {
      setIsLoadingWorkspace(true);
      try {
        const wsRes = await getFormWorkspace(form.id).catch(() => null);
        if (wsRes && wsRes.succeeded && wsRes.data) {
          const freshSchema = convertBackendFormToSchema(wsRes.data.form);
          const combined: FormSchema = {
            ...freshSchema,
            name: freshSchema.name || form.name,
            description: freshSchema.description || form.description,
            serviceName: freshSchema.serviceName || form.serviceName,
            serviceCode: freshSchema.serviceCode || form.serviceCode,
          };
          setActiveForm((prev) => (prev && prev.id === form.id ? combined : prev));
          setMasterBaseForm(combined);
          setWorkspaceServices(wsRes.data.linkedServices ?? []);
          setWorkspaceVariants((wsRes.data.serviceVariants ?? []).map(mapVariantDtoToToolbarItem));
          originalFormRef.current = JSON.stringify(combined);
          setIsDirty(false);
        }
      } finally {
        setIsLoadingWorkspace(false);
      }
    }
  };

  const handleLinkedServicesChanged = async (linkedServices: LinkedServiceItem[]) => {
    const realIds = linkedServices
      .map((s) => s.id)
      .filter((id) => Boolean(id && !id.startsWith("canonical-")));
    if (realIds.length === 0) return;

    setWorkspaceVariants((prev) => {
      const existingServiceIds = new Set(prev.map((v) => v.serviceId).filter(Boolean));
      const missingIds = realIds.filter((id) => !existingServiceIds.has(id));
      if (missingIds.length > 0) {
        void Promise.all(
          missingIds.map((id) => catalogService.getServiceVariantsByServiceId(id).catch(() => null))
        ).then((responses) => {
          const fetched: ServiceVariantToolbarItem[] = [];
          for (const r of responses) {
            if (r?.data) {
              for (const item of r.data) {
                fetched.push(mapVariantDtoToToolbarItem(item));
              }
            }
          }
          if (fetched.length > 0) {
            setWorkspaceVariants((cur) => {
              const seen = new Set(cur.map((v) => v.id));
              return [...cur, ...fetched.filter((f) => !seen.has(f.id))];
            });
          }
        });
      }
      return prev;
    });
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
            name: freshSchema.name || form.name,
            description: freshSchema.description || form.description,
            serviceName: freshSchema.serviceName || form.serviceName,
            serviceCode: freshSchema.serviceCode || form.serviceCode,
          });
        }
      } catch {
        // ignore
      }
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
    void handleOpenEditor(newForm, true);
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

    // Per-Service-Variant Version Creation!
    if (selectedVariant && selectedVariant !== "ALL") {
      const matchedVariant = findMatchingVariant(backendServiceVariants, selectedVariant);
      if (
        matchedVariant?.id &&
        !matchedVariant.id.startsWith("var-") &&
        !matchedVariant.id.startsWith("default-")
      ) {
        try {
          const variantSections = convertSchemaToBackendSections(form.fields, matchedVariant.id);
          const createVarDraftRes = await saveVariantForm(matchedVariant.id, {
            id: form.id,
            createNewVersion: true,
            serviceId: matchedVariant.serviceId || form.serviceId || "",
            serviceVariantId: matchedVariant.id,
            baseFormId: masterBaseForm?.id || form.baseFormId,
            name: `${matchedVariant.name} Form`,
            version: nextVer,
            isActive: false,
            categorySelectionRequired: false,
            sections: variantSections,
          });

          if (createVarDraftRes && createVarDraftRes.succeeded && createVarDraftRes.data) {
            const newDraftSchema = convertBackendFormToSchema(createVarDraftRes.data);
            const enrichedDraft: FormSchema = {
              ...newDraftSchema,
              serviceName: newDraftSchema.serviceName || masterBaseForm?.serviceName,
              serviceCode: newDraftSchema.serviceCode || masterBaseForm?.serviceCode,
              linkedServices: masterBaseForm?.linkedServices,
              linkedVariants: masterBaseForm?.linkedVariants,
            };
            setActiveForm(enrichedDraft);
            if (createVarDraftRes.data.customizedVariantIds) {
              setMasterBaseForm((prev) =>
                prev ? { ...prev, customizedVariantIds: createVarDraftRes.data.customizedVariantIds } : prev
              );
            }
            originalFormRef.current = JSON.stringify(enrichedDraft);
            setIsDirty(false);
            await mutate();
            setToast({
              message: `Created Draft v${nextVer} specifically for "${selectedVariant}". Live clients remain on the current active version.`,
              type: "success",
            });
          } else {
            setToast({
              message: createVarDraftRes?.message || "Failed to create variant draft version.",
              type: "error",
            });
          }
        } catch (err: unknown) {
          setToast({
            message: getErrorMessage(err, "Failed to create variant draft version."),
            type: "error",
          });
        }
        return;
      }
    }

    try {
      const dupRes = await duplicateForm(form.id, nextVer);
      if (dupRes && dupRes.succeeded) {
        await mutate();
        if (dupRes.data?.formId) {
          await executeSwitchVersion(dupRes.data.formId);
        }
        setToast({ message: `Created new draft version v${nextVer} (Inactive Draft).`, type: "success" });
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
        const scopeText =
          selectedVariant && selectedVariant !== "ALL"
            ? `"${selectedVariant}" (v${form.version || "1.0"}) is now the single active version for this Service Variant.`
            : `"${form.name}" (v${form.version || "1.0"}) is now the single active Base Form version; prior active versions were moved to Draft.`;
        setToast({
          message: scopeText,
          type: "success",
        });
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

    const variantCount = deleteTarget.linkedVariantsCount ?? currentFormVariants.length;
    const isSoleOrActiveBaseForVariants =
      !deleteTarget.serviceVariantId &&
      Boolean(deleteTarget.isActive || deleteTarget.isPublished) &&
      variantCount > 0;

    if (isSoleOrActiveBaseForVariants) {
      setToast({
        message: `Cannot delete "${deleteTarget.name}" because it is an active Base Form used by ${variantCount} Service Variant(s).`,
        type: "error",
      });
      setDeleteTarget(null);
      return;
    }

    if (deleteTarget.serviceVariantId && Boolean(deleteTarget.isActive || deleteTarget.isPublished)) {
      setToast({
        message: "Cannot delete the active Service Variant version. Use 'Revert to Base Form' to remove variant customization.",
        type: "error",
      });
      setDeleteTarget(null);
      return;
    }

    try {
      if (deleteTarget.serviceId) {
        const delRes = await deleteForm(deleteTarget.id);
        if (delRes && delRes.succeeded === false) {
          setToast({ message: delRes.message || "Cannot delete form version.", type: "error" });
          setDeleteTarget(null);
          return;
        }
        await mutate();
      }

      if (deleteTarget.serviceVariantId) {
        const varRes = await getVariantForm(deleteTarget.serviceVariantId).catch(() => null);
        if (varRes && varRes.succeeded && varRes.data) {
          const fallbackVarSchema = convertBackendFormToSchema(varRes.data);
          setActiveForm(fallbackVarSchema);
          originalFormRef.current = JSON.stringify(fallbackVarSchema);
          setIsDirty(false);
          setToast({ message: "Variant draft version deleted.", type: "success" });
          return;
        }
      }

      if (activeForm?.id === deleteTarget.id) {
        const otherVer = (activeForm.availableVersions ?? []).find((v) => v.formId !== deleteTarget.id);
        if (otherVer) {
          await executeSwitchVersion(otherVer.formId);
        } else {
          setActiveForm(null);
          setView("list");
          setIsDirty(false);
        }
      }
      setToast({ message: "Form version deleted successfully.", type: "success" });
    } catch (err: unknown) {
      setToast({ message: getErrorMessage(err, "Failed to delete form."), type: "error" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const executeSwitchVersion = async (targetFormId: string) => {
    if (targetFormId === activeForm?.id) return;
    setIsLoadingWorkspace(true);
    try {
      // Switching versions inside a Service Variant tab!
      if (selectedVariant && selectedVariant !== "ALL") {
        const matchedVariant = findMatchingVariant(backendServiceVariants, selectedVariant);
        if (
          matchedVariant?.id &&
          !matchedVariant.id.startsWith("var-") &&
          !matchedVariant.id.startsWith("default-")
        ) {
          const varRes = await getVariantForm(matchedVariant.id, targetFormId);
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
            setSelectedFieldId(null);
            setIsDirty(false);
            setToast({
              message: `Switched "${selectedVariant}" to version v${enrichedVarSchema.version || "1.0"}.`,
              type: "info",
            });
          }
          return;
        }
      }

      const wsRes = await getFormWorkspace(targetFormId);
      if (wsRes && wsRes.succeeded && wsRes.data) {
        const freshSchema = convertBackendFormToSchema(wsRes.data.form);
        setActiveForm(freshSchema);
        setMasterBaseForm(freshSchema);
        setWorkspaceServices(wsRes.data.linkedServices ?? []);
        setWorkspaceVariants((wsRes.data.serviceVariants ?? []).map(mapVariantDtoToToolbarItem));
        originalFormRef.current = JSON.stringify(freshSchema);
        setSelectedFieldId(null);
        setSelectedVariant("ALL");
        setIsVariantEditMode(false);
        setIsDirty(false);
        setToast({ message: `Switched to Base Form version v${freshSchema.version || "1.0"}.`, type: "info" });
      }
    } catch {
      setToast({ message: "Failed to load the selected form version.", type: "error" });
    } finally {
      setIsLoadingWorkspace(false);
    }
  };

  return {
    handleOpenEditor,
    handleLinkedServicesChanged,
    handleOpenPreview,
    handleCreateNew,
    handleDuplicateForm,
    handleSetActive,
    handleDeleteFormConfirm,
    executeSwitchVersion,
  };
}
