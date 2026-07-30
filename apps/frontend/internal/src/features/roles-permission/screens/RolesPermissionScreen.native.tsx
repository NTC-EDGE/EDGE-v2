import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { COLORS, useTheme, PageHeader, SearchBar, SkeletonLoader, EmptyState, Button, Icon as Lucide, SPACING, RADIUS } from '@edge/ui';
import { useAdminRoles, useRolePermissions, usePermissionsCatalog, apiClient } from '@edge/api';
import { Role } from '../data/mockRolesPermissions';
import { RoleCard } from '../components/RoleCard';
import { PermissionCategoryCard } from '../components/PermissionCategoryCard';
import { AddRoleModal } from '../components/AddRoleModal';
import { DeleteRoleConfirmModal } from '../components/DeleteRoleConfirmModal';

export function RolesPermissionScreen() {
  const { colors, isDark } = useTheme();
  const { roles: apiRoles, isLoading: isApiLoading, refetch } = useAdminRoles();
  const { categories: apiCategories, isLoading: isCatalogLoading } = usePermissionsCatalog();

  const [localRoles, setLocalRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<'roles' | 'config'>('roles');

  const roles = useMemo(() => {
    if (apiRoles.length > 0) {
      return apiRoles.map((r) => {
        const initials = r.name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        return {
          id: r.id,
          name: r.name,
          isSystemRole: r.isSystemRole,
          avatarBgColor: r.isSystemRole ? COLORS.brand.redLight : COLORS.brand.skyLight,
          avatarInitials: initials || 'R',
        };
      });
    }
    return localRoles;
  }, [apiRoles, localRoles]);

  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const selectedRole = useMemo(() => {
    const found = roles.find((r) => r.id === selectedRoleId);
    return found !== undefined ? found : roles[0] || null;
  }, [roles, selectedRoleId]);

  const {
    permissionKeys: serverRolePermissions,
    isLoading: isPermissionsLoading,
    refetch: refetchPermissions,
  } = useRolePermissions(selectedRole?.id);

  const displayCategories = apiCategories;

  const [savedRolePermissions, setSavedRolePermissions] = useState<Record<string, string[]>>({});
  const [draftRolePermissions, setDraftRolePermissions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (selectedRole !== null && serverRolePermissions !== undefined) {
      setSavedRolePermissions((prev) => ({ ...prev, [selectedRole.id]: serverRolePermissions }));
      setDraftRolePermissions((prev) => ({ ...prev, [selectedRole.id]: serverRolePermissions }));
    }
  }, [selectedRole, serverRolePermissions]);

  const allCategoryPermissionIds = useMemo(() => {
    const ids: string[] = [];
    displayCategories.forEach((cat) => {
      cat.options.forEach((opt) => ids.push(opt.id));
    });
    return ids;
  }, [displayCategories]);

  const activePermissions = useMemo(() => {
    if (selectedRole !== null && draftRolePermissions[selectedRole.id] !== undefined) {
      return draftRolePermissions[selectedRole.id];
    }
    return [];
  }, [draftRolePermissions, selectedRole]);

  const isAllSelected = useMemo(() => {
    if (allCategoryPermissionIds.length === 0) return false;
    const activeSet = new Set(activePermissions);
    return allCategoryPermissionIds.every((id) => activeSet.has(id));
  }, [allCategoryPermissionIds, activePermissions]);

  const hasUnsavedChanges = useMemo(() => {
    if (selectedRole === null) return false;
    const saved = savedRolePermissions[selectedRole.id] || [];
    const draft = draftRolePermissions[selectedRole.id] || [];

    if (saved.length !== draft.length) return true;
    const savedSet = new Set(saved);
    return !draft.every((id) => savedSet.has(id));
  }, [selectedRole, savedRolePermissions, draftRolePermissions]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const filteredRoles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
    );
  }, [roles, searchQuery]);

  const handleSelectRole = (role: Role) => {
    setSelectedRoleId(role.id);
    setMobileView('config');
  };

  const handleTogglePermission = (permissionId: string) => {
    if (selectedRole === null) return;
    const roleId = selectedRole.id;
    setDraftRolePermissions((prev) => {
      const currentList = prev[roleId] || [];
      const exists = currentList.includes(permissionId);
      const updated = exists
        ? currentList.filter((id) => id !== permissionId)
        : [...currentList, permissionId];

      return { ...prev, [roleId]: updated };
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedRole === null) return;
    const roleId = selectedRole.id;
    if (isAllSelected) {
      setDraftRolePermissions((prev) => ({ ...prev, [roleId]: [] }));
    } else {
      setDraftRolePermissions((prev) => ({ ...prev, [roleId]: [...allCategoryPermissionIds] }));
    }
  };

  const handleUpdatePermissions = async () => {
    if (selectedRole === null || !hasUnsavedChanges || isSubmitting) return;

    setIsSubmitting(true);
    const roleId = selectedRole.id;
    const currentDraft = draftRolePermissions[roleId] || [];
    const previousSaved = savedRolePermissions[roleId] || [];

    const added = currentDraft.filter((p) => !previousSaved.includes(p));
    const removed = previousSaved.filter((p) => !currentDraft.includes(p));

    try {
      for (const permKey of added) {
        await apiClient.post('/api/v2/role-permissions/assign', {
          roleId,
          permissionKey: permKey,
        }).catch(() => {});
      }

      for (const permKey of removed) {
        await apiClient.post('/api/v2/role-permissions/revoke', {
          roleId,
          permissionKey: permKey,
        }).catch(() => {});
      }

      setSavedRolePermissions((prev) => ({
        ...prev,
        [roleId]: [...currentDraft],
      }));
      refetchPermissions();
      setIsSubmitting(false);
    } catch (err) {
      console.error('Failed to update role permissions:', err);
      setIsSubmitting(false);
    }
  };

  const handleAddRole = async (newRoleData: {
    name: string;
    initialPermissionIds: string[];
  }) => {
    const roleKey = newRoleData.name.toLowerCase().replace(/\s+/g, '-');
    try {
      const res = await apiClient.post<{ id: string }>('/api/v2/roles', {
        name: newRoleData.name,
        key: roleKey,
        isSystemRole: false,
      });
      await refetch();
      if (res.data?.id) {
        setSelectedRoleId(res.data.id);
      }
    } catch (err) {
      const newId = `role-${Date.now()}`;
      const initials = newRoleData.name.substring(0, 2).toUpperCase();
      const createdRole: Role = {
        id: newId,
        name: newRoleData.name,
        isSystemRole: false,
        avatarBgColor: COLORS.brand.skyLight,
        avatarInitials: initials,
      };
      setLocalRoles((prev) => [createdRole, ...prev]);
      setSelectedRoleId(newId);
    }
    setMobileView('config');
  };

  const handleConfirmDeleteRole = async (roleId: string) => {
    try {
      await apiClient.delete(`/api/v2/roles/${roleId}`);
      await refetch();
    } catch (err) {
      setLocalRoles((prev) => prev.filter((r) => r.id !== roleId));
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        {mobileView === 'roles' ? (
          <>
            <PageHeader
              title="Roles & Permissions"
              subtitle="Mobile Admin • Role management"
              action={
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Lucide name="user-plus" size={14} color={COLORS.neutral.white} />}
                  onPress={() => setIsAddModalOpen(true)}
                >
                  Add
                </Button>
              }
            />

            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search roles..."
            />

            <ScrollView style={styles.rolesScroll} showsVerticalScrollIndicator={false}>
              {isApiLoading && roles.length === 0 ? (
                <View style={styles.loadingPadding}>
                  <SkeletonLoader variant="rectangular" width="100%" height={60} borderRadius={8} />
                </View>
              ) : filteredRoles.length === 0 ? (
                <EmptyState
                  icon="shield"
                  title="No Roles Found"
                  description="No matching roles"
                />
              ) : (
                filteredRoles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    isSelected={selectedRole !== null && selectedRole.id === role.id}
                    onSelect={handleSelectRole}
                    onDelete={(r) => setRoleToDelete(r)}
                  />
                ))
              )}
            </ScrollView>
          </>
        ) : (
          selectedRole !== null && (
            <View style={styles.configContainer}>
              <View style={styles.mobileNavHeader}>
                <Pressable onPress={() => setMobileView('roles')}>
                  <Lucide name="arrow-left" size={20} color={colors.text} />
                </Pressable>
                <Text style={[styles.mobileRoleName, { color: colors.text }]}>
                  {selectedRole.name}
                </Text>
                <Button
                  variant={isAllSelected ? 'primary' : 'outline'}
                  size="sm"
                  onPress={handleToggleSelectAll}
                >
                  {isAllSelected ? 'Deselect' : 'Select All'}
                </Button>
              </View>

              <ScrollView style={styles.matrixScroll} showsVerticalScrollIndicator={false}>
                {isPermissionsLoading || isCatalogLoading ? (
                  <SkeletonLoader variant="rectangular" width="100%" height={100} borderRadius={8} />
                ) : (
                  displayCategories.map((category) => (
                    <PermissionCategoryCard
                      key={category.id}
                      category={category}
                      activePermissionIds={activePermissions}
                      onTogglePermission={handleTogglePermission}
                    />
                  ))
                )}
              </ScrollView>

              <View style={[styles.mobileStickyFooter, { borderTopColor: colors.border }]}>
                <Button
                  variant="primary"
                  isLoading={isSubmitting}
                  isDisabled={!hasUnsavedChanges || isSubmitting}
                  onPress={handleUpdatePermissions}
                >
                  Save Permissions
                </Button>
              </View>
            </View>
          )
        )}
      </View>

      <AddRoleModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRole={handleAddRole}
        existingRoles={roles}
        rolePermissionsMap={savedRolePermissions}
      />

      <DeleteRoleConfirmModal
        visible={roleToDelete !== null}
        role={roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirmDelete={handleConfirmDeleteRole}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: SPACING[16],
    gap: SPACING[12],
  },
  rolesScroll: {
    flex: 1,
  },
  loadingPadding: {
    gap: SPACING[8],
  },
  configContainer: {
    flex: 1,
    gap: SPACING[12],
  },
  mobileNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileRoleName: {
    fontSize: 18,
    fontWeight: '700',
  },
  matrixScroll: {
    flex: 1,
  },
  mobileStickyFooter: {
    paddingTop: SPACING[8],
    borderTopWidth: 1,
  },
});
