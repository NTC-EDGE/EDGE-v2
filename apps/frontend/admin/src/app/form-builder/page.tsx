"use client";

import React, { useState, useCallback, useEffect, useRef, Suspense } from "react";
import {
  ArrowLeft,
  Eye,
  CheckCircle2,
  Globe,
  EyeOff,
  Loader2,
  ClipboardList,
  Sparkles,
  Layers,
  Building2,
  Save,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Radio,
} from "lucide-react";
import { FormSchema, FormField, FieldType, ServiceVariantToolbarItem } from "@/components/form-builder/types";
import {
  useLocalForms,
  saveFormSchema,
  deleteFormSchema,
  createDefaultField,
  generateId,
  convertBackendFormToSchema,
  convertSchemaToBackendSections,
  reorderFieldsWithSections,
  duplicateFieldWithSection,
  deleteFieldWithSection,
  BackendFormDtoLike,
  cloneFormFieldsWithFreshIds,
} from "@/components/form-builder/utils";
import { collectAllFormVariants } from "@/components/form-builder/canonicalFormServices";
import { useFormBuilderService } from "@/services/formBuilderService";
import { useCatalogService, ServiceCategory, ServiceItem } from "@/services/catalogService";
import { FieldPalette } from "@/components/form-builder/FieldPalette";
import { FieldEditor } from "@/components/form-builder/FieldEditor";
import { FormCanvas } from "@/components/form-builder/FormCanvas";
import { FormPreviewModal } from "@/components/form-builder/FormPreviewModal";
import { FormsList } from "@/components/form-builder/FormsList";
import { CreateFormDialog } from "@/components/form-builder/CreateFormDialog";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { UnsavedChangesDialog } from "@/components/form-builder/UnsavedChangesDialog";
import { ToastNotification, ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";

type View = "list" | "builder";

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function isBackendFormDtoLike(val: unknown): val is BackendFormDtoLike {
  return isRecord(val);
}

function getHttpStatus(err: unknown): number | undefined {
  if (isRecord(err) && isRecord(err["response"]) && typeof err["response"]["status"] === "number") {
    return err["response"]["status"];
  }
  return undefined;
}

function isFormSchema(val: unknown): val is FormSchema {
  return isRecord(val) && typeof val["id"] === "string" && Array.isArray(val["fields"]);
}

function FormBuilderContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const {
    useForms,
    getFormById,
    createForm,
    updateForm,
    deleteForm,
    duplicateForm,
    activateForm,
  } = useFormBuilderService();
  const { data: apiResponse, mutate } = useForms(
    currentPage,
    pageSize,
    searchTerm,
    selectedServiceId || undefined
  );

  const { useServiceCategories, useServices, useServiceVariants } = useCatalogService();
  const { data: categoriesResponse } = useServiceCategories();
  const { data: servicesResponse } = useServices(undefined, 1, 200);

  const categories: ServiceCategory[] = React.useMemo(() => {
    if (!categoriesResponse) return [];
    return Array.isArray(categoriesResponse)
      ? categoriesResponse
      : categoriesResponse.data && Array.isArray(categoriesResponse.data)
      ? categoriesResponse.data
      : [];
  }, [categoriesResponse]);

  const services: ServiceItem[] = React.useMemo(() => {
    if (!servicesResponse) return [];
    return Array.isArray(servicesResponse)
      ? servicesResponse
      : servicesResponse.data && Array.isArray(servicesResponse.data)
      ? servicesResponse.data
      : [];
  }, [servicesResponse]);

  const [view, setView] = useState<View>("list");
  const localForms = useLocalForms();

  // Parse backend and seeded forms
  const backendForms: FormSchema[] = React.useMemo(() => {
    if (!apiResponse) return [];
    const rawList = Array.isArray(apiResponse)
      ? apiResponse
      : apiResponse.data && Array.isArray(apiResponse.data)
      ? apiResponse.data
      : [];
    return rawList.filter(isBackendFormDtoLike).map((f) => convertBackendFormToSchema(f));
  }, [apiResponse]);

  // Forms list reflecting backend API response
  const forms = React.useMemo(() => {
    if (apiResponse && apiResponse.succeeded !== false) {
      return backendForms;
    }
    // Offline / fallback when backend is unavailable
    return localForms;
  }, [apiResponse, backendForms, localForms]);

  const [activeForm, setActiveForm] = useState<FormSchema | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<FormSchema | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FormSchema | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isUnsavedDialogOpen, setIsUnsavedDialogOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [masterBaseForm, setMasterBaseForm] = useState<FormSchema | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("ALL");
  const [isVariantEditMode, setIsVariantEditMode] = useState<boolean>(false);
  const originalFormRef = useRef<string | null>(null);


  const { data: serviceVariantsResponse } = useServiceVariants(activeForm?.serviceId);

  const backendServiceVariants: ServiceVariantToolbarItem[] = React.useMemo(() => {
    if (!serviceVariantsResponse?.data) return [];
    return serviceVariantsResponse.data.map((v) => ({
      id: v.id,
      name: v.description && v.description.trim().length > 0 ? `${v.description} (${v.type})` : `${v.type}`,
      serviceId: v.serviceId,
      serviceName: v.serviceName,
      source: "service" as const,
    }));
  }, [serviceVariantsResponse]);

  const currentFormVariants = React.useMemo(() => {
    if (!activeForm) return [];
    return collectAllFormVariants(activeForm, services, backendServiceVariants);
  }, [activeForm, services, backendServiceVariants]);

  const customizedVariantNames = React.useMemo(() => {
    if (!activeForm?.serviceId) return [];
    const names = new Set<string>();
    for (const f of backendForms) {
      if (f.serviceId === activeForm.serviceId && f.serviceVariantName) {
        names.add(f.serviceVariantName);
      }
    }
    return Array.from(names);
  }, [backendForms, activeForm?.serviceId]);

  const handleSelectVariant = useCallback(
    (variantName: string) => {
      if (variantName === "ALL") {
        setSelectedVariant("ALL");
        setIsVariantEditMode(false);
        setSelectedFieldId(null);
        if (masterBaseForm) {
          setActiveForm(masterBaseForm);
          originalFormRef.current = JSON.stringify(masterBaseForm);
        }
        setIsDirty(false);
        return;
      }

      setSelectedVariant(variantName);
      setSelectedFieldId(null);

      const matchingVariant = currentFormVariants.find(
        (v) => v.name.toLowerCase() === variantName.toLowerCase()
      );
      const baseFormToUse = masterBaseForm || activeForm;
      const baseKey = baseFormToUse?.key || baseFormToUse?.serviceCode || "FORM";
      const variantSlug = variantName.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
      const expectedVariantKey = `${baseKey}_${variantSlug}`;

      // Check if an existing isolated form for this variant already exists in backend
      const existingVariantForm = backendForms.find(
        (f) =>
          (matchingVariant?.id && f.serviceVariantId === matchingVariant.id) ||
          (f.key && f.key.toUpperCase() === expectedVariantKey.toUpperCase()) ||
          (f.serviceVariantName && f.serviceVariantName.toLowerCase() === variantName.toLowerCase() && f.serviceId === baseFormToUse?.serviceId)
      );

      if (existingVariantForm) {
        setActiveForm(existingVariantForm);
        originalFormRef.current = JSON.stringify(existingVariantForm);
        setIsVariantEditMode(true);
        setIsDirty(false);
      } else if (baseFormToUse) {
        // Immediately initialize an isolated variant form cloned from base blueprint with fresh IDs
        const freshFields = cloneFormFieldsWithFreshIds(baseFormToUse.fields);
        const newVariantForm: FormSchema = {
          id: generateId(),
          key: expectedVariantKey,
          serviceId: baseFormToUse.serviceId,
          serviceVariantId:
            matchingVariant && matchingVariant.id && !matchingVariant.id.startsWith("var-")
              ? matchingVariant.id
              : undefined,
          serviceVariantName: variantName,
          baseFormId: baseFormToUse.id,
          baseFormKey: baseFormToUse.key,
          name: `${baseFormToUse.name} - ${variantName}`,
          description: `Form layout for ${variantName} based on ${baseFormToUse.name}`,
          version: "1.0",
          fields: freshFields,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPublished: true,
          isActive: true,
        };
        setActiveForm(newVariantForm);
        originalFormRef.current = JSON.stringify(newVariantForm);
        setIsVariantEditMode(true);
        setIsDirty(false);
      }
    },
    [masterBaseForm, activeForm, currentFormVariants, backendForms]
  );

  const handleCustomizeVariant = useCallback(
    (variantName: string) => {
      if (!activeForm || variantName === "ALL") return;
      const baseFormToUse = masterBaseForm || activeForm;
      const matchingVariant = currentFormVariants.find(
        (v) => v.name.toLowerCase() === variantName.toLowerCase()
      );
      const baseKey = baseFormToUse.key || baseFormToUse.serviceCode || "FORM";
      const variantSlug = variantName.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
      const expectedVariantKey = `${baseKey}_${variantSlug}`;

      // Clone fields with brand new IDs to ensure 100% database isolation from base form
      const freshFields = cloneFormFieldsWithFreshIds(baseFormToUse.fields);

      const newVariantForm: FormSchema = {
        id: generateId(),
        key: expectedVariantKey,
        serviceId: baseFormToUse.serviceId,
        serviceVariantId:
          matchingVariant && matchingVariant.id && !matchingVariant.id.startsWith("var-")
            ? matchingVariant.id
            : undefined,
        serviceVariantName: variantName,
        baseFormId: baseFormToUse.id,
        baseFormKey: baseFormToUse.key,
        name: `${baseFormToUse.name} - ${variantName}`,
        description: `Independent form layout for ${variantName} based on ${baseFormToUse.name}`,
        version: "1.0",
        fields: freshFields,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublished: true,
        isActive: true,
      };

      setActiveForm(newVariantForm);
      setIsVariantEditMode(true);
      setIsDirty(true);
      setSelectedFieldId(null);
      setToast({
        message: `Separated form for "${variantName}". You can now delete or arrange sections, and it will only affect "${variantName}".`,
        type: "info",
      });
    },
    [activeForm, masterBaseForm, currentFormVariants]
  );

  const handleResetFromBaseForm = useCallback(() => {
    if (!activeForm || selectedVariant === "ALL") return;
    const baseFormToUse = masterBaseForm || activeForm;
    if (!baseFormToUse) return;

    // Clone all fields from base form blueprint with fresh IDs
    const freshFields = cloneFormFieldsWithFreshIds(baseFormToUse.fields);
    const updated: FormSchema = {
      ...activeForm,
      fields: freshFields,
      updatedAt: new Date().toISOString(),
    };

    setActiveForm(updated);
    setIsDirty(true);
    setSelectedFieldId(null);
    setToast({
      message: `Reset sections and fields from base blueprint "${baseFormToUse.name}". Modify/arrange sections and click Save Changes to persist to "${selectedVariant}" only.`,
      type: "info",
    });
  }, [activeForm, selectedVariant, masterBaseForm]);

  const handleRevertVariantToBase = useCallback(
    (variantName: string) => {
      if (!activeForm || variantName === "ALL") return;
      if (masterBaseForm) {
        setActiveForm(masterBaseForm);
        originalFormRef.current = JSON.stringify(masterBaseForm);
      }
      setIsVariantEditMode(false);
      setIsDirty(false);
      setToast({
        message: `Reverted preview for "${variantName}" back to base form blueprint.`,
        type: "info",
      });
    },
    [activeForm, masterBaseForm]
  );

  // Warn on browser tab / window navigation if unsaved changes exist
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (view === "builder" && isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [view, isDirty]);

  // Backend persistence called ONLY on explicit Save
  const persistFormToBackend = useCallback(
    async (
      formToSave: FormSchema
    ): Promise<{ success: boolean; message: string; form: FormSchema }> => {
      setIsSaving(true);
      try {
        // Save locally first for instant resiliency
        saveFormSchema(formToSave);

        let current = formToSave;

        // If form has a serviceId, synchronize to backend API
        if (formToSave.serviceId) {
          const sections = convertSchemaToBackendSections(formToSave.fields);
          const resolvedKey = formToSave.key || (formToSave.serviceCode ? formToSave.serviceCode : undefined);

          try {
            const updateRes = await updateForm(formToSave.id, {
              id: formToSave.id,
              serviceId: formToSave.serviceId,
              key: resolvedKey,
              serviceVariantId: formToSave.serviceVariantId,
              baseFormId: formToSave.baseFormId,
              name: formToSave.name,
              version: formToSave.version || "1.0",
              isActive: formToSave.isPublished ?? formToSave.isActive ?? false,
              categorySelectionRequired: false,
              sections,
            });

            if (updateRes && updateRes.succeeded) {
              await mutate();
              if (!formToSave.serviceVariantId) {
                setMasterBaseForm(current);
              }
              return {
                success: true,
                message: updateRes.message || "Form template updated successfully.",
                form: current,
              };
            } else if (updateRes && !updateRes.succeeded) {
              return {
                success: false,
                message: updateRes.message || "Failed to update form template.",
                form: current,
              };
            }
          } catch (updateErr: unknown) {
            const status = getHttpStatus(updateErr);
            // If 404 (client-generated UUID not yet created on backend), create on backend
            if (status === 404) {
              try {
                const createRes = await createForm({
                  serviceId: formToSave.serviceId,
                  key: resolvedKey,
                  serviceVariantId: formToSave.serviceVariantId,
                  baseFormId: formToSave.baseFormId,
                  name: formToSave.name,
                  version: formToSave.version || "1.0",
                  isActive: formToSave.isPublished ?? formToSave.isActive ?? false,
                  categorySelectionRequired: false,
                  sections,
                });

                if (createRes && createRes.formId) {
                  const updatedWithNewId: FormSchema = {
                    ...formToSave,
                    id: createRes.formId,
                  };
                  saveFormSchema(updatedWithNewId);
                  setActiveForm(updatedWithNewId);
                  current = updatedWithNewId;
                  await mutate();
                  if (!formToSave.serviceVariantId) {
                    setMasterBaseForm(current);
                  }
                  return {
                    success: true,
                    message: "Form template created and saved successfully.",
                    form: current,
                  };
                }
              } catch (createErr: unknown) {
                const errMsg = getErrorMessage(createErr, "Failed to create form on backend.");
                return {
                  success: false,
                  message: errMsg,
                  form: current,
                };
              }
            } else {
              const errMsg = getErrorMessage(updateErr, "Failed to update form on backend.");
              return {
                success: false,
                message: errMsg,
                form: current,
              };
            }
          }
        }

        return {
          success: true,
          message: formToSave.serviceId
            ? "Form template saved successfully."
            : "Form saved locally only. To reflect in client applications, associate this template with a Service.",
          form: current,
        };
      } catch (err: unknown) {
        const errMsg = getErrorMessage(err, "An error occurred while saving the form.");
        return {
          success: false,
          message: errMsg,
          form: formToSave,
        };
      } finally {
        setIsSaving(false);
      }
    },
    [updateForm, createForm, mutate]
  );

  // --- Builder actions (no auto-save; marks form as dirty) ---

  const handleUpdateForm = useCallback(
    (updates: Partial<FormSchema>) => {
      if (!activeForm) return;
      const updated: FormSchema = {
        ...activeForm,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(updated);
      setIsDirty(true);
    },
    [activeForm]
  );

  const handleAddField = useCallback(
    (type: FieldType, atIndex?: number) => {
      if (!activeForm) return;
      const newField = createDefaultField(type);
      const fields = [...activeForm.fields];
      if (atIndex !== undefined) {
        fields.splice(atIndex, 0, newField);
      } else {
        fields.push(newField);
      }
      const updated: FormSchema = {
        ...activeForm,
        fields,
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(updated);
      setSelectedFieldId(newField.id);
      setIsDirty(true);
    },
    [activeForm]
  );

  const handleReorderFields = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!activeForm) return;
      const fields = reorderFieldsWithSections(activeForm.fields, fromIndex, toIndex);
      const updated: FormSchema = {
        ...activeForm,
        fields,
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(updated);
      setIsDirty(true);
    },
    [activeForm]
  );

  const handleDuplicateField = useCallback(
    (id: string) => {
      if (!activeForm) return;
      const fields = duplicateFieldWithSection(activeForm.fields, id);
      const updated: FormSchema = {
        ...activeForm,
        fields,
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(updated);
      setIsDirty(true);
    },
    [activeForm]
  );

  const handleDeleteField = useCallback(
    (id: string) => {
      if (!activeForm) return;
      const fields = deleteFieldWithSection(activeForm.fields, id);
      if (selectedFieldId !== null && !fields.some((f) => f.id === selectedFieldId)) {
        setSelectedFieldId(null);
      }
      const updated: FormSchema = {
        ...activeForm,
        fields,
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(updated);
      setIsDirty(true);
    },
    [activeForm, selectedFieldId]
  );

  const handleUpdateField = useCallback(
    (fieldUpdates: Partial<FormField>) => {
      if (!activeForm || !selectedFieldId) return;
      const fields = activeForm.fields.map((f) =>
        f.id === selectedFieldId ? { ...f, ...fieldUpdates } : f
      );
      const updated: FormSchema = {
        ...activeForm,
        fields,
        updatedAt: new Date().toISOString(),
      };
      setActiveForm(updated);
      setIsDirty(true);
    },
    [activeForm, selectedFieldId]
  );

  const handleManualSave = async () => {
    if (!activeForm) return;
    const result = await persistFormToBackend(activeForm);
    if (result.success) {
      originalFormRef.current = JSON.stringify(result.form);
      setIsDirty(false);
      setIsSaveConfirmOpen(false);
      setToast({
        message: result.message || "Form template saved to backend successfully.",
        type: "success",
      });
    } else {
      setIsSaveConfirmOpen(false);
      setToast({
        message: result.message || "Failed to save form to backend.",
        type: "error",
      });
    }
  };

  const handleResetChanges = useCallback(() => {
    if (!originalFormRef.current) return;
    try {
      const parsed: unknown = JSON.parse(originalFormRef.current);
      if (isFormSchema(parsed)) {
        setActiveForm(parsed);
        setSelectedFieldId(null);
        setIsDirty(false);
        setToast({
          message: "Unsaved changes reverted to last saved version.",
          type: "info",
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSwitchVersion = async (targetFormId: string) => {
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
        setToast({
          message: `Switched to version v${freshSchema.version || "1.0"}.`,
          type: "info",
        });
      }
    } catch {
      setToast({
        message: "Failed to load the selected form version.",
        type: "error",
      });
    }
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
    } catch {
      // ignore
    }
  };

  // --- List actions ---

  const handleOpenEditor = async (form: FormSchema) => {
    const isVariant = Boolean(form.serviceVariantId);
    if (!isVariant) {
      setMasterBaseForm(form);
      setSelectedVariant("ALL");
    } else {
      const foundBase = backendForms.find(
        (b) => (!b.serviceVariantId && b.serviceId === form.serviceId) || (form.baseFormId && b.id === form.baseFormId)
      );
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
          if (!isVariant) {
            setMasterBaseForm(combined);
          }
          originalFormRef.current = JSON.stringify(combined);
          setIsDirty(false);
        }
      } catch {
        // Graceful fallback to initial form schema
      }
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
      } catch {
        // Fallback to active preview
      }
    }
  };

  const handleCreateNew = (
    name: string,
    description: string,
    version: string,
    isActive: boolean,
    serviceId?: string,
    serviceName?: string
  ) => {
    const now = new Date().toISOString();
    const newForm: FormSchema = {
      id: generateId(),
      name,
      description,
      version: version || "1.0",
      serviceId,
      serviceName,
      fields: [],
      createdAt: now,
      updatedAt: now,
      isPublished: isActive,
      isActive,
    };
    saveFormSchema(newForm);
    setIsCreateDialogOpen(false);
    handleOpenEditor(newForm);
    setToast({
      message: isActive
        ? `Form (v${newForm.version}) created as active. Start adding fields!`
        : `Form (v${newForm.version}) created as draft. Start adding fields!`,
      type: "success",
    });
  };

  const handleDuplicateForm = async (form: FormSchema) => {
    const now = new Date().toISOString();
    const curVer = form.version || "1.0";
    const allNums = (form.availableVersions ?? [])
      .map((v) => parseFloat(v.version))
      .filter((n) => !isNaN(n));
    const curNum = parseFloat(curVer);
    if (!isNaN(curNum)) {
      allNums.push(curNum);
    }
    const maxVer = allNums.length > 0 ? Math.max(...allNums) : NaN;
    const nextVer = !isNaN(maxVer) ? `${(Math.floor(maxVer) + 1).toFixed(1)}` : `${curVer}-copy`;

    const duplicate: FormSchema = {
      ...form,
      id: generateId(),
      name: `${form.name} (v${nextVer})`,
      version: nextVer,
      isPublished: false,
      isActive: false,
      createdAt: now,
      updatedAt: now,
    };
    saveFormSchema(duplicate);
    if (form.serviceId) {
      await duplicateForm(form.id, nextVer).catch(() => null);
      await mutate();
      if (activeForm && activeForm.id === form.id) {
        try {
          const res = await getFormById(form.id);
          if (res && res.succeeded && res.data) {
            const freshSchema = convertBackendFormToSchema(res.data);
            setActiveForm((prev) =>
              prev ? { ...prev, availableVersions: freshSchema.availableVersions } : prev
            );
          }
        } catch {
          // ignore
        }
      }
    }
    setToast({
      message: `Created new draft version v${nextVer}.`,
      type: "success",
    });
  };

  const handleSetActive = async (form: FormSchema) => {
    if (!form.serviceId) return;
    try {
      const res = await activateForm(form.id);
      if (res && res.succeeded) {
        setToast({
          message: `"${form.name}" (v${form.version || "1.0"}) is now live as the active form on the client portal.`,
          type: "success",
        });
        await mutate();
      } else {
        // Fallback to updateForm if needed
        const sections = convertSchemaToBackendSections(form.fields);
        const updateRes = await updateForm(form.id, {
          id: form.id,
          serviceId: form.serviceId,
          name: form.name,
          version: form.version || "1.0",
          isActive: true,
          categorySelectionRequired: false,
          sections,
        });
        if (updateRes && updateRes.succeeded) {
          setToast({
            message: `"${form.name}" (v${form.version || "1.0"}) is now live as the active form on the client portal.`,
            type: "success",
          });
          await mutate();
        } else {
          setToast({
            message: res?.message || updateRes?.message || "Failed to set form as active.",
            type: "error",
          });
        }
      }
    } catch (err: unknown) {
      setToast({
        message: getErrorMessage(err, "Failed to set form as active."),
        type: "error",
      });
    }
  };

  const handleDeleteFormConfirm = async () => {
    if (!deleteTarget) return;
    deleteFormSchema(deleteTarget.id);
    if (deleteTarget.serviceId) {
      await deleteForm(deleteTarget.id).catch(() => null);
      await mutate();
    }
    if (activeForm?.id === deleteTarget.id) {
      setActiveForm(null);
      setView("list");
      setIsDirty(false);
    }
    setToast({ message: "Form deleted.", type: "success" });
    setDeleteTarget(null);
  };

  const handleBackToList = () => {
    if (isDirty) {
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
      setView("list");
      setActiveForm(null);
      setSelectedFieldId(null);
      setToast({
        message: "Form template saved successfully.",
        type: "success",
      });
    } else {
      setToast({
        message: result.message || "Failed to save form to backend.",
        type: "error",
      });
    }
  };

  const handleDiscardAndExit = () => {
    if (originalFormRef.current) {
      try {
        const parsed: unknown = JSON.parse(originalFormRef.current);
        if (isFormSchema(parsed)) {
          saveFormSchema(parsed);
        }
      } catch {
        // ignore
      }
    }
    setIsDirty(false);
    setIsUnsavedDialogOpen(false);
    setView("list");
    setActiveForm(null);
    setSelectedFieldId(null);
    setToast({ message: "Unsaved modifications discarded.", type: "info" });
  };

  const selectedField = activeForm?.fields.find((f) => f.id === selectedFieldId) ?? null;

  // ---- BUILDER VIEW ----
  if (view === "builder" && activeForm) {
    return (
      <div className="fixed inset-0 flex flex-col bg-slate-100 dark:bg-slate-950 z-10">
        <ToastNotification toast={toast} onClose={() => setToast(null)} />

        {/* Builder Toolbar */}
        <div className="h-14 flex items-center justify-between px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToList}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Forms
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-indigo-500 shrink-0" />
              <span
                className="text-sm font-semibold text-slate-800 dark:text-white max-w-[320px] xl:max-w-[480px] truncate"
                title={activeForm.name || "Untitled Form"}
              >
                {activeForm.name || "Untitled Form"}
              </span>
              {activeForm.serviceName && (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 max-w-[420px] xl:max-w-[560px]"
                  title={`Associated Service: ${activeForm.serviceName}${activeForm.serviceCode ? ` (${activeForm.serviceCode})` : ""}`}
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 truncate">
                    {activeForm.serviceName}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Workspace Panel Toggles for Desktop Width Control */}
            <div className="hidden lg:flex items-center gap-1 mr-1 pr-2 border-r border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsLeftPanelOpen((prev) => !prev)}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  isLeftPanelOpen
                    ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                    : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title={isLeftPanelOpen ? "Hide Field Palette" : "Show Field Palette"}
              >
                {isLeftPanelOpen ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsRightPanelOpen((prev) => !prev)}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  isRightPanelOpen
                    ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                    : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title={isRightPanelOpen ? "Hide Properties Inspector" : "Show Properties Inspector"}
              >
                {isRightPanelOpen ? (
                  <PanelRightClose className="w-4 h-4" />
                ) : (
                  <PanelRightOpen className="w-4 h-4" />
                )}
              </button>
            </div>
            {/* Save Status Indicator */}
            {isSaving ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span>Saving changes…</span>
              </div>
            ) : !isDirty ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>All changes saved</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Unsaved changes</span>
              </div>
            )}

            {isDirty && !isSaving && (
              <button
                type="button"
                onClick={handleResetChanges}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all"
                title="Revert all unsaved edits back to last saved state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSaveConfirmOpen(true)}
              disabled={!isDirty || isSaving}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                isDirty && !isSaving
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 cursor-pointer"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>

            <button
              type="button"
              onClick={() => setPreviewForm(activeForm)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>
        </div>

        {/* Top Background Loading Progress Bar */}
        <div className="h-0.5 w-full bg-slate-200/30 dark:bg-slate-800/30 overflow-hidden relative z-20">
          {isSaving && (
            <div className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600 animate-pulse w-full shadow-sm shadow-indigo-500/50" />
          )}
        </div>

        {/* Three-panel layout utilizing full desktop width */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Field Palette */}
          {isLeftPanelOpen && (
            <div className="w-64 xl:w-72 2xl:w-80 flex-shrink-0 overflow-hidden transition-all duration-200">
              <FieldPalette
                onAddField={handleAddField}
                disabled={false}
              />
            </div>
          )}

          {/* Center Panel: Canvas */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <FormCanvas
              form={activeForm}
              baseForm={masterBaseForm}
              catalogServices={services}
              catalogCategories={categories}
              selectedFieldId={selectedFieldId}
              onSelectField={(fieldId) => {
                setSelectedFieldId(fieldId);
                if (fieldId !== null) {
                  setIsRightPanelOpen(true);
                }
              }}
              onUpdateForm={handleUpdateForm}
              onAddField={handleAddField}
              onReorderFields={handleReorderFields}
              onDuplicateField={handleDuplicateField}
              onDeleteField={handleDeleteField}
              onSwitchVersion={handleSwitchVersion}
              onSetActive={handleSetActiveCurrent}
              onCreateNewVersion={() => handleDuplicateForm(activeForm)}
              onDeleteVersion={() => setDeleteTarget(activeForm)}
              selectedVariant={selectedVariant}
              onSelectVariant={handleSelectVariant}
              isVariantEditMode={isVariantEditMode}
              onSetVariantEditMode={setIsVariantEditMode}
              onCustomizeVariant={handleCustomizeVariant}
              onResetFromBaseForm={handleResetFromBaseForm}
              onRevertVariantToBase={handleRevertVariantToBase}
              customizedVariantNames={customizedVariantNames}
            />
          </div>

          {/* Right Panel: Field Properties & Form Details */}
          {isRightPanelOpen && (
            <div className="w-80 lg:w-96 xl:w-[420px] 2xl:w-[460px] flex-shrink-0 overflow-hidden transition-all duration-200">
              <FieldEditor
                field={selectedField}
                form={activeForm}
                onUpdateField={handleUpdateField}
                onUpdateForm={handleUpdateForm}
                onSelectField={setSelectedFieldId}
                selectedVariant={selectedVariant}
              />
            </div>
          )}
        </div>

        {/* Save Changes Confirmation Dialog */}
        <ConfirmActionDialog
          isOpen={isSaveConfirmOpen}
          onClose={() => !isSaving && setIsSaveConfirmOpen(false)}
          title="Save Form Changes"
          description={`Are you sure you want to save all changes to "${activeForm.name || activeForm.serviceName || "this form"}"? This will update the form structure and reflect in client applications.`}
          confirmLabel="Confirm & Save Changes"
          cancelLabel="Keep Editing"
          loading={isSaving}
          onConfirm={handleManualSave}
        />

        {/* Unsaved Changes Confirmation Dialog */}
        <UnsavedChangesDialog
          open={isUnsavedDialogOpen}
          onClose={() => setIsUnsavedDialogOpen(false)}
          onSaveAndExit={handleSaveAndExit}
          onDiscard={handleDiscardAndExit}
          isSaving={isSaving}
          formTitle={activeForm.name || activeForm.serviceName || "this form"}
        />

        {/* Delete Version Confirmation */}
        <ConfirmActionDialog
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Form Version"
          description={`Are you sure you want to delete "${deleteTarget?.name ?? "this form"}" (v${deleteTarget?.version || "1.0"})? This action cannot be undone.`}
          confirmLabel="Delete Version"
          cancelLabel="Cancel"
          loading={false}
          onConfirm={handleDeleteFormConfirm}
        />

        {/* Preview Modal */}
        {previewForm && (
          <FormPreviewModal
            open={Boolean(previewForm)}
            onOpenChange={(open) => !open && setPreviewForm(null)}
            form={previewForm}
          />
        )}
      </div>
    );
  }

  // ---- LIST VIEW ----
  return (
    <div className="space-y-6 transition-colors duration-200">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Hero Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900/90 dark:to-violet-950/60 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ClipboardList className="w-64 h-64 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-700 dark:text-violet-300 text-xs font-semibold border border-violet-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Admin Tool
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-500/20 flex items-center gap-1.5"
                suppressHydrationWarning
              >
                <Layers className="w-3.5 h-3.5" />
                {`${apiResponse?.totalCount ?? forms.length} Forms`}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Form Builder
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Design and manage dynamic forms with a drag-and-drop interface. Build application forms, surveys,
              and checklists — all stored locally and ready to deploy.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0 transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            <span>New Form</span>
          </button>
        </div>
      </div>

      {/* Forms List */}
      <FormsList
        forms={forms}
        onEdit={handleOpenEditor}
        onPreview={handleOpenPreview}
        onDuplicate={handleDuplicateForm}
        onDelete={(form) => setDeleteTarget(form)}
        onSetActive={handleSetActive}
        onCreateNew={() => setIsCreateDialogOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={(term) => {
          setSearchTerm(term);
          setCurrentPage(1);
        }}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={(catId) => {
          setSelectedCategoryId(catId);
          setCurrentPage(1);
        }}
        selectedServiceId={selectedServiceId}
        onServiceChange={(svcId) => {
          setSelectedServiceId(svcId);
          setCurrentPage(1);
        }}
        categories={categories}
        services={services}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={apiResponse?.totalCount ?? forms.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      />

      {/* Create Dialog */}
      <CreateFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreateNew}
        existingForms={forms}
      />

      {/* Delete Confirmation */}
      <ConfirmActionDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Form"
        description={`Are you sure you want to delete "${deleteTarget?.name ?? "this form"}"? This action cannot be undone.`}
        confirmLabel="Delete Form"
        cancelLabel="Cancel"
        loading={false}
        onConfirm={handleDeleteFormConfirm}
      />

      {/* Preview Modal */}
      {previewForm && (
        <FormPreviewModal
          open={Boolean(previewForm)}
          onOpenChange={(open) => !open && setPreviewForm(null)}
          form={previewForm}
        />
      )}
    </div>
  );
}

function formatFormBadge(code?: string): string {
  if (!code) return "";
  const match = code.match(/^NTC[_-]1[_-](\d{2})$/i);
  if (match) {
    return `NTC 1-${match[1]}`;
  }
  return code;
}

export default function FormBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-500">Loading Form Builder…</p>
          </div>
        </div>
      }
    >
      <FormBuilderContent />
    </Suspense>
  );
}
