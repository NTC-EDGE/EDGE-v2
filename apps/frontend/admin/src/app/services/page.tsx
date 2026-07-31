"use client";

import { useState } from "react";
import {
  Boxes,
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Layers,
  FolderPlus,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  Building2
} from "lucide-react";
import { safeAsync } from "@edge/api";
import {
  useCatalogService,
  ServiceCategory,
  ServiceItem,
} from "@/services/catalogService";
import { useTenantService } from "@/services/tenantService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { ToastNotification, ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";

export default function ServicesPage() {
  const {
    useServiceCategories,
    createServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    useServices,
    createService,
    updateService,
    deleteService,
  } = useCatalogService();

  const { useTenants } = useTenantService();

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Categories Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [categoryType, setCategoryType] = useState("License");
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  // Services Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceCategoryId, setServiceCategoryId] = useState("");
  const [serviceTenantId, setServiceTenantId] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceGroup, setServiceGroup] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [isServiceSubmitting, setIsServiceSubmitting] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  // Queries
  const { data: categoriesResponse, mutate: mutateCategories } = useServiceCategories();
  const categories: ServiceCategory[] = categoriesResponse?.data ?? [];

  const { data: servicesResponse, mutate: mutateServices, isLoading } = useServices(
    selectedCategoryId !== "ALL" ? selectedCategoryId : undefined
  );
  const services: ServiceItem[] = servicesResponse?.data ?? [];

  const { data: tenantsResponse } = useTenants(1, 100);
  const tenants = Array.isArray(tenantsResponse) ? tenantsResponse : tenantsResponse?.data ?? [];

  const filteredServices = services.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(term) ||
      (s.code?.toLowerCase() || "").includes(term) ||
      (s.group?.toLowerCase() || "").includes(term) ||
      (s.description?.toLowerCase() || "").includes(term);
    return matchesSearch;
  });

  // Category Handlers
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryCode("");
    setCategoryType("License");
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: ServiceCategory) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryCode(cat.code ?? "");
    setCategoryType(cat.type);
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setIsCategorySubmitting(true);

    if (editingCategory) {
      const [res, err] = await safeAsync(
        updateServiceCategory(editingCategory.id, {
          id: editingCategory.id,
          name: categoryName,
          code: categoryCode,
          type: categoryType,
        })
      );

      if (res?.succeeded) {
        setToast({ message: "Service category updated successfully.", type: "success" });
        mutateCategories();
        setIsCategoryModalOpen(false);
      } else {
        setToast({ message: getErrorMessage(err || res, "Failed to update service category."), type: "error" });
      }
    } else {
      const [res, err] = await safeAsync(
        createServiceCategory({
          name: categoryName,
          code: categoryCode,
          type: categoryType,
        })
      );

      if (res?.succeeded) {
        setToast({ message: "Service category created successfully.", type: "success" });
        mutateCategories();
        setIsCategoryModalOpen(false);
      } else {
        setToast({ message: getErrorMessage(err || res, "Failed to create service category."), type: "error" });
      }
    }

    setIsCategorySubmitting(false);
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!deletingCategoryId) return;
    const [res, err] = await safeAsync(deleteServiceCategory(deletingCategoryId));
    if (res?.succeeded) {
      setToast({ message: "Service category deleted successfully.", type: "success" });
      mutateCategories();
      mutateServices();
    } else {
      setToast({ message: getErrorMessage(err || res, "Cannot delete category with active services."), type: "error" });
    }
    setDeletingCategoryId(null);
  };

  // Service Handlers
  const handleOpenCreateService = () => {
    setEditingService(null);
    setServiceCategoryId(categories.length > 0 ? categories[0].id : "");
    setServiceTenantId("");
    setServiceName("");
    setServiceGroup("General");
    setServiceCode("");
    setServiceDescription("");
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (item: ServiceItem) => {
    setEditingService(item);
    setServiceCategoryId(item.serviceCategoryId);
    setServiceTenantId(item.tenantId ?? "");
    setServiceName(item.name);
    setServiceGroup(item.group ?? "General");
    setServiceCode(item.code ?? "");
    setServiceDescription(item.description ?? "");
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !serviceCategoryId) return;

    setIsServiceSubmitting(true);

    const targetTenant = serviceTenantId.trim().length > 0 ? serviceTenantId : undefined;

    if (editingService) {
      const [res, err] = await safeAsync(
        updateService(targetTenant, editingService.id, {
          id: editingService.id,
          serviceCategoryId,
          tenantId: targetTenant,
          name: serviceName,
          group: serviceGroup,
          code: serviceCode,
          description: serviceDescription,
        })
      );

      if (res?.succeeded) {
        setToast({ message: "Catalog service updated successfully.", type: "success" });
        mutateServices();
        setIsServiceModalOpen(false);
      } else {
        setToast({ message: getErrorMessage(err || res, "Failed to update catalog service."), type: "error" });
      }
    } else {
      const [res, err] = await safeAsync(
        createService(targetTenant, {
          serviceCategoryId,
          tenantId: targetTenant,
          name: serviceName,
          group: serviceGroup,
          code: serviceCode,
          description: serviceDescription,
        })
      );

      if (res?.succeeded) {
        setToast({ message: "New catalog service created successfully.", type: "success" });
        mutateServices();
        setIsServiceModalOpen(false);
      } else {
        setToast({ message: getErrorMessage(err || res, "Failed to create catalog service."), type: "error" });
      }
    }

    setIsServiceSubmitting(false);
  };

  const handleDeleteServiceConfirm = async () => {
    if (!deletingServiceId) return;
    const targetService = services.find((s) => s.id === deletingServiceId);
    const tenantId = targetService?.tenantId ?? (tenants.length > 0 ? tenants[0].id : "");

    const [res, err] = await safeAsync(deleteService(tenantId, deletingServiceId));
    if (res?.succeeded) {
      setToast({ message: "Catalog service deleted successfully.", type: "success" });
      mutateServices();
    } else {
      setToast({ message: getErrorMessage(err || res, "Failed to delete service. Check for active applications."), type: "error" });
    }
    setDeletingServiceId(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Boxes className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Services & Categories Catalog</h1>
            <p className="text-sm text-slate-400">
              Manage NTC telecommunications licensing, accreditation, examination, and permit services catalog.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateCategory}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all text-xs border border-slate-700"
          >
            <FolderPlus className="h-4 w-4 text-emerald-400" />
            <span>New Category</span>
          </button>
          <button
            onClick={handleOpenCreateService}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all text-xs shadow-lg shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            <span>New Service</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-indigo-400" /> Service Categories ({categories.length})
          </h2>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategoryId("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategoryId === "ALL"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center group">
              <button
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-l-xl text-xs font-semibold whitespace-nowrap transition-all border-y border-l ${
                  selectedCategoryId === cat.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                {cat.name} {cat.code ? `(${cat.code})` : ""}
              </button>
              <div className="flex items-center bg-slate-900 border-y border-r border-slate-800 rounded-r-xl px-1">
                <button
                  onClick={() => handleOpenEditCategory(cat)}
                  className="p-1 text-slate-400 hover:text-indigo-400"
                  title="Edit Category"
                >
                  <Edit className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setDeletingCategoryId(cat.id)}
                  className="p-1 text-slate-400 hover:text-rose-400"
                  title="Delete Category"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search services by name, code, group..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-indigo-400 font-bold">{filteredServices.length}</span> catalog services
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-sm">Loading catalog services...</div>
      ) : filteredServices.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3">
          <Boxes className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="text-white font-medium text-base">No services found</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No catalog services match the selected category or search filter. Click "New Service" to add a service entry.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((s) => (
            <div
              key={s.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all rounded-2xl p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold font-mono">
                      {s.serviceCategoryType || s.serviceCategoryCode || "Catalog Service"}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5 line-clamp-1">{s.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditService(s)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                      title="Edit Service"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingServiceId(s.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-all"
                      title="Delete Service"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {s.description || "No specific catalog description provided for this service entry."}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Code: {s.code || "N/A"}</span>
                <span>Group: {s.group || "General"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-indigo-400" />
              {editingCategory ? "Edit Service Category" : "New Service Category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCategorySubmit} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category Name</label>
              <input
                type="text"
                required
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Amateur Radio Licenses"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category Code</label>
              <input
                type="text"
                value={categoryCode}
                onChange={(e) => setCategoryCode(e.target.value)}
                placeholder="e.g. ARL"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 uppercase font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category Type</label>
              <select
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="License">License</option>
                <option value="Permit">Permit</option>
                <option value="Accreditation">Accreditation</option>
                <option value="Certificate">Certificate</option>
                <option value="Exam">Exam</option>
                <option value="RequestsAndComplaints">Requests & Complaints</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCategorySubmitting}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-500 font-medium disabled:opacity-50"
              >
                {isCategorySubmitting ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Service Modal */}
      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Boxes className="h-5 w-5 text-indigo-400" />
              {editingService ? "Edit Catalog Service" : "New Catalog Service"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleServiceSubmit} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Service Category</label>
              <select
                required
                value={serviceCategoryId}
                onChange={(e) => setServiceCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Target Tenant / Branch <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <select
                value={serviceTenantId}
                onChange={(e) => setServiceTenantId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Global / System-Wide Service (All Tenants)</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Service Name</label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Amateur Radio Station License - Class A"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Service Code</label>
                <input
                  type="text"
                  value={serviceCode}
                  onChange={(e) => setServiceCode(e.target.value)}
                  placeholder="e.g. ARL-CLA"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono uppercase"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Service Group</label>
                <input
                  type="text"
                  value={serviceGroup}
                  onChange={(e) => setServiceGroup(e.target.value)}
                  placeholder="e.g. Amateur Radio"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
              <textarea
                rows={3}
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Summary description of service scope..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isServiceSubmitting}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-500 font-medium disabled:opacity-50"
              >
                {isServiceSubmitting ? "Saving..." : editingService ? "Update Service" : "Create Service"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <ConfirmActionDialog
        isOpen={deletingCategoryId !== null}
        onClose={() => setDeletingCategoryId(null)}
        onConfirm={handleDeleteCategoryConfirm}
        title="Delete Service Category"
        description="Are you sure you want to delete this service category? Categories with existing associated services cannot be deleted."
        confirmLabel="Delete Category"
        cancelLabel="Cancel"
      />

      {/* Delete Service Confirmation */}
      <ConfirmActionDialog
        isOpen={deletingServiceId !== null}
        onClose={() => setDeletingServiceId(null)}
        onConfirm={handleDeleteServiceConfirm}
        title="Delete Catalog Service"
        description="Are you sure you want to delete this catalog service? Services with active submitted applications cannot be deleted."
        confirmLabel="Delete Service"
        cancelLabel="Cancel"
      />

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
