"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  KeyRound,
  ShieldCheck,
  Copy,
  Edit2,
  Trash2,
  Lock,
  Search,
  Check,
  X,
  Loader2,
  Sliders,
  AlertCircle,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { ActionMenu } from "@/components/ui/action-menu";
import { showToast } from "@/components/ui/toast-notification";
import { Tenant, Role } from "@edge/api";
import { useRoleService } from "@/services/roleService";
import {
  useRolePermissionService,
  PermissionDefinition,
} from "@/services/rolePermissionService";

interface RolesTabProps {
  currentTenant: Tenant;
  showToast?: (msg: string) => void;
}

export function RolesTab({ currentTenant }: RolesTabProps) {
  const { useRoles, createRole, duplicateRole, updateRole, deleteRole } = useRoleService();
  const { data: fetchedRoles, isLoading: loadingRoles, mutate: mutateRoles } = useRoles(currentTenant.id);
  const rolesList: Role[] = fetchedRoles ?? [];

  const {
    usePermissionCatalog,
    useRolePermissions,
    assignPermission,
    revokePermission,
  } = useRolePermissionService();

  const { data: permissionCatalog = [] } = usePermissionCatalog();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "STANDARD" | "CUSTOM">("ALL");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formKey, setFormKey] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [sourceRoleId, setSourceRoleId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered roles list
  const filteredRoles = useMemo(() => {
    return rolesList.filter((r) => {
      const isStandard = !r.tenantId;
      if (filterType === "STANDARD" && !isStandard) return false;
      if (filterType === "CUSTOM" && isStandard) return false;

      if (searchTerm.trim().length > 0) {
        const query = searchTerm.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(query);
        const matchesKey = r.key.toLowerCase().includes(query);
        const matchesDesc = (r.description ?? "").toLowerCase().includes(query);
        return matchesName || matchesKey || matchesDesc;
      }
      return true;
    });
  }, [rolesList, filterType, searchTerm]);

  // Open Create Dialog
  const handleOpenCreate = () => {
    setFormName("");
    setFormKey("");
    setFormDescription("");
    setSourceRoleId("");
    setIsCreateOpen(true);
  };

  // Open Duplicate Dialog
  const handleOpenDuplicate = (role: Role) => {
    setSelectedRole(role);
    setSourceRoleId(role.id);
    setFormName(`${role.name} (${currentTenant.code || "Custom"})`);
    const cleanTenantCode = (currentTenant.code || "custom").toLowerCase().replace(/[^a-z0-9]/g, "");
    setFormKey(`${cleanTenantCode}.${role.key.replace(/[^a-z0-9_.-]/gi, "").toLowerCase()}`);
    setFormDescription(role.description ? `Customized based on ${role.name}: ${role.description}` : `Custom ${role.name} role for ${currentTenant.name}`);
    setIsDuplicateOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setFormName(role.name);
    setFormKey(role.key);
    setFormDescription(role.description ?? "");
    setIsEditOpen(true);
  };

  // Open Permissions Modal
  const handleOpenPermissions = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsModalOpen(true);
  };

  // Submit Create Role
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formName.trim().length === 0 || formKey.trim().length === 0) {
      showToast.error("Name and key are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (sourceRoleId && sourceRoleId.length > 0) {
        // If user chose a template in create modal, duplicate it
        await duplicateRole({
          sourceRoleId,
          targetTenantId: currentTenant.id,
          name: formName.trim(),
          key: formKey.trim().toLowerCase(),
          description: formDescription.trim(),
        });
        showToast.success(`Role "${formName}" created with copied permissions.`);
      } else {
        await createRole({
          name: formName.trim(),
          key: formKey.trim().toLowerCase(),
          description: formDescription.trim(),
          tenantId: currentTenant.id,
          isSystemRole: false,
        });
        showToast.success(`Custom role "${formName}" created.`);
      }
      await mutateRoles();
      setIsCreateOpen(false);
    } catch (err: unknown) {
      showToast.error(err instanceof Error ? err.message : "Failed to create custom role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Duplicate Role
  const handleDuplicateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || formName.trim().length === 0 || formKey.trim().length === 0) {
      showToast.error("Name and key are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await duplicateRole({
        sourceRoleId: selectedRole.id,
        targetTenantId: currentTenant.id,
        name: formName.trim(),
        key: formKey.trim().toLowerCase(),
        description: formDescription.trim(),
      });
      showToast.success(
        `Duplicated "${selectedRole.name}" into "${formName}".`,
        "All associated permission assignments were cloned."
      );
      await mutateRoles();
      setIsDuplicateOpen(false);
    } catch (err: unknown) {
      showToast.error(err instanceof Error ? err.message : "Failed to duplicate role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Role
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || formName.trim().length === 0) {
      showToast.error("Role name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateRole(selectedRole.id, {
        id: selectedRole.id,
        name: formName.trim(),
        key: selectedRole.key,
        description: formDescription.trim(),
        tenantId: selectedRole.tenantId,
        isSystemRole: selectedRole.isSystemRole,
      });
      showToast.success(`Role "${formName}" updated.`);
      await mutateRoles();
      setIsEditOpen(false);
    } catch (err: unknown) {
      showToast.error(err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete Role
  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    try {
      await deleteRole(selectedRole.id);
      showToast.success(`Custom role "${selectedRole.name}" removed.`);
      await mutateRoles();
      setIsDeleteOpen(false);
    } catch (err: unknown) {
      showToast.error(err instanceof Error ? err.message : "Failed to delete role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 min-w-0">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Roles & Permission Policies
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Standard global roles are shared templates. Tenants can duplicate standard roles to create and manage custom access policies.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Role</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 min-w-0">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search roles by name or key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterType === "ALL"
                ? "bg-purple-600 text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            All Roles ({rolesList.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("STANDARD")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterType === "STANDARD"
                ? "bg-purple-600 text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Standard ({rolesList.filter((r) => !r.tenantId).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("CUSTOM")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterType === "CUSTOM"
                ? "bg-purple-600 text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Custom ({rolesList.filter((r) => !!r.tenantId).length})
          </button>
        </div>
      </div>

      {/* Role Grid */}
      {loadingRoles ? (
        <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
          <span>Loading tenant security roles...</span>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
          No security roles found matching the current search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
          {filteredRoles.map((role) => {
            const isStandard = !role.tenantId;

            return (
              <div
                key={role.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 min-w-0 overflow-hidden shadow-sm hover:border-purple-500/30 transition-all"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 min-w-0 truncate">
                        <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        <span className="truncate">{role.name}</span>
                      </h4>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        {role.key}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isStandard ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 shrink-0">
                          Standard
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 shrink-0">
                          Custom
                        </span>
                      )}

                      <ActionMenu
                        items={[
                          ...(isStandard
                            ? [
                                {
                                  label: "Duplicate as Custom Role",
                                  icon: Copy,
                                  onClick: () => handleOpenDuplicate(role),
                                },
                                {
                                  label: "View Permissions",
                                  icon: Eye,
                                  onClick: () => handleOpenPermissions(role),
                                },
                              ]
                            : [
                                {
                                  label: "Manage Permissions",
                                  icon: Sliders,
                                  onClick: () => handleOpenPermissions(role),
                                },
                                {
                                  label: "Duplicate Role",
                                  icon: Copy,
                                  onClick: () => handleOpenDuplicate(role),
                                },
                                {
                                  label: "Edit Role",
                                  icon: Edit2,
                                  onClick: () => handleOpenEdit(role),
                                },
                                {
                                  label: "Delete Role",
                                  icon: Trash2,
                                  onClick: () => {
                                    setSelectedRole(role);
                                    setIsDeleteOpen(true);
                                  },
                                  variant: "destructive" as const,
                                },
                              ]),
                        ]}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 break-words line-clamp-2">
                    {role.description || (isStandard ? "System-wide standard role template." : "Tenant-scoped customized operational role.")}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="truncate">
                    {isStandard ? "Read-Only Global" : "Tenant Exclusive"}
                  </span>
                  <button
                    type="button"
                    onClick={() => (isStandard ? handleOpenDuplicate(role) : handleOpenPermissions(role))}
                    className="font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    {isStandard ? (
                      <>
                        <Copy className="w-3 h-3" /> Duplicate
                      </>
                    ) : (
                      <>
                        <Sliders className="w-3 h-3" /> Permissions
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Modal 1: Create Role Dialog ─────────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-[480px] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Create Custom Tenant Role
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 dark:text-slate-400">
              Create a new custom operational security role for {currentTenant.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Clone From Existing Template (Optional)</label>
              <select
                value={sourceRoleId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSourceRoleId(val);
                  const found = rolesList.find((r) => r.id === val);
                  if (found) {
                    setFormName(`${found.name} (Custom)`);
                    const cleanCode = (currentTenant.code || "custom").toLowerCase().replace(/[^a-z0-9]/g, "");
                    setFormKey(`${cleanCode}.${found.key.replace(/[^a-z0-9_.-]/gi, "").toLowerCase()}`);
                    setFormDescription(found.description ?? "");
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="">-- Start from Scratch --</option>
                {rolesList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.tenantId ? "Tenant Custom" : "Standard"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Role Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Evaluator"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Role Key *</label>
              <input
                type="text"
                required
                placeholder="e.g. ncr.senior_evaluator"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={3}
                placeholder="Role responsibilities and access scope..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-500 text-white">
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                Create Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Modal 2: Duplicate Role Dialog ─────────────────────────────── */}
      <Dialog open={isDuplicateOpen} onOpenChange={setIsDuplicateOpen}>
        <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-[480px] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Copy className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Duplicate Role
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 dark:text-slate-400">
              Clone &quot;{selectedRole?.name}&quot; along with its permission configuration for {currentTenant.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDuplicateSubmit} className="space-y-4 pt-2">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-700 dark:text-purple-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Tenant Isolation:</strong> This duplicated role will be created exclusively for <strong>{currentTenant.name}</strong> and cannot be seen or accessed by other tenants.
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Role Name *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Role Key *</label>
              <input
                type="text"
                required
                value={formKey}
                onChange={(e) => setFormKey(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDuplicateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-500 text-white">
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                Duplicate & Save Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Modal 3: Edit Role Dialog ───────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-[480px] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Edit Custom Role
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 dark:text-slate-400">
              Update role definition and metadata.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Role Name *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Role Key</label>
              <input
                type="text"
                disabled
                value={formKey}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-500 text-white">
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Modal 4: Manage / View Permissions Modal ─────────────────────── */}
      {selectedRole && (
        <RolePermissionsModal
          open={isPermissionsModalOpen}
          onClose={() => setIsPermissionsModalOpen(false)}
          role={selectedRole}
          isReadOnly={!selectedRole.tenantId}
          permissionCatalog={permissionCatalog}
          useRolePermissions={useRolePermissions}
          assignPermission={assignPermission}
          revokePermission={revokePermission}
        />
      )}

      {/* ─── Modal 5: Delete Role Confirmation ───────────────────────────── */}
      <ConfirmActionDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Custom Role"
        description={`Are you sure you want to delete the custom role "${selectedRole?.name}"? Staff members assigned to this role will lose their granted permissions.`}
        confirmLabel="Delete Role"
        cancelLabel="Cancel"
        loading={isSubmitting}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Permissions Matrix Modal Component
// ─────────────────────────────────────────────────────────────────────────────

interface RolePermissionsModalProps {
  open: boolean;
  onClose: () => void;
  role: Role;
  isReadOnly: boolean;
  permissionCatalog: PermissionDefinition[];
  useRolePermissions: (roleId: string | null) => {
    data?: { succeeded: boolean; data: string[] };
    isLoading: boolean;
    mutate: () => Promise<unknown>;
  };
  assignPermission: (roleId: string, permissionKey: string) => Promise<void>;
  revokePermission: (roleId: string, permissionKey: string) => Promise<void>;
}

function RolePermissionsModal({
  open,
  onClose,
  role,
  isReadOnly,
  permissionCatalog,
  useRolePermissions,
  assignPermission,
  revokePermission,
}: RolePermissionsModalProps) {
  const { data: rolePermsResponse, isLoading, mutate } = useRolePermissions(open ? role.id : null);
  const assignedKeys = useMemo(() => new Set(rolePermsResponse?.data ?? []), [rolePermsResponse]);

  const [localAssigned, setLocalAssigned] = useState<Set<string>>(new Set());
  const [permSearch, setPermSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (rolePermsResponse?.data) {
      setLocalAssigned(new Set(rolePermsResponse.data));
    }
  }, [rolePermsResponse]);

  // Group permission catalog by category
  const categories = useMemo(() => {
    const map = new Map<string, PermissionDefinition[]>();
    for (const p of permissionCatalog) {
      if (permSearch.trim().length > 0) {
        const q = permSearch.toLowerCase();
        if (!p.label.toLowerCase().includes(q) && !p.key.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) {
          continue;
        }
      }
      const cat = p.category || "General";
      if (!map.has(cat)) map.set(cat, []);
      const list = map.get(cat);
      if (list) {
        list.push(p);
      }
    }
    return map;
  }, [permissionCatalog, permSearch]);

  const handleToggle = (key: string) => {
    if (isReadOnly) return;
    setLocalAssigned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    setIsSaving(true);
    try {
      const toAdd = Array.from(localAssigned).filter((k) => !assignedKeys.has(k));
      const toRemove = Array.from(assignedKeys).filter((k) => !localAssigned.has(k));

      for (const k of toAdd) {
        await assignPermission(role.id, k);
      }
      for (const k of toRemove) {
        await revokePermission(role.id, k);
      }

      showToast.success(`Permissions saved for role "${role.name}".`);
      await mutate();
      onClose();
    } catch (err: unknown) {
      showToast.error(err instanceof Error ? err.message : "Failed to update permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-[640px] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              {isReadOnly ? "View Standard Role Permissions" : "Manage Custom Role Permissions"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-600 dark:text-slate-400">
            {isReadOnly
              ? `Standard template "${role.name}" permissions (Read-only). Duplicate this role to customize.`
              : `Configure allowed permission capabilities for custom role "${role.name}".`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={permSearch}
              onChange={(e) => setPermSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>Loading permission matrix...</span>
            </div>
          ) : (
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {Array.from(categories.entries()).map(([cat, perms]) => (
                <div key={cat} className="space-y-1.5">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                    {cat} ({perms.length})
                  </h5>
                  <div className="space-y-1">
                    {perms.map((p) => {
                      const isChecked = localAssigned.has(p.key);
                      return (
                        <label
                          key={p.key}
                          className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all ${
                            isReadOnly ? "cursor-default" : "cursor-pointer"
                          } ${
                            isChecked
                              ? "bg-purple-500/10 border-purple-500/30 dark:bg-purple-950/20"
                              : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={isReadOnly}
                            checked={isChecked}
                            onChange={() => handleToggle(p.key)}
                            className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="min-w-0 text-xs space-y-0.5">
                            <span className="font-semibold text-slate-900 dark:text-white block">{p.label}</span>
                            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 block">{p.key}</span>
                            {p.description && <span className="text-[11px] text-slate-600 dark:text-slate-400 block">{p.description}</span>}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {isReadOnly ? "Close" : "Cancel"}
          </Button>
          {!isReadOnly && (
            <Button
              type="button"
              size="sm"
              disabled={isSaving}
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
              Save Permissions
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
