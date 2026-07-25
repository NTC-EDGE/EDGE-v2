import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, Icon as Lucide } from '@edge/ui';
import {
  Role,
  PERMISSION_CATEGORIES,
  INITIAL_ROLES,
  INITIAL_ROLE_PERMISSIONS,
} from '../data/mockRolesPermissions';
import { RoleCard } from '../components/RoleCard';
import { PermissionCategoryCard } from '../components/PermissionCategoryCard';
import { AddRoleModal } from '../components/AddRoleModal';
import { DeleteRoleConfirmModal } from '../components/DeleteRoleConfirmModal';

export function RolesPermissionScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 992;

  // Primary State
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(INITIAL_ROLES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(
    INITIAL_ROLE_PERMISSIONS
  );

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile active tab view mode (roles list vs config)
  const [mobileView, setMobileView] = useState<'roles' | 'config'>('roles');

  // Currently selected role object
  const selectedRole = useMemo(() => {
    const found = roles.find((r) => r.id === selectedRoleId);
    if (found !== undefined) {
      return found;
    }
    return roles[0] || null;
  }, [roles, selectedRoleId]);

  // Active permissions for selected role
  const activePermissions = useMemo(() => {
    if (selectedRole !== null && rolePermissions[selectedRole.id] !== undefined) {
      return rolePermissions[selectedRole.id];
    }
    return [];
  }, [rolePermissions, selectedRole]);

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
    setRolePermissions((prev) => {
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

  const handleUpdatePermissions = () => {
    if (selectedRole === null) return;
    showToast(`Permissions updated successfully for ${selectedRole.name}`);
  };

  const handleAddRole = (newRoleData: {
    name: string;
    initialPermissionIds: string[];
  }) => {
    const newId = `${Math.random().toString(36).substring(2, 10)}-${Math.random()
      .toString(36)
      .substring(2, 6)}-41b7-8196-${Date.now().toString(36)}`;

    const initials = newRoleData.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const createdRole: Role = {
      id: newId,
      name: newRoleData.name,
      isSystemRole: false,
      avatarBgColor: '#E0F2FE',
      avatarInitials: initials || 'R',
    };

    setRoles((prev) => [createdRole, ...prev]);
    setRolePermissions((prev) => ({
      ...prev,
      [newId]: newRoleData.initialPermissionIds,
    }));
    setSelectedRoleId(newId);
    showToast(`Role "${newRoleData.name}" created with ${newRoleData.initialPermissionIds.length} permissions.`);
    if (isMobile) {
      setMobileView('config');
    }
  };

  const handleConfirmDeleteRole = (roleId: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    setRolePermissions((prev) => {
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
    <View style={styles.mainWrapper}>
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
              <Text style={styles.heroTitle}>Roles & Permission</Text>
              <Text style={styles.heroDescription}>
                Manage user roles, access levels, and permissions.
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
              {filteredRoles.length === 0 ? (
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
                <View>
                  <Text style={styles.configSubheader}>ROLE CONFIGURATION</Text>
                  <Text style={styles.configRoleName}>{selectedRole.name}</Text>
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

            {/* Sub-Header: ACCESS PERMISSIONS */}
            <View style={styles.accessPermissionsHeader}>
              <View style={styles.accessAccentBar} />
              <Text style={styles.accessPermissionsTitle}>ACCESS PERMISSIONS</Text>
            </View>

            {/* Permission Categories List */}
            <ScrollView
              style={styles.matrixScroll}
              contentContainerStyle={styles.matrixScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {PERMISSION_CATEGORIES.map((category) => (
                <PermissionCategoryCard
                  key={category.id}
                  category={category}
                  activePermissionIds={activePermissions}
                  onTogglePermission={handleTogglePermission}
                />
              ))}

              {/* Bottom Padding for floating button */}
              <View style={styles.scrollBottomSpacer} />
            </ScrollView>

            {/* Sticky Action Footer */}
            <View style={[styles.actionFooter, SHADOWS.card]}>
              <Pressable
                style={({ pressed }: { pressed: boolean }) => [
                  styles.updatePermissionsBtn,
                  pressed && styles.updatePermissionsBtnPressed,
                ]}
                onPress={handleUpdatePermissions}
                accessibilityRole="button"
                accessibilityLabel="Update Permissions"
              >
                <Text style={styles.updatePermissionsBtnText}>Update Permissions</Text>
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
        rolePermissionsMap={rolePermissions}
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
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1400,
  },
  toastContainer: {
    position: 'absolute',
    top: 16,
    right: 24,
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
    flex: 1,
    flexDirection: 'row',
    padding: SPACING[20],
    gap: SPACING[20],
  },
  columnFullWidth: {
    flex: 1,
    width: '100%',
  },
  leftColumn: {
    width: 380,
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
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.neutral[500],
  },
  rightColumn: {
    flex: 1,
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
  configRoleDescription: {
    fontSize: 13,
    color: COLORS.neutral[500],
    marginTop: 2,
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
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
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
    backgroundColor: '#64748B',
    paddingHorizontal: SPACING[32],
    paddingVertical: SPACING[12],
    borderRadius: RADIUS.circle,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  updatePermissionsBtnPressed: {
    backgroundColor: '#475569',
  },
  updatePermissionsBtnText: {
    color: COLORS.neutral.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
