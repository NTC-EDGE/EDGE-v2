"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Building,
  Plus,
  Search,
  MapPin,
  Users,
  Eye,
  Edit2,
  Trash2,
  Filter,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Power,
  PowerOff
} from "lucide-react";
import { useTenantService } from "@/services/tenantService";
import { useRegionService } from "@/services/regionService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { Tenant, Region } from "@edge/api";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ToastNotification, ToastMessage, getErrorMessage } from "@/components/ui/toast-notification";
import { isForbiddenError, PageForbiddenState } from "@/components/PageForbiddenState";

export default function TenantsPage() {
  const router = useRouter();
  const { isSystemAdmin, canManageTenants } = useAdminScope();
  const { useTenants, createTenant, updateTenant, deleteTenant, toggleTenantActive } = useTenantService();
  const { useRegions } = useRegionService();

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Search, Filter, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: fetchedTenants, isLoading: loadingTenants, mutate, error } = useTenants(currentPage, pageSize, searchTerm);
  const { data: regionsResponse } = useRegions();

  const regions: Region[] = regionsResponse?.data ?? [];

  const tenants: Tenant[] = Array.isArray(fetchedTenants)
    ? fetchedTenants
    : fetchedTenants?.data ?? [];

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isToggleConfirmOpen, setIsToggleConfirmOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [toggleTargetTenant, setToggleTargetTenant] = useState<Tenant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    regionId: "",
    isActive: true,
  });

  // Filtered tenants
  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion =
      selectedRegionFilter === "ALL" || tenant.regionId === selectedRegionFilter;
    return matchesSearch && matchesRegion;
  });

  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getRegionName = (regionId: string): string => {
    const found = regions.find((r) => r.id === regionId);
    return found !== undefined && found !== null ? `${found.name} (${found.code})` : "Unassigned Region";
  };

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      regionId: regions.length > 0 ? regions[0].id : "",
      isActive: true,
    });
    setErrorMsg(null);
    setIsCreateOpen(true);
  };

  const handleOpenViewDetails = (tenant: Tenant) => {
    router.push(`/tenants/${tenant.id}`);
  };

  const handleOpenEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      name: tenant.name,
      code: tenant.code,
      description: tenant.description ?? "",
      regionId: tenant.regionId,
      isActive: tenant.isActive,
    });
    setErrorMsg(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setErrorMsg(null);
    setIsDeleteOpen(true);
  };

  const handleToggleActive = (tenant: Tenant) => {
    setToggleTargetTenant(tenant);
    setIsToggleConfirmOpen(true);
  };

  const handleConfirmToggleActive = async () => {
    if (toggleTargetTenant === null) return;
    setTogglingActive(true);
    try {
      const updated = await toggleTenantActive(toggleTargetTenant.id);
      await mutate();
      setToast({ message: `Tenant "${toggleTargetTenant.name}" successfully ${updated.isActive ? "activated" : "deactivated"}.`, type: "success" });
      setIsToggleConfirmOpen(false);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to toggle tenant active status.");
      setToast({ message: msg, type: "error" });
    } finally {
      setTogglingActive(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await createTenant({
        name: formData.name,
        code: formData.code,
        description: formData.description,
        regionId: formData.regionId,
      });
      await mutate();
      setToast({ message: `Tenant "${formData.name}" created successfully.`, type: "success" });
      setIsCreateOpen(false);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to create tenant. Please try again.");
      setErrorMsg(msg);
      setToast({ message: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTenant === null) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await updateTenant(selectedTenant.id, {
        id: selectedTenant.id,
        name: formData.name,
        code: formData.code,
        description: formData.description,
        regionId: formData.regionId,
        isActive: formData.isActive,
      });
      await mutate();
      setToast({ message: `Tenant "${formData.name}" details updated successfully.`, type: "success" });
      setIsEditOpen(false);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to update tenant. Please try again.");
      setErrorMsg(msg);
      setToast({ message: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedTenant === null) return;
    setSubmitting(true);

    try {
      await deleteTenant(selectedTenant.id);
      await mutate();
      setToast({ message: `Tenant "${selectedTenant.name}" deleted successfully.`, type: "success" });
      setIsDeleteOpen(false);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to delete tenant.");
      setErrorMsg(msg);
      setToast({ message: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/60 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Building2 className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> System & Regional Branches
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Tenants & Regional Offices Directory
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Register organizational tenant branches, map regional ownership, and manage staff & client access controls.
            </p>
          </div>

          {canManageTenants && (
            <Button
              onClick={handleOpenCreate}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Tenant</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search tenant name or code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedRegionFilter}
              onChange={(e) => {
                setSelectedRegionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Regions ({tenants.length})</option>
              {regions.map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.name} ({reg.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      {!!error && isForbiddenError(error) && <PageForbiddenState />}
      {!!error && !isForbiddenError(error) && (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <p className="text-red-500 font-medium text-base">Failed to load tenants</p>
          <button onClick={() => mutate()} className="mt-4 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 font-medium">Retry</button>
        </div>
      )}
      {!error && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold tracking-wider">
                <th className="px-6 py-4">Tenant Name & Code</th>
                <th className="px-6 py-4">Region Assigned</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {loadingTenants ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                      <span>Loading tenant configurations...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-300">No tenants found</p>
                    <p className="text-xs text-slate-500">Try adjusting your search query or region filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedTenants.map((tenant) => {
                  const hasEntriesOrMembers = (tenant.tenantMembersTotal ?? 0) > 0 || (tenant.fieldOfficesCount ?? 0) > 0;

                  const menuItems: ActionMenuItem[] = [
                    {
                      label: "View Details Page",
                      icon: Eye,
                      onClick: () => handleOpenViewDetails(tenant),
                    },
                    ...(canManageTenants
                      ? [
                          {
                            label: "Edit Tenant",
                            icon: Edit2,
                            onClick: () => handleOpenEdit(tenant),
                          },
                          {
                            label: tenant.isActive ? "Deactivate Tenant" : "Activate Tenant",
                            icon: tenant.isActive ? PowerOff : Power,
                            onClick: () => handleToggleActive(tenant),
                          },
                          ...(!hasEntriesOrMembers
                            ? [
                                {
                                  label: "Delete Tenant",
                                  icon: Trash2,
                                  onClick: () => handleOpenDelete(tenant),
                                  variant: "destructive" as const,
                                },
                              ]
                            : []),
                        ]
                      : []),
                  ];

                  return (
                    <tr key={tenant.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <Link
                              href={`/tenants/${tenant.id}`}
                              className="font-bold text-white hover:text-indigo-400 transition-colors text-sm"
                            >
                              {tenant.name}
                            </Link>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{tenant.code}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-emerald-400">
                          <MapPin className="w-3.5 h-3.5" />
                          {getRegionName(tenant.regionId)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {tenant.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                            Disabled
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : "2026-01-15"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <ActionMenu items={menuItems} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredTenants.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredTenants.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
      )}

      {/* Create Tenant Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" /> Register New Tenant Branch
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Add a new regional administrative tenant to the platform ecosystem.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            {errorMsg !== null && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tenant Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. NTC Bicol Regional Office"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Tenant Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NTC-R5-01"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Assigned Region *</label>
                <select
                  required
                  value={formData.regionId}
                  onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {regions.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.name} ({reg.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <textarea
                rows={3}
                placeholder="Operational purpose or regional scope details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="border-slate-800 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Create Tenant</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Tenant Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-400" /> Edit Tenant Details
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Update tenant registration details and operational status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tenant Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Tenant Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Assigned Region *</label>
                <select
                  required
                  value={formData.regionId}
                  onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {regions.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.name} ({reg.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
              />
              <label htmlFor="isActive" className="text-xs font-semibold text-slate-200 cursor-pointer">
                Operational Active (Enable tenant access for members & clients)
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="border-slate-800 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Changes</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Tenant Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[440px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2 text-rose-400">
              <Trash2 className="w-5 h-5" /> Delete Tenant Confirmation
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Are you sure you want to delete <span className="text-white font-bold">{selectedTenant?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-slate-800 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={handleDeleteConfirm}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Delete Tenant</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Toggle Status Modal */}
      <ConfirmActionDialog
        isOpen={isToggleConfirmOpen}
        onClose={() => setIsToggleConfirmOpen(false)}
        onConfirm={handleConfirmToggleActive}
        title={toggleTargetTenant?.isActive ? "Deactivate Tenant Confirmation" : "Activate Tenant Confirmation"}
        description={
          toggleTargetTenant?.isActive
            ? `Are you sure you want to deactivate "${toggleTargetTenant.name}"? Deactivating this tenant branch will restrict operational access for associated staff members and regional clients.`
            : `Are you sure you want to activate "${toggleTargetTenant?.name}"? This will restore operational access for associated members and clients.`
        }
        confirmLabel={toggleTargetTenant?.isActive ? "Deactivate Tenant" : "Activate Tenant"}
        cancelLabel="Cancel"
        loading={togglingActive}
      />

      {/* Toast Alert */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
