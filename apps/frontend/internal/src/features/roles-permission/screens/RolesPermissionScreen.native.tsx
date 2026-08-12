import React, { useRef, useEffect, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Icon as Lucide, RADIUS, SPACING, TYPOGRAPHY, useTheme } from '@edge/ui';
import { useRoleManagement } from '../hooks/useRoleManagement';
import { RoleListItem } from '../components/RoleListItem';
import { PermissionCategoryCard } from '../components/PermissionCategoryCard';
import { AddRoleModal } from '../components/AddRoleModal';
import { DeleteRoleConfirmModal } from '../components/DeleteRoleConfirmModal';
import type { Role } from '../types';

export function RolesPermissionScreen() {
  const { colors, isDark } = useTheme();
  const [mobileView, setMobileView] = useState<'list' | 'permissions'>('list');

  const {
    roles,
    allRoles,
    selectedRole,
    setSelectedRoleId,
    roleSearchQuery,
    setRoleSearchQuery,
    roleScopeFilter,
    setRoleScopeFilter,
    permissionQuery,
    setPermissionQuery,
    categories,
    activePermissions,
    isAllSelected,
    hasUnsavedChanges,
    isSubmitting,
    isLoading,
    handleTogglePermission,
    handleToggleSelectAll,
    resetChanges,
    savePermissions,
    createRole,
    updateRole,
    deleteRole,
  } = useRoleManagement();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [isEditingRoleName, setIsEditingRoleName] = useState(false);
  const [editingRoleNameText, setEditingRoleNameText] = useState('');

  const startEditingRoleName = () => {
    if (selectedRole) {
      setEditingRoleNameText(selectedRole.name);
      setIsEditingRoleName(true);
    }
  };

  const handleSaveRoleName = async () => {
    if (!selectedRole || !editingRoleNameText.trim()) return;
    const trimmed = editingRoleNameText.trim();
    if (trimmed === selectedRole.name) {
      setIsEditingRoleName(false);
      return;
    }
    const res = await updateRole(selectedRole.id, trimmed);
    if (res.ok) {
      showToast(`Role renamed to "${trimmed}"`);
      setIsEditingRoleName(false);
    } else if (res.error) {
      showToast(res.error);
    }
  };

  const canvasBg = isDark ? colors.neutral[900] : colors.neutral[50];
  const cardBg = isDark ? colors.neutral[800] : '#FFFFFF';
  const borderColor = isDark ? colors.neutral[700] : colors.neutral[200];
  const textColor = isDark ? colors.neutral[100] : colors.neutral[900];
  const mutedColor = isDark ? colors.neutral[400] : colors.neutral[500];
  const accentColor = isDark ? '#60A5FA' : colors.brand[700];
  const accentBg = isDark ? colors.brand[800] : colors.brand[700];
  const inputBg = isDark ? colors.neutral[900] : '#FFFFFF';
  const inputBorder = isDark ? colors.neutral[600] : colors.neutral[300];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleSave = async () => {
    const res = await savePermissions();
    if (res.ok && selectedRole) {
      showToast(`Saved for "${selectedRole.name}"`);
    } else if (res.error) {
      showToast(res.error);
    }
  };

  const handleAddRole = async (data: { name: string; initialPermissionIds: string[] }) => {
    const res = await createRole(data.name, undefined, data.initialPermissionIds);
    if (res.ok) {
      showToast(`Role "${data.name}" created.`);
    } else if (res.error) {
      showToast(res.error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    const res = await deleteRole(roleId);
    if (res.ok) {
      showToast('Role deleted.');
    } else if (res.error) {
      showToast(res.error);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: canvasBg }]}>
      {/* VIEW 1: Roles List */}
      {mobileView === 'list' && (
        <View style={styles.tabContent}>
          {/* Search + Add */}
          <View style={[styles.rolesTopRow, { paddingHorizontal: SPACING[16], paddingTop: SPACING[12] }]}>
            <View style={[styles.searchRow, { backgroundColor: inputBg, borderColor: inputBorder, flex: 1 }]}>
              <Lucide name="search" size={14} color={mutedColor} />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Search roles..."
                placeholderTextColor={mutedColor}
                value={roleSearchQuery}
                onChangeText={setRoleSearchQuery}
              />
            </View>
            <Pressable
              style={[styles.addBtn, { backgroundColor: accentBg }]}
              onPress={() => setIsAddModalOpen(true)}
            >
              <Lucide name="plus" size={15} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Role List */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {roles.map((role) => (
              <RoleListItem
                key={role.id}
                role={role}
                isSelected={selectedRole?.id === role.id}
                onPress={() => {
                  setSelectedRoleId(role.id);
                  setMobileView('permissions');
                }}
                onDeletePress={() => setRoleToDelete(role)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* VIEW 2: Permissions with Back Button */}
      {mobileView === 'permissions' && selectedRole !== null && (
        <View style={styles.tabContent}>
          {/* Header with Back Button replacing Circled Avatar */}
          <View style={[styles.roleBanner, { backgroundColor: cardBg, borderColor }]}>
            <Pressable
              style={[styles.backBtn, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}
              onPress={() => setMobileView('list')}
              accessibilityLabel="Back to roles list"
            >
              <Lucide name="arrow-left" size={18} color={textColor} />
            </Pressable>

            <View style={styles.roleBannerInfo}>
              {isEditingRoleName ? (
                <View style={styles.inlineEditRow}>
                  <TextInput
                    style={[styles.inlineEditInput, { color: textColor, borderColor: inputBorder, backgroundColor: inputBg }]}
                    value={editingRoleNameText}
                    onChangeText={setEditingRoleNameText}
                    autoFocus
                    onSubmitEditing={handleSaveRoleName}
                  />
                  <Pressable onPress={handleSaveRoleName} style={styles.inlineEditIconBtn} hitSlop={6}>
                    <Lucide name="check" size={14} color="#10B981" />
                  </Pressable>
                  <Pressable onPress={() => setIsEditingRoleName(false)} style={styles.inlineEditIconBtn} hitSlop={6}>
                    <Lucide name="x" size={14} color={mutedColor} />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.roleNameRow}>
                  <Text style={[styles.roleNameText, { color: textColor }]}>{selectedRole.name}</Text>
                  {hasUnsavedChanges && <View style={styles.unsavedDot} />}
                  {!selectedRole.isSystemRole && (
                    <Pressable onPress={startEditingRoleName} style={styles.editTitleBtn} hitSlop={6} accessibilityLabel="Rename role">
                      <Lucide name="edit-2" size={13} color={mutedColor} />
                    </Pressable>
                  )}
                </View>
              )}
              <Text style={[styles.roleScopeText, { color: mutedColor }]}>
                {selectedRole.isSystemRole ? 'System Role' : 'Custom Role'}
              </Text>
            </View>
            <Pressable
              style={[
                styles.saveBtn,
                {
                  backgroundColor: hasUnsavedChanges && !isSubmitting ? accentBg : (isDark ? colors.neutral[700] : colors.neutral[200]),
                  opacity: !hasUnsavedChanges || isSubmitting ? 0.5 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={!hasUnsavedChanges || isSubmitting}
            >
              <Lucide name="save" size={14} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving…' : 'Save'}</Text>
            </Pressable>
          </View>

          {/* Permission Search */}
          <View style={[styles.searchRow, { backgroundColor: inputBg, borderColor: inputBorder, marginHorizontal: SPACING[16] }]}>
            <Lucide name="search" size={14} color={mutedColor} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search permissions..."
              placeholderTextColor={mutedColor}
              value={permissionQuery}
              onChangeText={setPermissionQuery}
            />
          </View>

          {/* Category Cards */}
          <ScrollView contentContainerStyle={styles.categoriesContent} showsVerticalScrollIndicator={false}>
            {categories.map((cat) => (
              <PermissionCategoryCard
                key={cat.id}
                category={cat}
                activePermissionIds={activePermissions}
                onTogglePermission={handleTogglePermission}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Toast */}
      {toastMsg !== null && (
        <View style={[styles.toast, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[900] }]}>
          <Lucide name="check-circle" size={14} color="#10B981" />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      {/* Modals */}
      <AddRoleModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRole={handleAddRole}
        existingRoles={allRoles}
      />
      <DeleteRoleConfirmModal
        visible={roleToDelete !== null}
        role={roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirmDelete={handleDeleteRole}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabContent: {
    flex: 1,
    gap: SPACING[10],
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolesTopRow: {
    flexDirection: 'row',
    gap: SPACING[8],
    alignItems: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[10],
    paddingVertical: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: SPACING[6],
    paddingHorizontal: SPACING[16],
    paddingBottom: SPACING[4],
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
    marginHorizontal: SPACING[16],
    marginTop: SPACING[12],
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
  },
  roleBannerInfo: {
    flex: 1,
    gap: 2,
  },
  roleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editTitleBtn: {
    padding: 4,
  },
  inlineEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
  },
  inlineEditInput: {
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 14,
    fontWeight: '700',
    minWidth: 120,
  },
  inlineEditIconBtn: {
    padding: 4,
  },
  roleNameText: {
    fontSize: 14,
    fontWeight: '700',
  },
  roleScopeText: {
    fontSize: 11,
  },
  unsavedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.button,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  categoriesContent: {
    padding: SPACING[16],
    gap: SPACING[10],
  },
  toast: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    borderRadius: RADIUS.button,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
