import { useState, useMemo, useEffect } from 'react';
import {
  useAdminRoles,
  useRolePermissions,
  usePermissionsCatalog,
  roleService,
  Role as ApiRole,
} from '@edge/api';
import { useAuthContext } from '../../auth/context/AuthContext';
import { usePermissions } from '../../shell/context/PermissionContext';
import { Role as UIFormatRole } from '../types';

export type RoleFilterScope = 'all' | 'system' | 'custom';

export function useRoleManagement() {
  const { user } = useAuthContext();
  const { hasPermission, isSuperAdmin, isAdmin } = usePermissions();
  const tenantId = user?.tenantId;

  const canCreateRole = isSuperAdmin || isAdmin || hasPermission('roles.create');
  const canUpdateRole = isSuperAdmin || isAdmin || hasPermission('roles.update');
  const canDeleteRole = isSuperAdmin || isAdmin || hasPermission('roles.delete');
  const canAssignPermissions = isSuperAdmin || isAdmin || hasPermission('roles.permissions_assign') || hasPermission('roles.update');

  const { roles: apiRoles, isLoading: isRolesLoading, refetch: refetchRoles } = useAdminRoles(tenantId);
  const { categories: apiCategories, isLoading: isCatalogLoading } = usePermissionsCatalog();

  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [roleScopeFilter, setRoleScopeFilter] = useState<RoleFilterScope>('all');
  const [permissionQuery, setPermissionQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [savedRolePermissions, setSavedRolePermissions] = useState<Record<string, string[]>>({});
  const [draftRolePermissions, setDraftRolePermissions] = useState<Record<string, string[]>>({});

  // ── Map API roles to UI format (Standard Roles vs Tenant Custom Roles) ──────
  const roles: UIFormatRole[] = useMemo(() => {
    if (apiRoles && apiRoles.length > 0) {
      return apiRoles
        .filter(
          (r: ApiRole) =>
            r.name !== null &&
            r.name !== undefined &&
            !r.name.toLowerCase().includes('super admin') &&
            !r.name.toLowerCase().includes('system admin'),
        )
        .map((r: ApiRole) => {
          const roleName = r.name !== null && r.name !== undefined ? r.name : 'Role';
          const initials = roleName
            .split(' ')
            .map((w) => w[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

          const isStandardRole = r.tenantId === null || r.tenantId === undefined || Boolean(r.isSystemRole) || (tenantId !== undefined && r.tenantId !== tenantId);

          return {
            id: r.id,
            name: roleName,
            tenantId: r.tenantId,
            isSystemRole: isStandardRole,
            description: r.description,
            avatarBgColor: isStandardRole ? '#FEF3C7' : '#E0F2FE',
            avatarInitials: initials || 'R',
          };
        });
    }
    return [];
  }, [apiRoles, tenantId]);

  // ── Auto-select first role ──────────────────────────────────────────────────
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const selectedRole = useMemo(() => {
    const found = roles.find((r) => r.id === selectedRoleId);
    return found !== undefined ? found : roles[0] ?? null;
  }, [roles, selectedRoleId]);

  // ── Permission categories (backend categorizes & scope-filters natively) ────
  const nonSystemCategories = useMemo(() => {
    return apiCategories;
  }, [apiCategories]);

  // ── Server permissions for selected role ────────────────────────────────────
  const {
    permissionKeys: serverRolePermissions,
    isLoading: isPermissionsLoading,
    refetch: refetchPermissions,
  } = useRolePermissions(selectedRole?.id);

  useEffect(() => {
    if (selectedRole !== null && serverRolePermissions !== undefined) {
      setSavedRolePermissions((prev) => ({ ...prev, [selectedRole.id]: serverRolePermissions }));
      setDraftRolePermissions((prev) => ({ ...prev, [selectedRole.id]: serverRolePermissions }));
    }
  }, [selectedRole, serverRolePermissions]);

  // ── All permission IDs across non-system categories ─────────────────────────
  const allPermissionIds = useMemo(() => {
    const ids: string[] = [];
    nonSystemCategories.forEach((cat) => cat.options.forEach((opt) => ids.push(opt.id)));
    return ids;
  }, [nonSystemCategories]);

  // ── Active (draft) permissions for selected role ────────────────────────────
  const activePermissions = useMemo(() => {
    if (selectedRole !== null && draftRolePermissions[selectedRole.id] !== undefined) {
      return draftRolePermissions[selectedRole.id];
    }
    return [];
  }, [draftRolePermissions, selectedRole]);

  const isAllSelected = useMemo(() => {
    if (allPermissionIds.length === 0) return false;
    const activeSet = new Set(activePermissions);
    return allPermissionIds.every((id) => activeSet.has(id));
  }, [allPermissionIds, activePermissions]);

  const hasUnsavedChanges = useMemo(() => {
    if (selectedRole === null) return false;
    const saved = savedRolePermissions[selectedRole.id] ?? [];
    const draft = draftRolePermissions[selectedRole.id] ?? [];
    if (saved.length !== draft.length) return true;
    const savedSet = new Set(saved);
    return !draft.every((id) => savedSet.has(id));
  }, [selectedRole, savedRolePermissions, draftRolePermissions]);

  // ── Filtered role list ──────────────────────────────────────────────────────
  const filteredRoles = useMemo(() => {
    let result = roles;
    if (roleScopeFilter === 'system') {
      result = result.filter((r) => r.isSystemRole);
    } else if (roleScopeFilter === 'custom') {
      result = result.filter((r) => !r.isSystemRole);
    }
    const q = roleSearchQuery.trim().toLowerCase();
    if (!q) return result;
    return result.filter(
      (r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q),
    );
  }, [roles, roleSearchQuery, roleScopeFilter]);

  // ── Filtered permission categories ─────────────────────────────────────────
  const filteredCategories = useMemo(() => {
    let list = nonSystemCategories;
    if (selectedCategoryFilter !== 'all') {
      list = list.filter((cat) => cat.id === selectedCategoryFilter);
    }
    const pq = permissionQuery.trim().toLowerCase();
    if (!pq) return list;
    return list
      .map((cat) => ({
        ...cat,
        options: cat.options.filter(
          (opt) => opt.label.toLowerCase().includes(pq) || opt.id.toLowerCase().includes(pq),
        ),
      }))
      .filter((cat) => cat.options.length > 0);
  }, [nonSystemCategories, selectedCategoryFilter, permissionQuery]);

  const isOwnCustomRole = Boolean(
    selectedRole !== null &&
    selectedRole.tenantId !== null &&
    selectedRole.tenantId !== undefined &&
    (tenantId === undefined || selectedRole.tenantId === tenantId) &&
    !selectedRole.isSystemRole
  );

  const isCurrentRoleReadOnly = Boolean(!isOwnCustomRole || !canAssignPermissions);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSelectRole = (role: UIFormatRole) => {
    setSelectedRoleId(role.id);
  };

  const handleTogglePermission = (permissionId: string) => {
    if (selectedRole === null || isCurrentRoleReadOnly) return;
    const roleId = selectedRole.id;
    setDraftRolePermissions((prev) => {
      const currentList = prev[roleId] ?? [];
      const exists = currentList.includes(permissionId);
      const updated = exists
        ? currentList.filter((id) => id !== permissionId)
        : [...currentList, permissionId];
      return { ...prev, [roleId]: updated };
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedRole === null || isCurrentRoleReadOnly) return;
    const roleId = selectedRole.id;
    if (isAllSelected) {
      setDraftRolePermissions((prev) => ({ ...prev, [roleId]: [] }));
    } else {
      setDraftRolePermissions((prev) => ({ ...prev, [roleId]: [...allPermissionIds] }));
    }
  };

  const resetChanges = () => {
    if (selectedRole !== null && savedRolePermissions[selectedRole.id] !== undefined) {
      setDraftRolePermissions((prev) => ({
        ...prev,
        [selectedRole.id]: savedRolePermissions[selectedRole.id],
      }));
    }
  };

  const applyPresetTemplate = (templateRoleId: string) => {
    if (selectedRole === null || isCurrentRoleReadOnly) return;
    const templatePerms = savedRolePermissions[templateRoleId] ?? [];
    setDraftRolePermissions((prev) => ({ ...prev, [selectedRole.id]: [...templatePerms] }));
  };

  const savePermissions = async (): Promise<{ ok: boolean; error: string | null }> => {
    if (selectedRole === null || !hasUnsavedChanges || isSubmitting) return { ok: false, error: null };
    if (!isOwnCustomRole) {
      return {
        ok: false,
        error: 'Standard system roles cannot be modified inside regional tenant management. You can only configure permissions for custom roles created for your office.',
      };
    }
    setIsSubmitting(true);
    const roleId = selectedRole.id;
    const currentDraft = draftRolePermissions[roleId] ?? [];
    const previousSaved = savedRolePermissions[roleId] ?? [];
    const added = currentDraft.filter((p) => !previousSaved.includes(p));
    const removed = previousSaved.filter((p) => !currentDraft.includes(p));
    const [ok, err] = await roleService.batchUpdatePermissions(roleId, added, removed);
    const isSuccess = !err && Boolean(ok);
    if (isSuccess) {
      setSavedRolePermissions((prev) => ({ ...prev, [roleId]: [...currentDraft] }));
      refetchPermissions();
    }
    setIsSubmitting(false);
    return { ok: isSuccess, error: err };
  };

  const updateRole = async (roleId: string, newName: string): Promise<{ ok: boolean; error: string | null }> => {
    const role = roles.find((r) => r.id === roleId);
    const isCustomRoleForTenant = Boolean(
      role &&
      role.tenantId !== null &&
      role.tenantId !== undefined &&
      (tenantId === undefined || role.tenantId === tenantId) &&
      !role.isSystemRole
    );
    if (!isCustomRoleForTenant) {
      return { ok: false, error: 'Standard system roles cannot be modified in regional office management. You may only edit custom roles created for your regional office.' };
    }
    const trimmedName = newName.trim();
    if (!trimmedName) return { ok: false, error: 'Role name cannot be empty.' };
    const key = trimmedName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const [res, err] = await roleService.updateRole(roleId, {
      id: roleId,
      name: trimmedName,
      key,
      tenantId: role?.tenantId !== undefined ? role.tenantId : null,
    });
    const isSuccess = !err && Boolean(res);
    if (isSuccess) {
      refetchRoles();
    }
    return { ok: isSuccess, error: err };
  };

  const createRole = async (
    name: string,
    description?: string,
    initialPermissionIds?: string[],
  ): Promise<{ ok: boolean; error: string | null }> => {
    const key = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const [res, err] = await roleService.createRole({
      name,
      key,
      description,
      tenantId: tenantId !== undefined ? tenantId : null,
      isSystemRole: false,
    });
    const isSuccess = !err && Boolean(res);
    if (isSuccess && res) {
      if (initialPermissionIds && initialPermissionIds.length > 0) {
        await roleService.batchUpdatePermissions(res.id, initialPermissionIds, []);
      }
      refetchRoles();
      setSelectedRoleId(res.id);
    }
    return { ok: isSuccess, error: err };
  };

  const deleteRole = async (roleId: string): Promise<{ ok: boolean; error: string | null }> => {
    const role = roles.find((r) => r.id === roleId);
    const isCustomRoleForTenant = Boolean(
      role &&
      role.tenantId !== null &&
      role.tenantId !== undefined &&
      (tenantId === undefined || role.tenantId === tenantId) &&
      !role.isSystemRole
    );
    if (!isCustomRoleForTenant) {
      return { ok: false, error: 'Standard system roles cannot be deleted. You can only delete custom roles created for your regional office.' };
    }
    const [ok, err] = await roleService.deleteRole(roleId);
    const isSuccess = !err && Boolean(ok);
    if (isSuccess) {
      refetchRoles();
      if (selectedRoleId === roleId) {
        setSelectedRoleId('');
      }
    }
    return { ok: isSuccess, error: err };
  };

  return {
    roles: filteredRoles,
    allRoles: roles,
    selectedRoleId,
    setSelectedRoleId,
    selectedRole,
    isCurrentRoleReadOnly,
    isSuperAdmin,
    canCreateRole,
    canUpdateRole,
    canDeleteRole,
    canAssignPermissions,
    roleSearchQuery,
    setRoleSearchQuery,
    roleScopeFilter,
    setRoleScopeFilter,
    permissionQuery,
    setPermissionQuery,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    categories: filteredCategories,
    rawCategories: apiCategories,
    activePermissions,
    isAllSelected,
    hasUnsavedChanges,
    isSubmitting,
    isLoading: isRolesLoading || isCatalogLoading || isPermissionsLoading,
    handleSelectRole,
    handleTogglePermission,
    handleToggleSelectAll,
    resetChanges,
    applyPresetTemplate,
    savePermissions,
    createRole,
    updateRole,
    deleteRole,
  };
}
