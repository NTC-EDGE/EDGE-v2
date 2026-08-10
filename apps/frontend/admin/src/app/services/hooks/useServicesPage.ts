"use client";

import { useState, useMemo, useEffect } from "react";
import { safeAsync } from "@edge/api";
import { useCatalogService, ServiceCategory } from "@/services/catalogService";
import { useTenantService } from "@/services/tenantService";
import { useRequirementsService } from "@/services/requirementsService";
import { useFeesService, ServiceVariantElement } from "@/services/feesService";
import { ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";
import { Requirement, ServiceVariant, ServiceVariantRequirement, Element, Note } from "@edge/api";
import { isForbiddenError } from "@/components/PageForbiddenState";
import { useSWRConfig } from "swr";

export type TabType = "services" | "variants" | "requirements" | "service-requirements" | "service-variant-requirements" | "elements" | "variant-elements" | "notes";

export function useServicesPage() {
  const { mutate: globalMutate } = useSWRConfig();
  const {
    useServiceCategories, createServiceCategory, updateServiceCategory, deleteServiceCategory,
    useServices, createService, updateService, deleteService
  } = useCatalogService();

  const { useTenants } = useTenantService();
  const {
    useRequirements, createRequirement, updateRequirement, deleteRequirement,
    useServiceVariants, createServiceVariant, updateServiceVariant, deleteServiceVariant,
    useServiceVariantRequirements, createServiceVariantRequirement, updateServiceVariantRequirement, deleteServiceVariantRequirement,
    useServiceRequirements, attachServiceVariantRequirement, unlinkServiceVariantRequirement
  } = useRequirementsService();

  const {
    useElements, createElement, updateElement, deleteElement,
    useNotes, createNote, updateNote, deleteNote,
    useServiceVariantElements, createServiceVariantElement, updateServiceVariantElement, deleteServiceVariantElement,
    useServices: useServicesForNotes,
    useServiceVariants: useVariantsForNotes,
  } = useFeesService();

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("services");
  
  // Search & Pagination states
  const [servicesSearch, setServicesSearch] = useState("");
  const [variantsSearch, setVariantsSearch] = useState("");
  const [requirementsSearch, setRequirementsSearch] = useState("");
  const [flatMappingsSearch, setFlatMappingsSearch] = useState("");

  const [servicesPage, setServicesPage] = useState(1);
  const [variantsPage, setVariantsPage] = useState(1);
  const [requirementsPage, setRequirementsPage] = useState(1);
  const [flatMappingsPage, setFlatMappingsPage] = useState(1);
  const [elementsPage, setElementsPage] = useState(1);
  const [notesPage, setNotesPage] = useState(1);
  const [elementsSearch, setElementsSearch] = useState("");
  const [notesSearch, setNotesSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);

  // Notes filter state
  const [notesFilterServiceId, setNotesFilterServiceId] = useState("");
  const [notesFilterVariantId, setNotesFilterVariantId] = useState("");

  // Variants filter state
  const [variantsFilterServiceId, setVariantsFilterServiceId] = useState("");

  // Selected Category filter
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");

  // Three-pane states
  const [mappingServiceId, setMappingServiceId] = useState("");
  const [mappingVariantId, setMappingVariantId] = useState("");

  // Dialog visibility states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [isServiceSubmitting, setIsServiceSubmitting] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ServiceVariant | null>(null);
  const [isVariantSubmitting, setIsVariantSubmitting] = useState(false);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(null);

  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<Requirement | null>(null);
  const [isReqSubmitting, setIsReqSubmitting] = useState(false);
  const [deletingReqId, setDeletingReqId] = useState<string | null>(null);

  const [isMappingFormOpen, setIsMappingFormOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<ServiceVariantRequirement | null>(null);
  const [isMappingSubmitting, setIsMappingSubmitting] = useState(false);
  const [deletingMappingId, setDeletingMappingId] = useState<string | null>(null);

  // Elements dialog state
  const [isElementModalOpen, setIsElementModalOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<Element | null>(null);
  const [isElementSubmitting, setIsElementSubmitting] = useState(false);
  const [deletingElementId, setDeletingElementId] = useState<string | null>(null);

  // Variant Elements dialog state
  const [isVarElementModalOpen, setIsVarElementModalOpen] = useState(false);
  const [editingVarElement, setEditingVarElement] = useState<ServiceVariantElement | null>(null);
  const [isVarElementSubmitting, setIsVarElementSubmitting] = useState(false);
  const [deletingVarElementId, setDeletingVarElementId] = useState<string | null>(null);

  // Notes dialog state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNoteSubmitting, setIsNoteSubmitting] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // Queries
  const { data: categoriesResponse, error: catErr, mutate: mutCat } = useServiceCategories();
  const categories = categoriesResponse?.data || [];

  const servicesSearchTerm = useMemo(() => {
    return (activeTab === "services" || activeTab === "service-requirements" || activeTab === "variant-elements") ? servicesSearch : "";
  }, [activeTab, servicesSearch]);

  const { data: servicesResponse, error: svcErr, isLoading: loadingServices, mutate: mutSvc } = useServices(
    selectedCategoryId === "ALL" ? undefined : selectedCategoryId,
    activeTab === "services" ? servicesPage : 1,
    activeTab === "services" ? pageSize : 100,
    servicesSearchTerm
  );
  const servicesRaw = servicesResponse?.data || [];
  const servicesTotalCount = servicesResponse?.totalCount || 0;

  const { data: tenantsResponse } = useTenants(1, 50, undefined, isServiceModalOpen);
  const tenants = tenantsResponse?.data || [];

  // Full list of variants for dialog lookups
  const { data: allVariants = [] } = useServiceVariants(
    1,
    9999,
    undefined,
    null,
    true
  );

  // Paginated list of variants for the table
  const { data: pagedVariantsRaw = [], totalCount: variantsTotalCount = 0, error: varErr, isLoading: loadingVariants, mutate: mutVar } = useServiceVariants(
    variantsPage,
    pageSize,
    variantsSearch,
    variantsFilterServiceId.trim().length > 0 ? variantsFilterServiceId.trim() : null,
    activeTab === "variants"
  );
  // Full list of requirements for dropdowns and mappings
  const { data: requirements = [], mutate: mutReq } = useRequirements(
    1,
    9999,
    undefined,
    activeTab === "requirements" || activeTab === "service-requirements"
  );

  // Paginated list of requirements for the table
  const { data: pagedRequirementsRaw = [], totalCount: requirementsTotalCount = 0, error: reqErr, isLoading: loadingReqs, mutate: mutPagedReq } = useRequirements(
    requirementsPage,
    pageSize,
    requirementsSearch,
    activeTab === "requirements"
  );
  const { data: flatMappings = [], error: mapErr, isLoading: loadingAllMapped, mutate: mutFlatMap } = useServiceVariantRequirements(
    undefined,
    activeTab === "service-variant-requirements"
  );

  // Service Variant Specific Checklist (Tab 4)
  const { data: serviceRequirements = [], error: svcReqErr, isLoading: loadingServiceReqs, mutate: mutSvcReq } = useServiceRequirements(
    activeTab === "service-requirements" && mappingServiceId ? mappingServiceId : undefined,
    activeTab === "service-requirements" && mappingVariantId ? mappingVariantId : undefined,
    undefined,
    activeTab === "service-requirements"
  );

  // Elements Catalog data (global)
  const { data: elements = [], totalCount: elementsTotalCount, isLoading: loadingElements, mutate: mutElements } = useElements(
    activeTab === "elements" ? elementsPage : 1,
    activeTab === "elements" ? pageSize : 9999,
    activeTab === "elements" ? elementsSearch : undefined,
    activeTab === "elements"
  );

  const [varElementsPage, setVarElementsPage] = useState(1);

  useEffect(() => {
    setVarElementsPage(1);
  }, [mappingVariantId]);

  // Service Variant Elements data
  const { data: serviceVariantElements = [], totalCount: varElementsTotalCount, isLoading: loadingVarElements, mutate: mutVarElements } = useServiceVariantElements(
    activeTab === "variant-elements" && mappingVariantId ? mappingVariantId : null,
    activeTab === "variant-elements" && mappingServiceId ? mappingServiceId : null,
    activeTab === "variant-elements" ? varElementsPage : 1,
    activeTab === "variant-elements" ? pageSize : 10,
    activeTab === "variant-elements" ? elementsSearch : undefined,
    activeTab === "variant-elements" && (!!mappingVariantId || !!mappingServiceId)
  );

  // Notes data
  const { data: notes = [], totalCount: notesTotalCount, isLoading: loadingNotes, mutate: mutNotes } = useNotes(
    activeTab === "notes" ? notesPage : 1,
    activeTab === "notes" ? pageSize : 9999,
    activeTab === "notes" ? notesSearch : undefined,
    activeTab === "notes" ? notesFilterServiceId : undefined,
    activeTab === "notes" ? notesFilterVariantId : undefined,
    activeTab === "notes"
  );

  // Services list for notes dialog and variant filter
  const { data: servicesForNotes = [] } = useServicesForNotes(
    activeTab === "notes" || activeTab === "variants" || activeTab === "variant-elements" || isNoteModalOpen || isVariantModalOpen
  );

  // Variants for notes filter (keyed by filterServiceId)
  const { data: variantsForNotesFilter = [] } = useVariantsForNotes(
    notesFilterServiceId,
    (activeTab === "notes" || isNoteModalOpen) && !!notesFilterServiceId
  );

  // Reset page when category changes
  useEffect(() => {
    setServicesPage(1);
  }, [selectedCategoryId]);

  // Reset variants page when variants filter changes
  useEffect(() => {
    setVariantsPage(1);
  }, [variantsFilterServiceId]);

  // Forbidden Check
  const forbidden = isForbiddenError(catErr) || isForbiddenError(svcErr) || isForbiddenError(varErr) || isForbiddenError(reqErr) || isForbiddenError(mapErr) || isForbiddenError(svcReqErr);

  // Automatic variant pre-selection in Tab 4 and Tab 7 (excluding NA variants)
  const mappingVariants = useMemo(() => {
    if (!mappingServiceId) return [];
    return allVariants.filter((v: ServiceVariant) => v.serviceId === mappingServiceId && v.type !== "NA" && v.type !== "N/A");
  }, [allVariants, mappingServiceId]);

  useEffect(() => {
    if (mappingVariants.length > 0) {
      const hasMatch = mappingVariants.some(v => v.id === mappingVariantId);
      if (!hasMatch) setMappingVariantId(mappingVariants[0].id);
    } else {
      setMappingVariantId("");
    }
  }, [mappingVariants, mappingVariantId]);

  // Sync Tab 4 selection default
  useEffect(() => {
    if (servicesRaw.length > 0 && !mappingServiceId) {
      setMappingServiceId(servicesRaw[0].id);
    }
  }, [servicesRaw, mappingServiceId]);

  // Filter Category & Service Data list
  const services = useMemo(() => {
    return servicesRaw;
  }, [servicesRaw]);

  // Filtering search queries
  const filteredServices = useMemo(() => {
    if (activeTab === "services") {
      return Array(servicesTotalCount).fill({});
    }
    return servicesRaw;
  }, [activeTab, servicesRaw, servicesTotalCount]);

  const pagedServices = useMemo(() => {
    return servicesRaw;
  }, [servicesRaw]);

  const filteredVariants = useMemo(() => {
    if (activeTab === "variants") {
      return Array(variantsTotalCount).fill({});
    }
    return pagedVariantsRaw;
  }, [activeTab, pagedVariantsRaw, variantsTotalCount]);

  const pagedVariants = useMemo(() => {
    return pagedVariantsRaw;
  }, [pagedVariantsRaw]);

  const filteredRequirements = useMemo(() => {
    if (activeTab === "requirements") {
      return Array(requirementsTotalCount).fill({});
    }
    return pagedRequirementsRaw;
  }, [activeTab, pagedRequirementsRaw, requirementsTotalCount]);

  const pagedRequirements = useMemo(() => {
    return pagedRequirementsRaw;
  }, [pagedRequirementsRaw]);

  const filteredFlatMappings = useMemo(() => {
    const term = flatMappingsSearch.toLowerCase();
    return flatMappings.filter((mr: ServiceVariantRequirement) => (mr.serviceName || "").toLowerCase().includes(term) || (mr.requirement?.name || "").toLowerCase().includes(term) || (mr.contextKey || "").toLowerCase().includes(term));
  }, [flatMappings, flatMappingsSearch]);

  const pagedFlatMappings = useMemo(() => {
    const start = (flatMappingsPage - 1) * pageSize;
    return filteredFlatMappings.slice(start, start + pageSize);
  }, [filteredFlatMappings, flatMappingsPage, pageSize]);

  const showToast = (message: string, type: "success" | "error" = "success") => setToast({ message, type });

  const invalidatePrefix = (prefix: string) => {
    globalMutate((key: unknown) => typeof key === "string" && key.startsWith(prefix));
  };

  // Dialog openers
  const handleOpenEditCategory = (cat: ServiceCategory) => { setEditingCategory(cat); setIsCategoryModalOpen(true); };
  const handleOpenEditService = (s: any) => { setEditingService(s); setIsServiceModalOpen(true); };
  const handleOpenEditVariant = (v: ServiceVariant) => { setEditingVariant(v); setIsVariantModalOpen(true); };
  const handleOpenEditRequirement = (r: Requirement) => { setEditingReq(r); setIsReqModalOpen(true); };
  const handleOpenEditMapping = (mr: any) => { setEditingMapping(mr); setIsMappingFormOpen(true); };
  const handleOpenEditElement = (el: Element) => { setEditingElement(el); setIsElementModalOpen(true); };
  const handleOpenEditVarElement = (el: ServiceVariantElement) => { setEditingVarElement(el); setIsVarElementModalOpen(true); };
  const handleOpenEditNote = (n: Note) => { setEditingNote(n); setIsNoteModalOpen(true); };

  // Submit Handlers
  const handleCategorySubmit = async (data: any) => {
    setIsCategorySubmitting(true);
    const apiCall = editingCategory ? updateServiceCategory(editingCategory.id, data) : createServiceCategory(data);
    const [res, err] = await safeAsync(apiCall);
    if (res) {
      showToast(`Service category ${editingCategory ? "updated" : "created"} successfully.`);
      mutCat();
      setIsCategoryModalOpen(false);
    } else {
      showToast(getErrorMessage(err, "Failed to save category."), "error");
    }
    setIsCategorySubmitting(false);
  };

  const handleServiceSubmit = async (data: any) => {
    setIsServiceSubmitting(true);
    const apiCall = editingService 
      ? updateService(editingService.tenantId, editingService.id, data) 
      : createService(data.tenantId, data);
    const [res, err] = await safeAsync(apiCall);
    if (res) {
      showToast(`Service ${editingService ? "updated" : "registered"} successfully.`);
      mutSvc();
      setIsServiceModalOpen(false);
    } else {
      showToast(getErrorMessage(err, "Failed to save service."), "error");
    }
    setIsServiceSubmitting(false);
  };

  const handleVariantSubmit = async (data: any) => {
    setIsVariantSubmitting(true);
    const apiCall = (editingVariant ? updateServiceVariant(editingVariant.id, data) : createServiceVariant(data)) as Promise<any>;
    const [res, err] = await safeAsync(apiCall);
    if (res) {
      showToast(`Variant ${editingVariant ? "updated" : "created"} successfully.`);
      mutVar();
      setIsVariantModalOpen(false);
    } else {
      showToast(getErrorMessage(err, "Failed to save variant."), "error");
    }
    setIsVariantSubmitting(false);
  };

  const handleReqSubmit = async (data: any) => {
    setIsReqSubmitting(true);
    const apiCall = editingReq ? updateRequirement(editingReq.id, data) : createRequirement(data);
    const [res, err] = await safeAsync(apiCall);
    if (res) {
      showToast(`Requirement ${editingReq ? "updated" : "created"} successfully.`);
      mutReq();
      mutPagedReq();
      invalidatePrefix("/api/v2/requirements");
      setIsReqModalOpen(false);
    } else {
      showToast(getErrorMessage(err, "Failed to save requirement."), "error");
    }
    setIsReqSubmitting(false);
  };

  const handleMappingSubmit = async (data: any) => {
    setIsMappingSubmitting(true);
    let apiCall;
    if (editingMapping) {
      apiCall = updateServiceVariantRequirement(editingMapping.id, {
        requirementId: editingMapping.requirementId,
        serviceVariantId: editingMapping.serviceVariantId,
        contextKey: data.contextKey,
        isRequired: data.isRequired
      });
    } else {
      apiCall = attachServiceVariantRequirement(data.serviceId, data.variantId, {
        requirementId: data.requirementId,
        contextKey: data.contextKey,
        isRequired: data.isRequired
      });
    }
    const [res, err] = await safeAsync(apiCall as Promise<any>);
    if (res) {
      showToast("Checklist rule updated successfully.");
      mutSvcReq();
      mutFlatMap();
      setIsMappingFormOpen(false);
    } else {
      throw err;
    }
    setIsMappingSubmitting(false);
  };

  // Elements CRUD (Global)
  const handleElementSubmit = async (data: { code: string; name: string; description: string }) => {
    setIsElementSubmitting(true);
    const apiCall = editingElement
      ? updateElement(editingElement.id, { code: data.code.toUpperCase(), name: data.name, description: data.description || null })
      : createElement({ code: data.code.toUpperCase(), name: data.name, description: data.description || null });
    const [res, err] = await safeAsync(apiCall);
    if (res) {
      showToast(`Element ${editingElement ? "updated" : "created"} successfully.`);
      mutElements();
      invalidatePrefix("/api/v2/elements");
      setIsElementModalOpen(false);
    } else {
      showToast(getErrorMessage(err, "Failed to save element."), "error");
    }
    setIsElementSubmitting(false);
  };

  const handleDeleteElementConfirm = async () => {
    if (!deletingElementId) return;
    const [res, err] = await safeAsync(deleteElement(deletingElementId));
    if (res) {
      showToast("Element deleted.");
      mutElements();
      invalidatePrefix("/api/v2/elements");
    }
    else showToast(getErrorMessage(err, "Failed to delete element."), "error");
    setDeletingElementId(null);
  };

  // Variant Elements CRUD (Variant-Specific)
  const handleVarElementSubmit = async (data: { code: string; description: string }) => {
    if (!mappingVariantId) return;
    setIsVarElementSubmitting(true);
    const apiCall = editingVarElement
      ? updateServiceVariantElement(editingVarElement.id, { code: data.code.toUpperCase(), description: data.description || "" })
      : createServiceVariantElement({ serviceVariantId: mappingVariantId, code: data.code.toUpperCase(), description: data.description || "" });
    const [res, err] = await safeAsync(apiCall);
    if (res) {
      showToast(`Variant element ${editingVarElement ? "updated" : "created"} successfully.`);
      mutVarElements();
      invalidatePrefix("/api/v2/service-variant-elements");
      setIsVarElementModalOpen(false);
    } else {
      showToast(getErrorMessage(err, "Failed to save variant element."), "error");
    }
    setIsVarElementSubmitting(false);
  };

  const handleDeleteVarElementConfirm = async () => {
    if (!deletingVarElementId) return;
    const [res, err] = await safeAsync(deleteServiceVariantElement(deletingVarElementId));
    if (res) {
      showToast("Variant element deleted.");
      mutVarElements();
      invalidatePrefix("/api/v2/service-variant-elements");
    }
    else showToast(getErrorMessage(err, "Failed to delete variant element."), "error");
    setDeletingVarElementId(null);
  };

  // Notes CRUD
  const handleNoteSubmit = async (data: { notes: string; serviceId: string; serviceVariantId: string }) => {
    setIsNoteSubmitting(true);
    const payload = {
      notes: data.notes,
      serviceId: data.serviceId,
      serviceVariantId: data.serviceVariantId || null
    };
    const apiCall = editingNote
      ? updateNote(editingNote.id, payload)
      : createNote(payload);
    const [res, err] = await safeAsync(apiCall);
    if (res) {
      showToast(`Note ${editingNote ? "updated" : "created"} successfully.`);
      mutNotes();
      invalidatePrefix("/api/v2/notes");
      setIsNoteModalOpen(false);
    } else {
      showToast(getErrorMessage(err, "Failed to save note."), "error");
    }
    setIsNoteSubmitting(false);
  };

  const handleDeleteNoteConfirm = async () => {
    if (!deletingNoteId) return;
    const [res, err] = await safeAsync(deleteNote(deletingNoteId));
    if (res) { showToast("Note deleted."); mutNotes(); invalidatePrefix("/api/v2/notes"); }
    else showToast(getErrorMessage(err, "Failed to delete note."), "error");
    setDeletingNoteId(null);
  };

  // Delete Handlers
  const handleDeleteCategoryConfirm = async () => {
    if (!deletingCategoryId) return;
    const [res, err] = await safeAsync(deleteServiceCategory(deletingCategoryId));
    if (res) { showToast("Category deleted."); mutCat(); }
    else showToast(getErrorMessage(err, "Failed to delete category."), "error");
    setDeletingCategoryId(null);
  };

  const handleDeleteServiceConfirm = async () => {
    if (!deletingServiceId) return;
    const service = servicesRaw.find(s => s.id === deletingServiceId);
    const tenantId = service?.tenantId || null;
    const [res, err] = await safeAsync(deleteService(tenantId, deletingServiceId));
    if (res) { showToast("Service deleted."); mutSvc(); }
    else showToast(getErrorMessage(err, "Failed to delete service. Check for active applications."), "error");
    setDeletingServiceId(null);
  };

  const handleDeleteVariantConfirm = async () => {
    if (!deletingVariantId) return;
    const [res, err] = await safeAsync(deleteServiceVariant(deletingVariantId));
    if (res) { showToast("Variant deleted."); mutVar(); }
    else showToast(getErrorMessage(err, "Failed to delete variant."), "error");
    setDeletingVariantId(null);
  };

  const handleDeleteReqConfirm = async () => {
    if (!deletingReqId) return;
    const [res, err] = await safeAsync(deleteRequirement(deletingReqId));
    if (res) {
      showToast("Requirement deleted.");
      mutReq();
      mutPagedReq();
      invalidatePrefix("/api/v2/requirements");
    }
    else showToast(getErrorMessage(err, "Failed to delete requirement."), "error");
    setDeletingReqId(null);
  };

  const handleDeleteMappingConfirm = async () => {
    if (!deletingMappingId) return;
    const mapping = flatMappings.find((m: ServiceVariantRequirement) => m.id === deletingMappingId) || serviceRequirements.find((m: any) => m.serviceVariantRequirementId === deletingMappingId);
    if (!mapping) {
      showToast("Failed to locate checklist mapping.", "error");
      setDeletingMappingId(null);
      return;
    }
    const sId = mapping.serviceId ?? mappingServiceId;
    const vId = mapping.serviceVariantId ?? mappingVariantId;
    const [res, err] = await safeAsync(unlinkServiceVariantRequirement(sId, vId, deletingMappingId));
    if (res) { showToast("Requirement unlinked."); mutSvcReq(); mutFlatMap(); }
    else showToast(getErrorMessage(err, "Failed to unlink requirement."), "error");
    setDeletingMappingId(null);
  };

  return {
    toast, setToast, activeTab, setActiveTab,
    servicesSearch, setServicesSearch, variantsSearch, setVariantsSearch,
    requirementsSearch, setRequirementsSearch, flatMappingsSearch, setFlatMappingsSearch,
    elementsSearch, setElementsSearch, notesSearch, setNotesSearch,
    servicesPage, setServicesPage, variantsPage, setVariantsPage,
    requirementsPage, setRequirementsPage, flatMappingsPage, setFlatMappingsPage,
    elementsPage, setElementsPage, notesPage, setNotesPage,
    pageSize, setPageSize, selectedCategoryId, setSelectedCategoryId,
    mappingServiceId, setMappingServiceId, mappingVariantId, setMappingVariantId,
    isCategoryModalOpen, setIsCategoryModalOpen, editingCategory, setEditingCategory,
    isCategorySubmitting, deletingCategoryId, setDeletingCategoryId,
    isServiceModalOpen, setIsServiceModalOpen, editingService, setEditingService,
    isServiceSubmitting, deletingServiceId, setDeletingServiceId,
    isVariantModalOpen, setIsVariantModalOpen, editingVariant, setEditingVariant,
    isVariantSubmitting, deletingVariantId, setDeletingVariantId,
    isReqModalOpen, setIsReqModalOpen, editingReq, setEditingReq,
    isReqSubmitting, deletingReqId, setDeletingReqId,
    isMappingFormOpen, setIsMappingFormOpen, editingMapping, setEditingMapping,
    isMappingSubmitting, deletingMappingId, setDeletingMappingId,
    // Elements
    isElementModalOpen, setIsElementModalOpen, editingElement, setEditingElement,
    isElementSubmitting, deletingElementId, setDeletingElementId,
    elements, elementsTotalCount, loadingElements,
    handleOpenEditElement, handleElementSubmit, handleDeleteElementConfirm,
    // Variant Elements
    isVarElementModalOpen, setIsVarElementModalOpen, editingVarElement, setEditingVarElement,
    isVarElementSubmitting, deletingVarElementId, setDeletingVarElementId,
    serviceVariantElements, varElementsTotalCount, loadingVarElements,
    varElementsPage, setVarElementsPage,
    handleOpenEditVarElement, handleVarElementSubmit, handleDeleteVarElementConfirm,
    // Notes
    isNoteModalOpen, setIsNoteModalOpen, editingNote, setEditingNote,
    isNoteSubmitting, deletingNoteId, setDeletingNoteId,
    notes, notesTotalCount, loadingNotes,
    servicesForNotes, variantsForNotesFilter,
    notesFilterServiceId, setNotesFilterServiceId, notesFilterVariantId, setNotesFilterVariantId,
    // Variants filter
    variantsFilterServiceId, setVariantsFilterServiceId, variantsTotalCount,
    handleOpenEditNote, handleNoteSubmit, handleDeleteNoteConfirm,
    categories, servicesRaw, tenants, allVariants, requirements, flatMappings, serviceRequirements,
    loadingServices, loadingVariants, loadingReqs, loadingAllMapped, loadingServiceReqs,
    forbidden, mappingVariants, services, filteredServices, pagedServices,
    filteredVariants, pagedVariants, filteredRequirements, pagedRequirements,
    filteredFlatMappings, pagedFlatMappings,
    handleOpenEditCategory, handleOpenEditService, handleOpenEditVariant,
    handleOpenEditRequirement, handleOpenEditMapping,
    handleCategorySubmit, handleServiceSubmit, handleVariantSubmit,
    handleReqSubmit, handleMappingSubmit,
    handleDeleteCategoryConfirm, handleDeleteServiceConfirm, handleDeleteVariantConfirm,
    handleDeleteReqConfirm, handleDeleteMappingConfirm
  };
}
