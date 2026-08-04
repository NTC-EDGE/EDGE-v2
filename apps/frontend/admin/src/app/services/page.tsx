"use client";

import { Boxes, Plus, Search, Settings2, Link2, ClipboardList, FolderPlus } from "lucide-react";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { ToastNotification } from "@/components/ui/toast-notification";
import { PageForbiddenState } from "@/components/PageForbiddenState";
import { Button } from "@/components/ui/button";

// Import custom hook
import { useServicesPage, TabType } from "./hooks/useServicesPage";

// Import subcomponents
import { ServiceCategoryDialog } from "./components/ServiceCategoryDialog";
import { CatalogServiceDialog } from "./components/CatalogServiceDialog";
import { ServiceVariantDialog } from "./components/ServiceVariantDialog";
import { RequirementCatalogDialog } from "./components/RequirementCatalogDialog";
import { MappingDialog } from "./components/MappingDialog";
import { CatalogServicesTab } from "./components/CatalogServicesTab";
import { ServiceVariantsTab } from "./components/ServiceVariantsTab";
import { RequirementsCatalogTab } from "./components/RequirementsCatalogTab";
import { ServiceRequirementsTab } from "./components/ServiceRequirementsTab";
import { ServiceVariantRequirementsTab } from "./components/ServiceVariantRequirementsTab";

export default function ServicesPage() {
  const p = useServicesPage();

  if (p.forbidden) return <PageForbiddenState />;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <div className="border-b border-slate-900 bg-slate-900/50 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Boxes className="h-5 w-5 text-indigo-500" /> Services Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">Configure service directories, forms, checklists, and document verification rules.</p>
        </div>

        <div className="flex items-center gap-2">
          {p.activeTab === "services" && (
            <>
              <Button onClick={() => { p.setEditingCategory(null); p.setIsCategoryModalOpen(true); }} variant="outline" className="text-xs py-1.5 h-auto">
                <FolderPlus className="h-3.5 w-3.5 mr-1" /> New Category
              </Button>
              <Button onClick={() => { p.setEditingService(null); p.setIsServiceModalOpen(true); }} className="bg-indigo-600 text-xs py-1.5 h-auto">
                <Plus className="h-3.5 w-3.5 mr-1" /> New Service
              </Button>
            </>
          )}
          {p.activeTab === "variants" && (
            <Button onClick={() => { p.setEditingVariant(null); p.setMappingServiceId(p.servicesRaw.length > 0 ? p.servicesRaw[0].id : ""); p.setIsVariantModalOpen(true); }} className="bg-indigo-600 text-xs py-1.5 h-auto">
              <Settings2 className="h-3.5 w-3.5 mr-1" /> New Variant
            </Button>
          )}
          {p.activeTab === "requirements" && (
            <Button onClick={() => { p.setEditingReq(null); p.setIsReqModalOpen(true); }} className="bg-indigo-600 text-xs py-1.5 h-auto">
              <ClipboardList className="h-3.5 w-3.5 mr-1" /> New Catalog Requirement
            </Button>
          )}
          {p.activeTab === "service-variant-requirements" && (
            <Button onClick={() => { p.setEditingMapping(null); p.setIsMappingFormOpen(true); }} className="bg-indigo-600 text-xs py-1.5 h-auto">
              <Link2 className="h-3.5 w-3.5 mr-1" /> Link Master Requirement
            </Button>
          )}
        </div>
      </div>

      <div className="border-b border-slate-900 bg-slate-900/30 px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-900">
          {(["services", "variants", "requirements", "service-requirements", "service-variant-requirements"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => p.setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                p.activeTab === tab ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "services" ? "Services Catalog" : tab === "variants" ? "Variants" : tab === "requirements" ? "Master Requirements" : tab === "service-requirements" ? "Service Checklist Mappings" : "Flat Checklist Mappings"}
            </button>
          ))}
        </div>

        {/* Global Search bar */}
        {p.activeTab !== "service-requirements" && (
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder={`Search ${p.activeTab}...`}
              value={p.activeTab === "services" ? p.servicesSearch : p.activeTab === "variants" ? p.variantsSearch : p.activeTab === "requirements" ? p.requirementsSearch : p.activeTab === "service-variant-requirements" ? p.flatMappingsSearch : ""}
              onChange={(e) => {
                const val = e.target.value;
                if (p.activeTab === "services") { p.setServicesSearch(val); p.setServicesPage(1); }
                else if (p.activeTab === "variants") { p.setVariantsSearch(val); p.setVariantsPage(1); }
                else if (p.activeTab === "requirements") { p.setRequirementsSearch(val); p.setRequirementsPage(1); }
                else if (p.activeTab === "service-variant-requirements") { p.setFlatMappingsSearch(val); p.setFlatMappingsPage(1); }
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-900 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </div>

      {p.activeTab === "services" && (
        <CatalogServicesTab
          categories={p.categories} selectedCategoryId={p.selectedCategoryId} onSelectCategoryId={p.setSelectedCategoryId}
          onEditCategory={p.handleOpenEditCategory} onDeleteCategory={p.setDeletingCategoryId}
          loadingServices={p.loadingServices} pagedServices={p.pagedServices} filteredServices={p.filteredServices}
          servicesPage={p.servicesPage} pageSize={p.pageSize} onPageChange={p.setServicesPage} onPageSizeChange={p.setPageSize}
          onEditService={p.handleOpenEditService} onDeleteService={p.setDeletingServiceId}
        />
      )}

      {p.activeTab === "variants" && (
        <ServiceVariantsTab
          loadingVariants={p.loadingVariants} pagedVariants={p.pagedVariants} filteredVariants={p.filteredVariants}
          variantsPage={p.variantsPage} pageSize={p.pageSize} onPageChange={p.setVariantsPage} onPageSizeChange={p.setPageSize}
          onEditVariant={p.handleOpenEditVariant} onDeleteVariant={p.setDeletingVariantId}
        />
      )}

      {p.activeTab === "requirements" && (
        <RequirementsCatalogTab
          loadingReqs={p.loadingReqs} pagedRequirements={p.pagedRequirements} filteredRequirements={p.filteredRequirements}
          requirementsPage={p.requirementsPage} pageSize={p.pageSize} onPageChange={p.setRequirementsPage} onPageSizeChange={p.setPageSize}
          onEditRequirement={p.handleOpenEditRequirement} onDeleteRequirement={p.setDeletingReqId}
        />
      )}

      {p.activeTab === "service-requirements" && (
        <ServiceRequirementsTab
          services={p.services} filteredServices={p.filteredServices} servicesSearch={p.servicesSearch} onServicesSearchChange={p.setServicesSearch}
          mappingServiceId={p.mappingServiceId} onSelectMappingServiceId={p.setMappingServiceId}
          mappingVariants={p.mappingVariants} mappingVariantId={p.mappingVariantId} onSelectMappingVariantId={p.setMappingVariantId}
          requirements={p.requirements} onOpenLinkMapping={() => { p.setEditingMapping(null); p.setIsMappingFormOpen(true); }}
          onOpenCreateVariant={(svcId) => { p.setEditingVariant(null); p.setMappingServiceId(svcId); p.setIsVariantModalOpen(true); }}
          loadingServiceReqs={p.loadingServiceReqs} serviceRequirements={p.serviceRequirements}
          onEditMapping={p.handleOpenEditMapping} onDeleteMapping={p.setDeletingMappingId}
        />
      )}

      {p.activeTab === "service-variant-requirements" && (
        <ServiceVariantRequirementsTab
          loadingAllMapped={p.loadingAllMapped} pagedFlatMappings={p.pagedFlatMappings} filteredFlatMappings={p.filteredFlatMappings}
          flatMappingsPage={p.flatMappingsPage} pageSize={p.pageSize} onPageChange={p.setFlatMappingsPage} onPageSizeChange={p.setPageSize}
          onEditMapping={p.handleOpenEditMapping} onDeleteMapping={p.setDeletingMappingId}
        />
      )}

      {/* Dialog Subcomponents */}
      <ServiceCategoryDialog isOpen={p.isCategoryModalOpen} onClose={() => p.setIsCategoryModalOpen(false)} onSubmit={p.handleCategorySubmit} editingCategory={p.editingCategory} isSubmitting={p.isCategorySubmitting} />
      <CatalogServiceDialog isOpen={p.isServiceModalOpen} onClose={() => p.setIsServiceModalOpen(false)} onSubmit={p.handleServiceSubmit} editingService={p.editingService} isSubmitting={p.isServiceSubmitting} categories={p.categories} tenants={p.tenants} />
      <ServiceVariantDialog isOpen={p.isVariantModalOpen} onClose={() => p.setIsVariantModalOpen(false)} onSubmit={p.handleVariantSubmit} editingVariant={p.editingVariant} isSubmitting={p.isVariantSubmitting} services={p.servicesRaw} allVariants={p.allVariants} initialServiceId={p.mappingServiceId} />
      <RequirementCatalogDialog isOpen={p.isReqModalOpen} onClose={() => p.setIsReqModalOpen(false)} onSubmit={p.handleReqSubmit} editingReq={p.editingReq} isSubmitting={p.isReqSubmitting} />
      <MappingDialog isOpen={p.isMappingFormOpen} onClose={() => p.setIsMappingFormOpen(false)} onSubmit={p.handleMappingSubmit} editingMapping={p.editingMapping} isSubmitting={p.isMappingSubmitting} services={p.servicesRaw} allVariants={p.allVariants} availableRequirements={p.requirements} activeTab={p.activeTab} mappingServiceId={p.mappingServiceId} mappingVariantId={p.mappingVariantId} mappingVariants={p.mappingVariants} />

      {/* Action Confirmation Dialogs */}
      <ConfirmActionDialog isOpen={p.deletingCategoryId !== null} onClose={() => p.setDeletingCategoryId(null)} onConfirm={p.handleDeleteCategoryConfirm} title="Delete Service Category" description="Are you sure you want to delete this service category? Categories with existing associated services cannot be deleted." confirmLabel="Delete Category" cancelLabel="Cancel" />
      <ConfirmActionDialog isOpen={p.deletingServiceId !== null} onClose={() => p.setDeletingServiceId(null)} onConfirm={p.handleDeleteServiceConfirm} title="Delete Catalog Service" description="Are you sure you want to delete this catalog service? Services with existing variants or configurations cannot be deleted." confirmLabel="Delete Service" cancelLabel="Cancel" />
      <ConfirmActionDialog isOpen={p.deletingVariantId !== null} onClose={() => p.setDeletingVariantId(null)} onConfirm={p.handleDeleteVariantConfirm} title="Delete Service Variant" description="Are you sure you want to delete this service variant? Variants with linked checklist items cannot be deleted." confirmLabel="Delete Variant" cancelLabel="Cancel" />
      <ConfirmActionDialog isOpen={p.deletingReqId !== null} onClose={() => p.setDeletingReqId(null)} onConfirm={p.handleDeleteReqConfirm} title="Delete Requirement" description="Are you sure you want to delete this catalog requirement? Requirements actively mapped to variants will fail to delete." confirmLabel="Delete Requirement" cancelLabel="Cancel" />
      <ConfirmActionDialog isOpen={p.deletingMappingId !== null} onClose={() => p.setDeletingMappingId(null)} onConfirm={p.handleDeleteMappingConfirm} title="Unlink Requirement" description="Are you sure you want to unlink this requirement from the service variant? This will remove it from the citizen's checklist." confirmLabel="Unlink Requirement" cancelLabel="Cancel" />

      {p.toast && <ToastNotification toast={p.toast} onClose={() => p.setToast(null)} />}
    </div>
  );
}
