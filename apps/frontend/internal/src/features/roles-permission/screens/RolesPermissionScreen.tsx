import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, Icon as Lucide } from '@edge/ui';
import { useAdminRoles, useRolePermissions, usePermissionsCatalog, apiClient } from '@edge/api';
import {
  Role,
  PERMISSION_CATEGORIES,
} from '../data/mockRolesPermissions';
import { RoleCard } from '../components/RoleCard';
import { PermissionCategoryCard } from '../components/PermissionCategoryCard';
import { AddRoleModal } from '../components/AddRoleModal';
import { DeleteRoleConfirmModal } from '../components/DeleteRoleConfirmModal';

export function RolesPermissionScreen() {
  const { width, height: windowHeight } = useWindowDimensions();
  const isMobile = width < 992;
  const calculatedHeight = Platform.OS === 'web' ? Math.max(400, windowHeight - 110) : '100%';

  // Live SWR API Hooks for Roles, Role Permissions, and Permissions Catalog
  const { roles: apiRoles, isLoading: isApiLoading, refetch } = useAdminRoles();
  const { categories: apiCategories, isLoading: isCatalogLoading } = usePermissionsCatalog();

  // Primary State
  const [localRoles, setLocalRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Map API Roles directly from backend endpoint
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
          avatarBgColor: r.isSystemRole ? '#FEE2E2' : '#E0F2FE',
          avatarInitials: initials || 'R',
        };
      });
    }
    return localRoles;
  }, [apiRoles, localRoles]);

  // Set default selected role
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  // Currently selected role object
  const selectedRole = useMemo(() => {
    const found = roles.find((r) => r.id === selectedRoleId);
    if (found !== undefined) {
      return found;
    }
    return roles[0] || null;
  }, [roles, selectedRoleId]);

  const { permissionKeys: serverRolePermissions, isLoading: isPermissionsLoading, refetch: refetchPermissions } = useRolePermissions(selectedRole?.id);

  // Dynamic permission categories from API or fallback
  const displayCategories = useMemo(() => {
    return apiCategories.length > 0 ? apiCategories : PERMISSION_CATEGORIES;
  }, [apiCategories]);

  // Committed/Saved Permissions vs Working/Draft Permissions
  const [savedRolePermissions, setSavedRolePermissions] = useState<Record<string, string[]>>({});
  const [draftRolePermissions, setDraftRolePermissions] = useState<Record<string, string[]>>({});

  // Sync server permissions when loaded for a role
  useEffect(() => {
    if (selectedRole !== null && serverRolePermissions !== undefined) {
      setSavedRolePermissions((prev) => ({ ...prev, [selectedRole.id]: serverRolePermissions }));
      setDraftRolePermissions((prev) => ({ ...prev, [selectedRole.id]: serverRolePermissions }));
    }
  }, [selectedRole, serverRolePermissions]);

  // Collect all permission IDs defined in dynamic category definitions
  const allCategoryPermissionIds = useMemo(() => {
    const ids: string[] = [];
    displayCategories.forEach((cat) => {
      cat.options.forEach((opt) => {
        ids.push(opt.id);
      });
    });
    return ids;
  }, [displayCategories]);

  // Working/Draft permissions for selected role
  const activePermissions = useMemo(() => {
    if (selectedRole !== null && draftRolePermissions[selectedRole.id] !== undefined) {
      return draftRolePermissions[selectedRole.id];
    }
    return [];
  }, [draftRolePermissions, selectedRole]);

  // Check if all permissions are currently selected
  const isAllSelected = useMemo(() => {
    if (allCategoryPermissionIds.length === 0) return false;
    const activeSet = new Set(activePermissions);
    return allCategoryPermissionIds.every((id) => activeSet.has(id));
  }, [allCategoryPermissionIds, activePermissions]);

  // Check if currently selected role has unsaved permission changes
  const hasUnsavedChanges = useMemo(() => {
    if (selectedRole === null) return false;
    const saved = savedRolePermissions[selectedRole.id] || [];
    const draft = draftRolePermissions[selectedRole.id] || [];

    if (saved.length !== draft.length) return true;
    const savedSet = new Set(saved);
    return !draft.every((id) => savedSet.has(id));
  }, [selectedRole, savedRolePermissions, draftRolePermissions]);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile active tab view mode (roles list vs config)
  const [mobileView, setMobileView] = useState<'roles' | 'config'>('roles');

  // Search filtered roles
  const filteredRoles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
    );
  }, [roles, searchQuery]);

  // Handlers
  const handleSelectRole = (role: Role) => {
    setSelectedRoleId(role.id);
    if (isMobile) {
      setMobileView('config');
    }
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

      return {
        ...prev,
        [roleId]: updated,
      };
    });
  };

  // Quick action: Select All / Deselect All
  const handleToggleSelectAll = () => {
    if (selectedRole === null) return;
    const roleId = selectedRole.id;
    if (isAllSelected) {
      // Clear all
      setDraftRolePermissions((prev) => ({
        ...prev,
        [roleId]: [],
      }));
    } else {
      // Select all category permission IDs
      setDraftRolePermissions((prev) => ({
        ...prev,
        [roleId]: [...allCategoryPermissionIds],
      }));
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
        avatarBgColor: '#E0F2FE',
        avatarInitials: initials,
      };
      setLocalRoles((prev) => [createdRole, ...prev]);
      setSelectedRoleId(newId);
      showToast(`Role "${newRoleData.name}" created.`);
    }

    if (isMobile) {
      setMobileView('config');
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
    <View style={[styles.mainWrapper, { height: calculatedHeight }]}>
      {/* Toast Notification Banner */}
      {toastMessage !== null && (
        <View style={[styles.toastContainer, SHADOWS.modal]}>
          <Lucide name="check-circle" size={18} color="#10B981" style={styles.toastIcon} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Main Container */}
      <View style={styles.container}>
        {/* Left Column - Roles Panel */}
        {(!isMobile || mobileView === 'roles') && (
          <View style={[styles.leftColumn, isMobile && styles.columnFullWidth]}>
            {/* Header Dark Gradient Banner */}
            <View style={styles.heroCard}>
              <Text style={styles.heroSubheader}>ADMINISTRATION</Text>
              <Text style={styles.heroTitle}>Roles and Permissions</Text>
              <Text style={styles.heroDescription}>
                Manage user roles, access levels, and permissions across all tenant services.
              </Text>

              <Pressable
                style={({ pressed }: { pressed: boolean }) => [
                  styles.addRoleBtn,
                  pressed && styles.addRoleBtnPressed,
                ]}
                onPress={() => setIsAddModalOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Add Role"
              >
                <Lucide name="user-plus" size={16} color={COLORS.neutral.white} style={styles.addRoleIcon} />
                <Text style={styles.addRoleBtnText}>Add Role</Text>
              </Pressable>
            </View>

            {/* Search Roles Input */}
            <View style={styles.searchBoxWrapper}>
              <Lucide name="search" size={16} color={COLORS.neutral[400]} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search roles..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={COLORS.neutral[400]}
              />
            </View>

            {/* Role List */}
            <ScrollView
              style={styles.rolesListScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.rolesListContent}
            >
              {isApiLoading && roles.length === 0 ? (
                <View style={styles.emptyState}>
                  <ActivityIndicator size="small" color={COLORS.brand[600]} />
                  <Text style={styles.emptyStateText}>Loading system roles from API...</Text>
                </View>
              ) : filteredRoles.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No roles found matching "{searchQuery}"</Text>
                </View>
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
        )}

        {/* Right Column - Role Configuration Matrix */}
        {(!isMobile || mobileView === 'config') && selectedRole !== null && (
          <View style={[styles.rightColumn, isMobile && styles.columnFullWidth]}>
            {/* Top Config Header */}
            <View style={styles.configHeader}>
              <View style={styles.configTitleBox}>
                {isMobile && (
                  <Pressable style={styles.backBtn} onPress={() => setMobileView('roles')}>
                    <Lucide name="arrow-left" size={20} color={COLORS.neutral[700]} />
                  </Pressable>
                )}
                <View style={styles.configRoleTitleRow}>
                  <View>
                    <Text style={styles.configSubheader}>ROLE CONFIGURATION</Text>
                    <Text style={styles.configRoleName}>{selectedRole.name}</Text>
                  </View>
                  {hasUnsavedChanges && (
                    <View style={styles.unsavedBadge}>
                      <View style={styles.unsavedDot} />
                      <Text style={styles.unsavedBadgeText}>Unsaved Changes</Text>
                    </View>
                  )}
                </View>
              </View>

              {!isMobile && (
                <Pressable
                  style={styles.closeConfigBtn}
                  onPress={() => setSelectedRoleId('')}
                  accessibilityLabel="Close Configuration"
                >
                  <Text style={styles.closeConfigBtnText}>Close</Text>
                </Pressable>
              )}
            </View>

            {/* Sub-Header: ACCESS PERMISSIONS with SELECT ALL Quick Action */}
            <View style={styles.accessPermissionsHeader}>
              <View style={styles.headerTitleGroup}>
                <View style={styles.accessAccentBar} />
                <Text style={styles.accessPermissionsTitle}>ACCESS PERMISSIONS</Text>
              </View>

              <Pressable
                style={({ pressed }: { pressed: boolean }) => [
                  styles.selectAllBtn,
                  isAllSelected ? styles.selectAllBtnActive : styles.selectAllBtnInactive,
                  pressed && styles.selectAllBtnPressed,
                ]}
                onPress={handleToggleSelectAll}
                accessibilityRole="button"
                accessibilityLabel={isAllSelected ? 'Deselect All Permissions' : 'Select All Permissions'}
              >
                <Lucide
                  name={isAllSelected ? 'check-square' : 'square'}
                  size={14}
                  color={isAllSelected ? '#1E40AF' : COLORS.brand[600]}
                />
                <Text style={[styles.selectAllBtnText, isAllSelected && styles.selectAllBtnTextActive]}>
                  {isAllSelected ? 'Deselect All' : 'Select All'}
                </Text>
              </Pressable>
            </View>

            {/* Permission Categories List */}
            <ScrollView
              style={styles.matrixScroll}
              contentContainerStyle={styles.matrixScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {isPermissionsLoading || isCatalogLoading ? (
                <View style={styles.emptyState}>
                  <ActivityIndicator size="small" color={COLORS.brand[600]} />
                  <Text style={styles.emptyStateText}>Loading permissions catalog from API...</Text>
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

              {/* Bottom Padding for floating button */}
              <View style={styles.scrollBottomSpacer} />
            </ScrollView>

            {/* Sticky Action Footer */}
            <View style={[styles.actionFooter, SHADOWS.card]}>
              <Pressable
                disabled={!hasUnsavedChanges || isSubmitting}
                style={({ pressed }: { pressed: boolean }) => [
                  styles.updatePermissionsBtn,
                  hasUnsavedChanges
                    ? styles.updatePermissionsBtnActive
                    : styles.updatePermissionsBtnDisabled,
                  pressed && hasUnsavedChanges && styles.updatePermissionsBtnPressed,
                ]}
                onPress={handleUpdatePermissions}
                accessibilityRole="button"
                accessibilityState={{ disabled: !hasUnsavedChanges || isSubmitting }}
                accessibilityLabel="Update Permissions"
              >
                {isSubmitting ? (
                  <View style={styles.btnRow}>
                    <ActivityIndicator size="small" color={COLORS.neutral.white} style={styles.spinner} />
                    <Text style={styles.updatePermissionsBtnTextActive}>Saving...</Text>
                  </View>
                ) : (
                  <View style={styles.btnRow}>
                    <Lucide
                      name="save"
                      size={16}
                      color={hasUnsavedChanges ? COLORS.neutral.white : COLORS.neutral[400]}
                      style={styles.btnIcon}
                    />
                    <Text
                      style={[
                        styles.updatePermissionsBtnText,
                        hasUnsavedChanges
                          ? styles.updatePermissionsBtnTextActive
                          : styles.updatePermissionsBtnTextDisabled,
                      ]}
                    >
                      Update Permissions
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Add Role Modal */}
      <AddRoleModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRole={handleAddRole}
        existingRoles={roles}
        rolePermissionsMap={savedRolePermissions}
      />

      {/* Delete Confirmation Modal */}
      <DeleteRoleConfirmModal
        visible={roleToDelete !== null}
        role={roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirmDelete={handleConfirmDeleteRole}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#0F172A',
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    borderRadius: RADIUS.button,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastIcon: {
    marginRight: SPACING[8],
  },
  toastText: {
    color: COLORS.neutral.white,
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    gap: SPACING[24],
  },
  columnFullWidth: {
    flex: 1,
    width: '100%',
  },
  leftColumn: {
    width: 380,
    height: '100%',
    flexDirection: 'column',
  },
  heroCard: {
    backgroundColor: '#0B1953',
    borderRadius: RADIUS.card,
    padding: SPACING[20],
    marginBottom: SPACING[16],
  },
  heroSubheader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.neutral.white,
    marginBottom: 6,
  },
  heroDescription: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: SPACING[16],
  },
  addRoleBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.circle,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addRoleBtnPressed: {
    backgroundColor: '#1D4ED8',
  },
  addRoleIcon: {
    marginRight: 6,
  },
  addRoleBtnText: {
    color: COLORS.neutral.white,
    fontSize: 13,
    fontWeight: '600',
  },
  searchBoxWrapper: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[16],
    ...SHADOWS.card,
  },
  searchIcon: {
    marginRight: SPACING[8],
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.neutral[900],
    padding: 0,
  },
  rolesListScroll: {
    flex: 1,
  },
  rolesListContent: {
    paddingBottom: SPACING[20],
  },
  emptyState: {
    padding: SPACING[24],
    alignItems: 'center',
    gap: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.neutral[500],
  },
  rightColumn: {
    flex: 1,
    height: '100%',
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    flexDirection: 'column',
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[20],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  configTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  configRoleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[16],
  },
  unsavedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderWidth: 1,
    paddingHorizontal: SPACING[8],
    paddingVertical: 4,
    borderRadius: RADIUS.circle,
  },
  unsavedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
    marginRight: 6,
  },
  unsavedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  backBtn: {
    marginRight: SPACING[12],
    padding: SPACING[4],
  },
  configSubheader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.brand[700],
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  configRoleName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.neutral[900],
  },
  closeConfigBtn: {
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.circle,
  },
  closeConfigBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  accessPermissionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accessAccentBar: {
    width: 3,
    height: 14,
    backgroundColor: COLORS.brand[700],
    marginRight: SPACING[8],
  },
  accessPermissionsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.neutral[700],
    letterSpacing: 1.1,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
  },
  selectAllBtnInactive: {
    backgroundColor: COLORS.neutral.white,
    borderColor: '#BFDBFE',
  },
  selectAllBtnActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
  },
  selectAllBtnPressed: {
    backgroundColor: '#BFDBFE',
  },
  selectAllBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.brand[600],
  },
  selectAllBtnTextActive: {
    color: '#1E40AF',
  },
  matrixScroll: {
    flex: 1,
    paddingHorizontal: SPACING[24],
    paddingTop: SPACING[20],
  },
  matrixScrollContent: {
    paddingBottom: SPACING[32],
  },
  scrollBottomSpacer: {
    height: 60,
  },
  actionFooter: {
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updatePermissionsBtn: {
    paddingHorizontal: SPACING[32],
    paddingVertical: SPACING[12],
    borderRadius: RADIUS.circle,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
  },
  updatePermissionsBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  updatePermissionsBtnActive: {
    backgroundColor: '#2563EB',
    ...SHADOWS.card,
  },
  updatePermissionsBtnPressed: {
    backgroundColor: '#1D4ED8',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: SPACING[8],
  },
  spinner: {
    marginRight: SPACING[8],
  },
  updatePermissionsBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  updatePermissionsBtnTextDisabled: {
    color: COLORS.neutral[400],
  },
  updatePermissionsBtnTextActive: {
    color: COLORS.neutral.white,
  },
});
