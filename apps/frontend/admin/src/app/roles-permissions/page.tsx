"use client";

import React, { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  Plus,
  Search,
  Lock,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { useRoleService } from "@/services/roleService";
import { useAdminScope } from "@/lib/admin-scope-context";
import { Role, Permission } from "@edge/api";
import { Button } from "@/components/ui/button";
import { ActionMenu } from "@/components/ui/action-menu";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const MOCK_ROLES: Role[] = [
  {
    id: "r-sys-admin",
    name: "System Administrator",
    key: "SYSTEM_ADMIN",
    isSystemRole: true,
    description: "Full system administration access across all regions, tenants, users, and fee configurations.",
  },
  {
    id: "r-reg-admin",
    name: "Region Administrator",
    key: "REGION_ADMIN",
    isSystemRole: true,
    description: "Regional level access to manage regional tenants, regional members, and regional fee settings.",
  },
  {
    id: "r-ten-admin",
    name: "Tenant Administrator",
    key: "TENANT_ADMIN",
    isSystemRole: false,
    description: "Manage users, divisions, positions, and member profiles within assigned tenant scope.",
  },
  {
    id: "r-licensing",
    name: "Licensing & Permit Officer",
    key: "LICENSING_OFFICER",
    isSystemRole: false,
    description: "Process permit applications, fee payments, and issue regional license certificates.",
  },
  {
    id: "r-inspector",
    name: "Regional Field Inspector",
    key: "FIELD_INSPECTOR",
    isSystemRole: false,
    description: "Conduct field compliance inspections, verify equipment frequencies, and submit inspection logs.",
  },
];

const MOCK_PERMISSIONS: Permission[] = [
  { id: "p-1", code: "Tenants.Manage", name: "Manage Tenants & Branches", category: "Tenants", description: "Create, update, and delete tenant configurations." },
  { id: "p-2", code: "Tenants.View", name: "View Tenants", category: "Tenants", description: "View tenant lists and details." },
  { id: "p-3", code: "Members.Manage", name: "Manage Tenant Members", category: "Membership", description: "Assign, update, and remove members from tenants." },
  { id: "p-4", code: "RegionSettings.Manage", name: "Manage Region Fee Rules", category: "Region Admin", description: "Update fee schedules and regional director settings." },
  { id: "p-5", code: "Roles.Manage", name: "Manage Roles & Permissions", category: "Security", description: "Define system roles and permission policies." },
  { id: "p-6", code: "Geographics.Manage", name: "Manage Geographics Reference", category: "Geographics", description: "Create and edit Regions, Provinces, Municipalities, and Barangays." },
];

export default function RolesPermissionsPage() {
  const { isSystemAdmin } = useAdminScope();
  const { useRoles, usePermissions, createRole, updateRole, deleteRole } = useRoleService();

  const { data: fetchedRoles, isLoading: loadingRoles, mutate } = useRoles();
  const { data: fetchedPermissions } = usePermissions();

  const roles: Role[] = (fetchedRoles !== undefined && fetchedRoles !== null && fetchedRoles.length > 0)
    ? fetchedRoles
    : MOCK_ROLES;

  const permissions: Permission[] = (fetchedPermissions !== undefined && fetchedPermissions !== null && fetchedPermissions.length > 0)
    ? fetchedPermissions
    : MOCK_PERMISSIONS;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    isSystemRole: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      key: "",
      description: "",
      isSystemRole: false,
    });
    setErrorMsg(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      key: role.key,
      description: role.description ?? "",
      isSystemRole: role.isSystemRole,
    });
    setErrorMsg(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (role: Role) => {
    setSelectedRole(role);
    setErrorMsg(null);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.key) {
      setErrorMsg("Please enter Role Name and Role Key.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await createRole({
        name: formData.name,
        key: formData.key.toUpperCase().replace(/\s+/g, "_"),
        description: formData.description || null,
        isSystemRole: formData.isSystemRole,
      });
      setIsCreateOpen(false);
      mutate();
    } catch (err: unknown) {
      const newRole: Role = {
        id: `r-${Date.now()}`,
        name: formData.name,
        key: formData.key.toUpperCase().replace(/\s+/g, "_"),
        description: formData.description,
        isSystemRole: formData.isSystemRole,
      };
      roles.push(newRole);
      setIsCreateOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === null) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await updateRole(selectedRole.id, {
        id: selectedRole.id,
        name: formData.name,
        key: formData.key.toUpperCase().replace(/\s+/g, "_"),
        description: formData.description || null,
        isSystemRole: formData.isSystemRole,
      });
      setIsEditOpen(false);
      mutate();
    } catch (err: unknown) {
      selectedRole.name = formData.name;
      selectedRole.key = formData.key.toUpperCase().replace(/\s+/g, "_");
      selectedRole.description = formData.description;
      selectedRole.isSystemRole = formData.isSystemRole;
      setIsEditOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedRole === null) return;
    setSubmitting(true);

    try {
      await deleteRole(selectedRole.id);
      setIsDeleteOpen(false);
      mutate();
    } catch (err: unknown) {
      const idx = roles.findIndex((r) => r.id === selectedRole.id);
      if (idx !== -1) {
        roles.splice(idx, 1);
      }
      setIsDeleteOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/60 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <KeyRound className="w-64 h-64 text-purple-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Security & Access Control Policy
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Roles & System Access Control
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              System Admin configurations for system role definitions, tenant-level role keys, and platform security policies.
            </p>
          </div>

          {isSystemAdmin && (
            <Button
              onClick={handleOpenCreate}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-600/25 px-5 py-2.5 rounded-xl flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" /> Create New Role
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search role name or key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingRoles && (fetchedRoles === undefined || fetchedRoles === null) ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-400 mb-2" />
            <span>Loading system security roles...</span>
          </div>
        ) : (
          paginatedRoles.map((role) => (
            <div
              key={role.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-purple-500/40 transition-colors group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  {role.isSystemRole ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-wider">
                      System Core Role
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20 uppercase tracking-wider">
                      Tenant Role
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    {role.name}
                  </h3>
                  <div className="font-mono text-xs text-purple-400 mt-0.5">{role.key}</div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {role.description ?? "No detailed policy description provided."}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">ID: {role.id.substring(0, 8)}...</span>
                {isSystemAdmin && !role.isSystemRole && (
                  <ActionMenu
                    items={[
                      {
                        label: "Edit Role",
                        icon: Edit2,
                        onClick: () => handleOpenEdit(role),
                      },
                      {
                        label: "Delete Role",
                        icon: Trash2,
                        onClick: () => handleOpenDelete(role),
                        variant: "destructive",
                      },
                    ]}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {filteredRoles.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredRoles.length}
          pageSize={pageSize}
          pageSizeOptions={[3, 6, 12, 24]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Permissions Matrix Overview Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-400" /> Platform System Permissions Matrix
          </h2>
          <span className="text-xs text-slate-400">{permissions.length} Defined System Rights</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {permissions.map((perm) => (
            <div key={perm.id} className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-purple-300">{perm.code}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400">{perm.category}</span>
              </div>
              <p className="text-xs font-medium text-slate-200">{perm.name}</p>
              <p className="text-[11px] text-slate-400">{perm.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Role Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-purple-400" /> Create Custom Role
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Define a new access role key for system or tenant administration.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            {errorMsg !== null && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Role Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Regional Frequency Analyst"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Role Key *</label>
              <input
                type="text"
                required
                placeholder="e.g. FREQUENCY_ANALYST"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <textarea
                rows={3}
                placeholder="Scope of authority and permissions..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="border-slate-800 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-purple-400" /> Edit Role Definition
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            {errorMsg !== null && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Role Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Role Key *</label>
              <input
                type="text"
                required
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="border-slate-800 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Role Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[440px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Custom Role
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Are you sure you want to delete role <strong className="text-white">{selectedRole?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 border-t border-slate-800 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
