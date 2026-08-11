"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  KeyRound,
  Plus,
  Search,
  ShieldCheck,
  Loader2,
  Save,
  RotateCcw,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Lock,
  AlertCircle,
} from "lucide-react";
import { useRoleService } from "@/services/roleService";
import {
  useRolePermissionService,
  PermissionDefinition,
} from "@/services/rolePermissionService";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { isForbiddenError, PageForbiddenState } from "@/components/PageForbiddenState";
import { Role, CreateRoleCommand, UpdateRoleCommand } from "@edge/api";

// ─────────────────────────────────────────────────────────────────────────────
// Role Form Dialog (create & edit)
// ─────────────────────────────────────────────────────────────────────────────

interface RoleFormData {
  name: string;
  key: string;
  description: string;
  isSystemRole: boolean;
}

interface RoleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => Promise<void>;
  initialData?: RoleFormData | null;
  title: string;
}

function RoleFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
}: RoleFormDialogProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [key, setKey] = useState(initialData?.key ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [isSystemRole, setIsSystemRole] = useState(initialData?.isSystemRole ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [keyManuallyEdited, setKeyManuallyEdited] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setKey(initialData?.key ?? "");
      setDescription(initialData?.description ?? "");
      setIsSystemRole(initialData?.isSystemRole ?? false);
      setFormError(null);
      setKeyManuallyEdited(false);
    }
  }, [open, initialData]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!keyManuallyEdited) {
      const generated = value
        .toLowerCase()
        .replace(/[^a-z0-9\s_.]/g, "")
        .replace(/\s+/g, ".");
      setKey(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length === 0 || key.trim().length === 0) {
      setFormError("Name and key are required.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await onSubmit({
        name: name.trim(),
        key: key.trim(),
        description: description.trim(),
        isSystemRole,
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Role Name <span className="text-rose-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Regional Manager"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Key */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Role Key <span className="text-rose-500">*</span>
            </label>
            <input
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setKeyManuallyEdited(true);
              }}
              placeholder="e.g. regional.manager"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 font-mono transition-colors"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Unique identifier — lowercase letters, numbers, dots, underscores only.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of this role's purpose..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 resize-none transition-colors"
            />
          </div>

          {/* System Role toggle */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setIsSystemRole(!isSystemRole)}
              className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${isSystemRole ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isSystemRole ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                System Role
              </p>
              <p className="text-[10px] text-slate-500">
                System roles apply globally across all tenants.
              </p>
            </div>
          </div>

          {/* Error */}
          {formError !== null && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{formError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Role"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

type RoleFilter = "all" | "system" | "tenant";
type ToastType = "success" | "error";

interface ToastState {
  msg: string;
  type: ToastType;
}

export default function RolesPermissionsPage() {
  const { useRoles, createRole, updateRole, deleteRole } = useRoleService();
  const {
    usePermissionCatalog,
    useRolePermissions,
    assignPermission,
    revokePermission,
    resetRolePermissions,
  } = useRolePermissionService();

  // Data fetching
  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
    mutate: mutateRoles,
  } = useRoles(null, true); // includeSystemRoles = true for system admin
  const roles: Role[] = Array.isArray(rolesData) ? rolesData : [];

  const { data: permsData, isLoading: permsLoading } = usePermissionCatalog();
  const allPermissions: PermissionDefinition[] = Array.isArray(permsData) ? permsData : [];

  // Selection state
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Permission pending-changes state
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [originalKeys, setOriginalKeys] = useState<Set<string>>(new Set());
  const [isSavingPerms, setIsSavingPerms] = useState(false);

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((msg: string, type: ToastType = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // Role permissions for selected role
  const {
    data: rolePermsData,
    isLoading: rolePermsLoading,
    mutate: mutateRolePerms,
  } = useRolePermissions(selectedRoleId);

  // Sync permission state when a role is selected or its data loads
  useEffect(() => {
    const keys = rolePermsData?.data ?? [];
    const keySet = new Set(keys);
    setOriginalKeys(keySet);
    setPendingKeys(new Set(keySet));
    // Auto-expand all categories
    const cats = new Set(allPermissions.map((p) => p.category));
    setExpandedCategories(cats);
  }, [rolePermsData, allPermissions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived state ──────────────────────────────────────────────────────────

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.key.toLowerCase().includes(searchTerm.toLowerCase());
      if (roleFilter === "system") return matchesSearch && role.isSystemRole;
      if (roleFilter === "tenant") return matchesSearch && !role.isSystemRole;
      return matchesSearch;
    });
  }, [roles, searchTerm, roleFilter]);

  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, PermissionDefinition[]>();
    allPermissions.forEach((p) => {
      const existing = groups.get(p.category);
      if (existing !== undefined) {
        existing.push(p);
      } else {
        groups.set(p.category, [p]);
      }
    });
    return groups;
  }, [allPermissions]);

  const pendingChangesCount = useMemo(() => {
    let count = 0;
    pendingKeys.forEach((k) => { if (!originalKeys.has(k)) count++; });
    originalKeys.forEach((k) => { if (!pendingKeys.has(k)) count++; });
    return count;
  }, [pendingKeys, originalKeys]);

  // ── Permission toggling ────────────────────────────────────────────────────

  const togglePermission = (key: string) => {
    setPendingKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleCategory = (perms: PermissionDefinition[]) => {
    const categoryKeys = perms.map((p) => p.key);
    const allChecked = categoryKeys.every((k) => pendingKeys.has(k));
    setPendingKeys((prev) => {
      const next = new Set(prev);
      if (allChecked) {
        categoryKeys.forEach((k) => next.delete(k));
      } else {
        categoryKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  };

  const toggleExpandCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSavePermissions = async () => {
    if (selectedRoleId === null) return;
    const addedKeys: string[] = [];
    const removedKeys: string[] = [];
    pendingKeys.forEach((k) => { if (!originalKeys.has(k)) addedKeys.push(k); });
    originalKeys.forEach((k) => { if (!pendingKeys.has(k)) removedKeys.push(k); });

    setIsSavingPerms(true);
    try {
      await Promise.all([
        ...addedKeys.map((k) => assignPermission(selectedRoleId, k).catch(() => null)),
        ...removedKeys.map((k) => revokePermission(selectedRoleId, k).catch(() => null)),
      ]);
      await mutateRolePerms();
      showToast(`Permissions saved for "${selectedRole?.name}".`);
    } catch {
      showToast("Failed to save permission changes.", "error");
    } finally {
      setIsSavingPerms(false);
    }
  };

  const handleDiscardChanges = () => {
    setPendingKeys(new Set(originalKeys));
  };

  const handleCreateRole = async (data: RoleFormData) => {
    const command: CreateRoleCommand = {
      name: data.name,
      key: data.key,
      description: data.description.length > 0 ? data.description : null,
      isSystemRole: data.isSystemRole,
    };
    await createRole(command);
    await mutateRoles();
    setIsCreateOpen(false);
    showToast(`Role "${data.name}" created successfully.`);
  };

  const handleUpdateRole = async (data: RoleFormData) => {
    if (editingRole === null) return;
    const command: UpdateRoleCommand = {
      id: editingRole.id,
      name: data.name,
      key: data.key,
      description: data.description.length > 0 ? data.description : null,
      isSystemRole: data.isSystemRole,
    };
    await updateRole(editingRole.id, command);
    await mutateRoles();
    setIsEditOpen(false);
    setEditingRole(null);
    showToast(`Role "${data.name}" updated.`);
  };

  const handleDeleteRole = async () => {
    if (deletingRole === null) return;
    setIsDeleting(true);
    try {
      await deleteRole(deletingRole.id);
      await mutateRoles();
      if (selectedRoleId === deletingRole.id) setSelectedRoleId(null);
      showToast(`Role "${deletingRole.name}" deleted.`);
    } catch {
      showToast("Failed to delete role.", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeletingRole(null);
    }
  };

  const handleResetPermissions = async () => {
    setIsResetting(true);
    try {
      await resetRolePermissions();
      if (selectedRoleId !== null) await mutateRolePerms();
      showToast("Role permissions have been reset to system defaults.");
    } catch {
      showToast("Failed to reset role permissions.", "error");
    } finally {
      setIsResetting(false);
      setIsResetConfirmOpen(false);
    }
  };

  // ── 403 guard ──────────────────────────────────────────────────────────────

  if (rolesError !== undefined && rolesError !== null && isForbiddenError(rolesError)) {
    return <PageForbiddenState />;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast !== null && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between shadow-xl ${
            toast.type === "error"
              ? "bg-red-500/10 border-red-500/30 text-red-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <Check className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.msg}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs opacity-50 hover:opacity-100 transition-opacity"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page header */}
      <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900/90 dark:to-purple-950/60 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-0 right-0 p-8 opacity-[0.04] pointer-events-none select-none">
          <KeyRound className="w-64 h-64 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <KeyRound className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Roles &amp; Permissions
              </h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Define access roles and assign granular permissions to control what
              each role can do throughout the system.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <Button
              onClick={() => setIsResetConfirmOpen(true)}
              variant="outline"
              className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </Button>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </Button>
          </div>
        </div>
      </div>

      {/* Generic error (non-403) */}
      {rolesError !== null && rolesError !== undefined && !isForbiddenError(rolesError) && (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-rose-500">Failed to load roles.</p>
          <Button onClick={() => mutateRoles()} className="mt-4" size="sm" variant="outline">
            Retry
          </Button>
        </div>
      )}

      {/* Two-column layout */}
      {(rolesError === null || rolesError === undefined) && (
        <div className="flex gap-5 items-start">
          {/* ─── Left: Roles panel ─────────────────────────────────────── */}
          <div className="w-72 xl:w-80 shrink-0 flex flex-col gap-3">
            {/* Search + filter */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-2.5 shadow-sm">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {(["all", "system", "tenant"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setRoleFilter(f)}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-colors ${
                      roleFilter === f
                        ? "bg-purple-600 text-white shadow"
                        : "text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Roles list */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm">
              {rolesLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600 dark:text-purple-400" />
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500 px-4 text-center">
                  <KeyRound className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs">No roles found.</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
                  {filteredRoles.map((role, idx) => (
                    <div
                      key={role.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedRoleId(role.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedRoleId(role.id);
                        }
                      }}
                      className={`w-full text-left px-4 py-3.5 transition-all group relative cursor-pointer select-none ${
                        idx < filteredRoles.length - 1 ? "border-b border-slate-200 dark:border-slate-800/60" : ""
                      } ${
                        selectedRoleId === role.id
                          ? "bg-purple-500/10 border-l-[3px] border-l-purple-500 pl-[13px]"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-[3px] border-l-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                              {role.name}
                            </span>
                            {role.isSystemRole && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase shrink-0">
                                <Lock className="w-2.5 h-2.5" />
                                System
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-slate-600 dark:text-slate-500 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 px-1.5 py-0.5 rounded inline-block max-w-full truncate">
                            {role.key}
                          </span>
                          {role.description !== null &&
                            role.description !== undefined &&
                            role.description.length > 0 && (
                              <p className="text-[10px] text-slate-600 mt-1.5 line-clamp-1">
                                {role.description}
                              </p>
                            )}
                        </div>
                        {/* Hover actions */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingRole(role);
                              setIsEditOpen(true);
                            }}
                            title="Edit role"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {!role.isSystemRole && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingRole(role);
                                setIsDeleteOpen(true);
                              }}
                              title="Delete role"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-600 text-center">
              {filteredRoles.length} role{filteredRoles.length !== 1 ? "s" : ""}
              {roles.length !== filteredRoles.length && ` of ${roles.length}`}
            </p>
          </div>

          {/* ─── Right: Permissions panel ───────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {selectedRole === null ? (
              /* Empty state */
              <div className="h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-8 shadow-sm">
                <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 mb-4">
                  <ShieldCheck className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-400">
                  Select a role to manage permissions
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-600 mt-1.5 max-w-xs leading-relaxed">
                  Click any role in the left panel to view and modify its
                  permission assignments.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Role info + action bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {selectedRole.name}
                      </h2>
                      {selectedRole.isSystemRole && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider shrink-0">
                          <Lock className="w-3 h-3" />
                          System Role
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded">
                        {selectedRole.key}
                      </span>
                      {pendingChangesCount > 0 && (
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full animate-pulse">
                          {pendingChangesCount} unsaved change
                          {pendingChangesCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {pendingChangesCount > 0 && (
                      <Button
                        onClick={handleDiscardChanges}
                        variant="outline"
                        className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs px-3 py-2 rounded-xl flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Discard
                      </Button>
                    )}
                    <Button
                      onClick={handleSavePermissions}
                      disabled={isSavingPerms || pendingChangesCount === 0}
                      className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold transition-all"
                    >
                      {isSavingPerms ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Save Permissions
                    </Button>
                  </div>
                </div>

                {/* Permissions catalog */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  {rolePermsLoading || permsLoading ? (
                    <div className="flex items-center justify-center h-48">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600 dark:text-purple-400" />
                    </div>
                  ) : allPermissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                      <p className="text-xs">No permissions available.</p>
                    </div>
                  ) : (
                    <div className="overflow-y-auto max-h-[calc(100vh-420px)]">
                      {Array.from(groupedPermissions.entries()).map(
                        ([category, perms]) => {
                          const isExpanded = expandedCategories.has(category);
                          const categoryKeys = perms.map((p) => p.key);
                          const checkedCount = categoryKeys.filter((k) =>
                            pendingKeys.has(k)
                          ).length;
                          const allChecked =
                            categoryKeys.length > 0 &&
                            checkedCount === categoryKeys.length;
                          const someChecked = checkedCount > 0 && !allChecked;

                          return (
                            <div
                              key={category}
                              className="border-b border-slate-200 dark:border-slate-800 last:border-0"
                            >
                              {/* Category header row */}
                              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                <button
                                  onClick={() => toggleExpandCategory(category)}
                                  className="flex items-center gap-2.5 flex-1 text-left"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                  )}
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                                    {category}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500 ml-1">
                                    {checkedCount}/{categoryKeys.length}
                                  </span>
                                </button>

                                {/* Category bulk-toggle switch */}
                                <button
                                  onClick={() => toggleCategory(perms)}
                                  title={
                                    allChecked
                                      ? "Deselect all"
                                      : "Select all"
                                  }
                                  className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                                    allChecked
                                      ? "bg-purple-600"
                                      : someChecked
                                      ? "bg-purple-600/40"
                                      : "bg-slate-300 dark:bg-slate-700"
                                  }`}
                                >
                                  <span
                                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                      allChecked ? "translate-x-4" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                              </div>

                              {/* Individual permissions */}
                              {isExpanded && (
                                <div>
                                  {perms.map((perm) => {
                                    const isChecked = pendingKeys.has(perm.key);
                                    const wasOriginal = originalKeys.has(perm.key);
                                    const isDirty = isChecked !== wasOriginal;

                                    return (
                                      <button
                                        key={perm.key}
                                        onClick={() => togglePermission(perm.key)}
                                        className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 group border-t border-slate-200 dark:border-slate-800/40 ${
                                          isDirty ? "bg-amber-500/5" : ""
                                        }`}
                                      >
                                        {/* Checkbox */}
                                        <div
                                          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                            isChecked
                                              ? "bg-purple-600 border-purple-600"
                                              : "border-slate-300 dark:border-slate-600 group-hover:border-slate-400"
                                          }`}
                                        >
                                          {isChecked && (
                                            <Check className="w-2.5 h-2.5 text-white" />
                                          )}
                                        </div>

                                        {/* Permission info */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                                              {perm.label}
                                            </span>
                                            {isDirty && (
                                              <span
                                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border ${
                                                  isChecked
                                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                                    : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                                                }`}
                                              >
                                                {isChecked ? "+ Added" : "− Removed"}
                                              </span>
                                            )}
                                          </div>
                                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-500">
                                            {perm.key}
                                          </span>
                                          {perm.description !== null &&
                                            perm.description !== undefined &&
                                            perm.description.length > 0 && (
                                              <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                                                {perm.description}
                                              </p>
                                            )}
                                        </div>

                                        {/* Scope badge */}
                                        <span
                                          className={`shrink-0 text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                            perm.scope === "system"
                                              ? "text-amber-700 dark:text-amber-400 border-amber-500/20 bg-amber-500/5"
                                              : "text-slate-600 dark:text-slate-500 border-slate-300 dark:border-slate-700/50 bg-slate-100 dark:bg-slate-800/30"
                                          }`}
                                        >
                                          {perm.scope}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Dialogs ──────────────────────────────────────────────────────── */}

      <RoleFormDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateRole}
        title="Create New Role"
      />

      <RoleFormDialog
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingRole(null);
        }}
        onSubmit={handleUpdateRole}
        initialData={
          editingRole !== null
            ? {
                name: editingRole.name,
                key: editingRole.key,
                description: editingRole.description ?? "",
                isSystemRole: editingRole.isSystemRole,
              }
            : null
        }
        title="Edit Role"
      />

      <ConfirmActionDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingRole(null);
        }}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        description={`Are you sure you want to permanently delete the role "${deletingRole?.name ?? ""}"? This will remove all associated permission assignments and cannot be undone.`}
        confirmLabel="Delete Role"
        cancelLabel="Cancel"
        loading={isDeleting}
      />

      <ConfirmActionDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetPermissions}
        title="Reset Default Permissions"
        description="This resets all seeded roles back to their initial permission configuration. Any custom changes made to seeded roles will be lost. Are you sure you want to continue?"
        confirmLabel="Reset to Defaults"
        cancelLabel="Cancel"
        loading={isResetting}
      />
    </div>
  );
}
