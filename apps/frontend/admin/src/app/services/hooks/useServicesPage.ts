"use client";

import { useState, useMemo, useEffect } from "react";
import { safeAsync } from "@edge/api";
import { useCatalogService, ServiceCategory } from "@/services/catalogService";
import { useTenantService } from "@/services/tenantService";
import { useRequirementsService } from "@/services/requirementsService";
import { ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";
import { Requirement, ServiceVariant, ServiceVariantRequirement } from "@edge/api";
import { isForbiddenError } from "@/components/PageForbiddenState";

export type TabType = "services" | "variants" | "requirements" | "service-requirements" | "service-variant-requirements";

export function useServicesPage() {
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
  const [pageSize, setPageSize] = useState(10);

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

  // Queries
  const { data: categoriesResponse, error: catErr, mutate: mutCat } = useServiceCategories();
  const categories = categoriesResponse?.data || [];

  const { data: servicesResponse, error: svcErr, isLoading: loadingServices, mutate: mutSvc } = useServices();
  const servicesRaw = servicesResponse?.data || [];

  const { data: tenantsResponse } = useTenants();
  const tenants = tenantsResponse?.data || [];

  const { data: allVariants = [], error: varErr, isLoading: loadingVariants, mutate: mutVar } = useServiceVariants();
  const { data: requirements = [], error: reqErr, isLoading: loadingReqs, mutate: mutReq } = useRequirements();
  const { data: flatMappings = [], error: mapErr, isLoading: loadingAllMapped, mutate: mutFlatMap } = useServiceVariantRequirements();

  // Service Variant Specific Checklist (Tab 4)
  const { data: serviceRequirements = [], error: svcReqErr, isLoading: loadingServiceReqs, mutate: mutSvcReq } = useServiceRequirements(
    activeTab === "service-requirements" && mappingServiceId ? mappingServiceId : undefined,
    activeTab === "service-requirements" && mappingVariantId ? mappingVariantId : undefined
  );

  // Forbidden Check
  const forbidden = isForbiddenError(catErr) || isForbiddenError(svcErr) || isForbiddenError(varErr) || isForbiddenError(reqErr) || isForbiddenError(mapErr) || isForbiddenError(svcReqErr);

  // Automatic variant pre-selection in Tab 4
  const mappingVariants = useMemo(() => {
    if (!mappingServiceId) return [];
    return allVariants.filter((v: ServiceVariant) => v.serviceId === mappingServiceId);
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
    if (selectedCategoryId === "ALL") return servicesRaw;
    return servicesRaw.filter(s => s.serviceCategoryId === selectedCategoryId);
  }, [servicesRaw, selectedCategoryId]);

  // Filtering search queries
  const filteredServices = useMemo(() => {
    const term = (activeTab === "service-requirements" ? servicesSearch : "").toLowerCase();
    return services.filter(s => s.name.toLowerCase().includes(term) || (s.code?.toLowerCase() || "").includes(term) || (s.group?.toLowerCase() || "").includes(term));
  }, [services, servicesSearch, activeTab]);

  const pagedServices = useMemo(() => {
    const start = (servicesPage - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, servicesPage, pageSize]);

  const filteredVariants = useMemo(() => {
    const term = variantsSearch.toLowerCase();
    return allVariants.filter((v: ServiceVariant) => (v.serviceName?.toLowerCase() || "").includes(term) || v.type.toLowerCase().includes(term) || (v.description?.toLowerCase() || "").includes(term));
  }, [allVariants, variantsSearch]);

  const pagedVariants = useMemo(() => {
    const start = (variantsPage - 1) * pageSize;
    return filteredVariants.slice(start, start + pageSize);
  }, [filteredVariants, variantsPage, pageSize]);

  const filteredRequirements = useMemo(() => {
    const term = requirementsSearch.toLowerCase();
    return requirements.filter((r: Requirement) => r.name.toLowerCase().includes(term) || (r.description?.toLowerCase() || "").includes(term));
  }, [requirements, requirementsSearch]);

  const pagedRequirements = useMemo(() => {
    const start = (requirementsPage - 1) * pageSize;
    return filteredRequirements.slice(start, start + pageSize);
  }, [filteredRequirements, requirementsPage, pageSize]);

  const filteredFlatMappings = useMemo(() => {
    const term = flatMappingsSearch.toLowerCase();
    return flatMappings.filter((mr: ServiceVariantRequirement) => (mr.serviceName || "").toLowerCase().includes(term) || (mr.requirement?.name || "").toLowerCase().includes(term) || (mr.contextKey || "").toLowerCase().includes(term));
  }, [flatMappings, flatMappingsSearch]);

  const pagedFlatMappings = useMemo(() => {
    const start = (flatMappingsPage - 1) * pageSize;
    return filteredFlatMappings.slice(start, start + pageSize);
  }, [filteredFlatMappings, flatMappingsPage, pageSize]);

  const showToast = (message: string, type: "success" | "error" = "success") => setToast({ message, type });

  // Dialog openers
  const handleOpenEditCategory = (cat: ServiceCategory) => { setEditingCategory(cat); setIsCategoryModalOpen(true); };
  const handleOpenEditService = (s: any) => { setEditingService(s); setIsServiceModalOpen(true); };
  const handleOpenEditVariant = (v: ServiceVariant) => { setEditingVariant(v); setIsVariantModalOpen(true); };
  const handleOpenEditRequirement = (r: Requirement) => { setEditingReq(r); setIsReqModalOpen(true); };
  const handleOpenEditMapping = (mr: any) => { setEditingMapping(mr); setIsMappingFormOpen(true); };

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
    if (res) { showToast("Requirement deleted."); mutReq(); }
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
    servicesPage, setServicesPage, variantsPage, setVariantsPage,
    requirementsPage, setRequirementsPage, flatMappingsPage, setFlatMappingsPage,
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
