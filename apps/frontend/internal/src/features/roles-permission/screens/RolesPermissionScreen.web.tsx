import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  COLORS,
  useTheme,
  PageHeader,
  AnimatedCard,
  SearchBar,
  SkeletonLoader,
  EmptyState,
  Button,
  Icon as Lucide,
  SPACING,
  RADIUS,
  SHADOWS,
} from '@edge/ui';
import { useAdminRoles, useRolePermissions, usePermissionsCatalog, apiClient } from '@edge/api';
import { Role } from '../data/mockRolesPermissions';
import { RoleCard } from '../components/RoleCard';
import { PermissionCategoryCard } from '../components/PermissionCategoryCard';
import { AddRoleModal } from '../components/AddRoleModal';
import { DeleteRoleConfirmModal } from '../components/DeleteRoleConfirmModal';

export function RolesPermissionScreen() {
  const { colors, isDark } = useTheme();
  const { width, height: windowHeight } = useWindowDimensions();
  const calculatedHeight = Platform.OS === 'web' ? Math.max(500, windowHeight - 160) : '100%';

  const { roles: apiRoles, isLoading: isApiLoading, refetch } = useAdminRoles();
  const { categories: apiCategories, isLoading: isCatalogLoading } = usePermissionsCatalog();

  const [localRoles, setLocalRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredRoles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
    );
  }, [roles, searchQuery]);

  const handleSelectRole = (role: Role) => {
    setSelectedRoleId(role.id);
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
      showToast(`Permissions updated successfully for ${selectedRole.name}`);
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
      showToast(`Role "${newRoleData.name}" created.`);
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
      showToast(`Role "${newRoleData.name}" created.`);
    }
  };

  const handleConfirmDeleteRole = async (roleId: string) => {
    try {
      await apiClient.delete(`/api/v2/roles/${roleId}`);
      await refetch();
    } catch (err) {
      setLocalRoles((prev) => prev.filter((r) => r.id !== roleId));
    }

    setSavedRolePermissions((prev) => {
      const next = { ...prev };
      delete next[roleId];
      return next;
    });

    setDraftRolePermissions((prev) => {
      const next = { ...prev };
      delete next[roleId];
      return next;
    });

    if (selectedRoleId === roleId) {
      const remaining = roles.filter((r) => r.id !== roleId);
      if (remaining.length > 0) {
        setSelectedRoleId(remaining[0].id);
      }
    }
    showToast('Role deleted successfully.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.container}
    >
      <PageHeader
        title="Roles & Permission Governance"
        subtitle="Manage user roles, RBAC policy access levels, and granular tenant permissions across all NTC services."
        action={
          <Button
            variant="primary"
            leftIcon={<Lucide name="user-plus" size={16} color={COLORS.neutral.white} />}
            onPress={() => setIsAddModalOpen(true)}
          >
            Add Role
          </Button>
        }
      />

      {toastMessage !== null && (
        <View style={[styles.toastContainer, SHADOWS.modal]}>
          <Lucide name="check-circle" size={18} color={COLORS.semantic.success} style={{ marginRight: 8 }} />
          <Text style={{ color: COLORS.neutral.white, fontWeight: '500' }}>{toastMessage}</Text>
        </View>
      )}

      <View style={[styles.mainLayout, { height: calculatedHeight }]}>
        {/* Left Column - Role Selection List */}
        <View style={[styles.leftColumn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.searchWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search roles..."
            />
          </View>

          <ScrollView style={styles.rolesScroll} showsVerticalScrollIndicator={false}>
            {isApiLoading && roles.length === 0 ? (
              <View style={styles.loadingPadding}>
                <SkeletonLoader variant="rectangular" width="100%" height={60} borderRadius={8} />
                <SkeletonLoader variant="rectangular" width="100%" height={60} borderRadius={8} />
              </View>
            ) : filteredRoles.length === 0 ? (
              <EmptyState
                icon="shield"
                title="No Roles Found"
                description={`No role matches "${searchQuery}"`}
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
        </View>

        {/* Right Column - Permission Matrix Panel */}
        {selectedRole !== null && (
          <View style={[styles.rightColumn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.configHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.roleTitleGroup}>
                <Text style={[styles.configSubheader, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>ROLE CONFIGURATION</Text>
                <Text style={[styles.configRoleName, { color: colors.text }]}>{selectedRole.name}</Text>
              </View>

              {hasUnsavedChanges && (
                <View style={styles.unsavedBadge}>
                  <View style={styles.unsavedDot} />
                  <Text style={styles.unsavedText}>Unsaved Changes</Text>
                </View>
              )}
            </View>

            <View style={[styles.matrixToolbar, { backgroundColor: isDark ? colors.cardBg : colors.bg, borderBottomColor: colors.border }]}>
              <Text style={[styles.matrixTitle, { color: colors.text }]}>ACCESS PERMISSIONS</Text>
              <Button
                variant={isAllSelected ? 'primary' : 'outline'}
                size="sm"
                onPress={handleToggleSelectAll}
              >
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </Button>
            </View>

            <ScrollView style={styles.matrixScroll} showsVerticalScrollIndicator={false}>
              {isPermissionsLoading || isCatalogLoading ? (
                <View style={styles.loadingPadding}>
                  <SkeletonLoader variant="rectangular" width="100%" height={100} borderRadius={8} />
                  <SkeletonLoader variant="rectangular" width="100%" height={100} borderRadius={8} />
                </View>
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

            <View style={[styles.stickyFooter, { borderTopColor: colors.border }]}>
              <Button
                variant="primary"
                isLoading={isSubmitting}
                isDisabled={!hasUnsavedChanges || isSubmitting}
                leftIcon={<Lucide name="save" size={16} color={COLORS.neutral.white} />}
                onPress={handleUpdatePermissions}
              >
                Update Permissions
              </Button>
            </View>
          </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: SPACING[20],
    gap: SPACING[16],
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  toastContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 100,
    backgroundColor: COLORS.neutral[900],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainLayout: {
    flexDirection: 'row',
    gap: SPACING[16],
  },
  leftColumn: {
    width: 360,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[12],
    gap: SPACING[12],
  },
  searchWrapper: {
    width: '100%',
  },
  rolesScroll: {
    flex: 1,
  },
  loadingPadding: {
    padding: SPACING[12],
    gap: SPACING[8],
  },
  rightColumn: {
    flex: 1,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING[16],
    borderBottomWidth: 1,
  },
  roleTitleGroup: {
    gap: 2,
  },
  configSubheader: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.brand[700],
    letterSpacing: 0.8,
  },
  configRoleName: {
    fontSize: 20,
    fontWeight: '700',
  },
  unsavedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.semantic.warningBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.circle,
  },
  unsavedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.semantic.warning,
    marginRight: 6,
  },
  unsavedText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.semantic.warningText,
  },
  matrixToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    borderBottomWidth: 1,
  },
  matrixTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.neutral[400],
  },
  matrixScroll: {
    flex: 1,
    padding: SPACING[16],
  },
  stickyFooter: {
    padding: SPACING[16],
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
});
