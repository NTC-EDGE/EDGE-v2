import React, { useRef, useEffect, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Icon as Lucide, RADIUS, SPACING, TYPOGRAPHY, useTheme } from '@edge/ui';
import { useRoleManagement } from '../hooks/useRoleManagement';
import { RoleListItem } from '../components/RoleListItem';
import { PermissionCategoryCard } from '../components/PermissionCategoryCard';
import { AddRoleModal } from '../components/AddRoleModal';
import { DeleteRoleConfirmModal } from '../components/DeleteRoleConfirmModal';
import type { Role } from '../types';

// ── Fade animation on role switch ───────────────────────────────────────────
function useFadeOnChange(value: unknown) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value;
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }).start();
    }
  }, [value, fadeAnim]);

  return fadeAnim;
}

export function RolesPermissionScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Master-detail state for small screens (no tabs, back button navigation)
  const [mobileView, setMobileView] = useState<'list' | 'permissions'>('list');

  const management = useRoleManagement();

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
    isCurrentRoleReadOnly,
    isSuperAdmin,
    canCreateRole,
    canUpdateRole,
    canDeleteRole,
    canAssignPermissions,
    handleTogglePermission,
    handleToggleSelectAll,
    resetChanges,
    savePermissions,
    createRole,
    updateRole,
    deleteRole,
  } = management;

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

  // Theme tokens
  const canvasBg = isDark ? colors.neutral[900] : colors.neutral[50];
  const panelBg = isDark ? colors.neutral[800] : '#FFFFFF';
  const borderColor = isDark ? colors.neutral[700] : colors.neutral[200];
  const textColor = isDark ? colors.neutral[100] : colors.neutral[900];
  const mutedColor = isDark ? colors.neutral[400] : colors.neutral[500];
  const accentColor = isDark ? '#60A5FA' : colors.brand[700];
  const accentBg = isDark ? colors.brand[800] : colors.brand[700];
  const inputBg = isDark ? colors.neutral[800] : '#FFFFFF';
  const inputBorder = isDark ? colors.neutral[600] : colors.neutral[300];

  // Right panel fade animation
  const rightFade = useFadeOnChange(selectedRole?.id);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleSave = async () => {
    const res = await savePermissions();
    if (res.ok && selectedRole) {
      showToast(`Permissions saved for "${selectedRole.name}"`);
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

  // Scope filter counts
  const systemCount = allRoles.filter((r) => r.isSystemRole).length;
  const customCount = allRoles.filter((r) => !r.isSystemRole).length;

  return (
    <View style={[styles.root, { backgroundColor: canvasBg }]}>

      {/* ──────────────────────────────────────────────────────────────────────
          MOBILE / SMALL SCREEN LAYOUT (width < 768) — Master Detail with Back Btn
         ────────────────────────────────────────────────────────────────────── */}
      {isMobile ? (
        <View style={styles.mobileContainer}>
          {/* VIEW 1: Roles List (Mobile) */}
          {mobileView === 'list' && (
            <View style={styles.mobileTabContent}>
              {/* Header + Add */}
              <View style={[styles.leftHeader, { borderBottomColor: borderColor }]}>
                <View style={styles.leftHeaderTop}>
                  <Text style={[styles.leftTitle, { color: textColor }]}>Roles Directory</Text>
                  {canCreateRole && (
                    <Pressable
                      style={[styles.addBtn, { backgroundColor: accentBg }]}
                      onPress={() => setIsAddModalOpen(true)}
                    >
                      <Lucide name="plus" size={14} color="#FFFFFF" />
                      <Text style={styles.addBtnText}>Add</Text>
                    </Pressable>
                  )}
                </View>

                {/* Search */}
                <View style={[styles.searchRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                  <Lucide name="search" size={14} color={mutedColor} />
                  <TextInput
                    style={[styles.searchInput, { color: textColor }]}
                    placeholder="Search roles..."
                    placeholderTextColor={mutedColor}
                    value={roleSearchQuery}
                    onChangeText={setRoleSearchQuery}
                  />
                  {roleSearchQuery.length > 0 && (
                    <Pressable onPress={() => setRoleSearchQuery('')} hitSlop={8}>
                      <Lucide name="x" size={13} color={mutedColor} />
                    </Pressable>
                  )}
                </View>

              </View>

              {/* Roles List */}
              <ScrollView style={styles.roleList} showsVerticalScrollIndicator={false}>
                {roles.map((role) => (
                  <RoleListItem
                    key={role.id}
                    role={role}
                    isSelected={selectedRole?.id === role.id}
                    onPress={() => {
                      setSelectedRoleId(role.id);
                      setMobileView('permissions');
                    }}
                    onDeletePress={canDeleteRole && !role.isSystemRole ? () => setRoleToDelete(role) : undefined}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* VIEW 2: Permission Matrix with BACK BUTTON (Mobile) */}
          {mobileView === 'permissions' && selectedRole !== null && (
            <View style={styles.mobileTabContent}>
              {/* Sticky Right Header with BACK BUTTON replacing Circled Initial */}
              <View style={[styles.rightHeader, { backgroundColor: panelBg, borderBottomColor: borderColor }]}>
                <View style={styles.rightHeaderLeft}>
                  {/* BACK BUTTON replacing circled initial */}
                  <Pressable
                    style={[styles.backBtn, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}
                    onPress={() => setMobileView('list')}
                    accessibilityLabel="Back to roles list"
                  >
                    <Lucide name="arrow-left" size={18} color={textColor} />
                  </Pressable>

                  <View>
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
                        <Text style={[styles.roleTitleText, { color: textColor }]}>
                          {selectedRole.name}
                        </Text>
                        {hasUnsavedChanges && <View style={styles.unsavedDot} />}
                        {!selectedRole.isSystemRole && canUpdateRole && (
                          <Pressable onPress={startEditingRoleName} style={styles.editTitleBtn} hitSlop={6} accessibilityLabel="Rename role">
                            <Lucide name="edit-2" size={13} color={mutedColor} />
                          </Pressable>
                        )}
                      </View>
                    )}
                    <Text style={[styles.roleScopeBadgeText, { color: mutedColor }]}>
                      {selectedRole.isSystemRole ? 'STANDARD ROLE' : 'CUSTOM ROLE'}
                    </Text>
                  </View>
                </View>

                {isCurrentRoleReadOnly ? (
                  <View style={[styles.readOnlyIndicator, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}>
                    <Lucide name="lock" size={13} color={mutedColor} />
                    <Text style={[styles.readOnlyIndicatorText, { color: mutedColor }]}>Read-Only</Text>
                  </View>
                ) : (
                  <Pressable
                    style={[
                      styles.saveBtn,
                      {
                        backgroundColor: hasUnsavedChanges && !isSubmitting ? accentBg : (isDark ? colors.neutral[700] : colors.neutral[200]),
                        opacity: !hasUnsavedChanges || isSubmitting ? 0.55 : 1,
                      },
                    ]}
                    onPress={handleSave}
                    disabled={!hasUnsavedChanges || isSubmitting}
                  >
                    <Lucide name="save" size={14} color="#FFFFFF" />
                    <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save'}</Text>
                  </Pressable>
                )}
              </View>

              {/* Body */}
              <ScrollView style={styles.rightBody} contentContainerStyle={styles.rightBodyContent} showsVerticalScrollIndicator={false}>
                {isCurrentRoleReadOnly && (
                  <View style={[styles.readOnlyBanner, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7', borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A' }]}>
                    <Lucide name="lock" size={14} color={isDark ? '#FBBF24' : '#B45309'} />
                    <Text style={[styles.readOnlyBannerText, { color: isDark ? '#FCD34D' : '#92400E' }]}>
                      Standard role: Permissions are read-only. Tenant administrators cannot modify standard system roles.
                    </Text>
                  </View>
                )}

                {/* Search */}
                <View style={[styles.permSearchRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                  <Lucide name="search" size={14} color={mutedColor} />
                  <TextInput
                    style={[styles.permSearchInput, { color: textColor }]}
                    placeholder="Search permissions..."
                    placeholderTextColor={mutedColor}
                    value={permissionQuery}
                    onChangeText={setPermissionQuery}
                  />
                  {permissionQuery.length > 0 && (
                    <Pressable onPress={() => setPermissionQuery('')} hitSlop={8}>
                      <Lucide name="x" size={13} color={mutedColor} />
                    </Pressable>
                  )}
                </View>

                {/* Categories */}
                {categories.map((cat) => (
                  <PermissionCategoryCard
                    key={cat.id}
                    category={cat}
                    activePermissionIds={activePermissions}
                    onTogglePermission={handleTogglePermission}
                    readOnly={isCurrentRoleReadOnly}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      ) : (
        /* ──────────────────────────────────────────────────────────────────────
            DESKTOP / WIDE SCREEN TWO-PANEL WORKSTATION (width >= 768)
           ────────────────────────────────────────────────────────────────────── */
        <>
          {/* LEFT PANEL — Role List */}
          <View style={[styles.leftPanel, { backgroundColor: panelBg, borderRightColor: borderColor }]}>
            <View style={[styles.leftHeader, { borderBottomColor: borderColor }]}>
              <View style={styles.leftHeaderTop}>
                <Text style={[styles.leftTitle, { color: textColor }]}>Roles</Text>
                {canCreateRole && (
                  <Pressable
                    style={[styles.addBtn, { backgroundColor: accentBg }]}
                    onPress={() => setIsAddModalOpen(true)}
                    accessibilityLabel="Add new role"
                  >
                    <Lucide name="plus" size={14} color="#FFFFFF" />
                    <Text style={styles.addBtnText}>Add</Text>
                  </Pressable>
                )}
              </View>

              {/* Search */}
              <View style={[styles.searchRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                <Lucide name="search" size={14} color={mutedColor} />
                <TextInput
                  style={[styles.searchInput, { color: textColor }]}
                  placeholder="Search roles..."
                  placeholderTextColor={mutedColor}
                  value={roleSearchQuery}
                  onChangeText={setRoleSearchQuery}
                />
                {roleSearchQuery.length > 0 && (
                  <Pressable onPress={() => setRoleSearchQuery('')} hitSlop={8}>
                    <Lucide name="x" size={13} color={mutedColor} />
                  </Pressable>
                )}
              </View>

              </View>

            {/* Role Item List */}
            <ScrollView style={styles.roleList} showsVerticalScrollIndicator={false}>
              {isLoading ? (
                <View style={styles.loadingState}>
                  <Text style={[styles.loadingText, { color: mutedColor }]}>Loading roles...</Text>
                </View>
              ) : roles.length === 0 ? (
                <View style={styles.emptyState}>
                  <Lucide name="shield-off" size={28} color={mutedColor} />
                  <Text style={[styles.emptyText, { color: mutedColor }]}>No roles found</Text>
                </View>
              ) : (
                roles.map((role) => (
                  <RoleListItem
                    key={role.id}
                    role={role}
                    isSelected={selectedRole?.id === role.id}
                    onPress={() => setSelectedRoleId(role.id)}
                    onDeletePress={canDeleteRole && !role.isSystemRole ? () => setRoleToDelete(role) : undefined}
                  />
                ))
              )}
            </ScrollView>
          </View>

          {/* RIGHT PANEL — Permission Matrix */}
          <Animated.View style={[styles.rightPanel, { opacity: rightFade }]}>
            {selectedRole === null ? (
              <View style={styles.emptyRight}>
                <Lucide name="shield" size={40} color={mutedColor} />
                <Text style={[styles.emptyRightText, { color: mutedColor }]}>
                  Select a role to configure permissions
                </Text>
              </View>
            ) : (
              <>
                {/* Sticky Right Header */}
                <View
                  style={[
                    styles.rightHeader,
                    {
                      backgroundColor: panelBg,
                      borderBottomColor: borderColor,
                    },
                  ]}
                >
                  <View style={styles.rightHeaderLeft}>
                    <View>
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
                          <Text style={[styles.roleTitleText, { color: textColor }]}>
                            {selectedRole.name}
                          </Text>
                          {hasUnsavedChanges && (
                            <View style={styles.unsavedDot} />
                          )}
                          {!selectedRole.isSystemRole && canUpdateRole && (
                            <Pressable onPress={startEditingRoleName} style={styles.editTitleBtn} hitSlop={6} accessibilityLabel="Rename role">
                              <Lucide name="edit-2" size={13} color={mutedColor} />
                            </Pressable>
                          )}
                        </View>
                      )}
                      <View
                        style={[
                          styles.roleScopeBadge,
                          {
                            backgroundColor: selectedRole.isSystemRole
                              ? (isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7')
                              : (isDark ? 'rgba(96,165,250,0.12)' : '#EFF6FF'),
                          },
                        ]}
                      >
                        <Lucide
                          name={selectedRole.isSystemRole ? 'lock' : 'settings'}
                          size={9}
                          color={selectedRole.isSystemRole
                            ? (isDark ? '#FBBF24' : '#B45309')
                            : accentColor}
                        />
                        <Text
                          style={[
                            styles.roleScopeBadgeText,
                            {
                              color: selectedRole.isSystemRole
                                ? (isDark ? '#FBBF24' : '#B45309')
                                : accentColor,
                            },
                          ]}
                        >
                          {selectedRole.isSystemRole ? 'STANDARD' : 'CUSTOM'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.rightHeaderActions}>
                    {hasUnsavedChanges && !isCurrentRoleReadOnly && (
                      <Pressable onPress={resetChanges} style={styles.discardBtn}>
                        <Text style={[styles.discardBtnText, { color: mutedColor }]}>
                          Discard
                        </Text>
                      </Pressable>
                    )}
                    {isCurrentRoleReadOnly ? (
                      <View style={[styles.readOnlyIndicator, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}>
                        <Lucide name="lock" size={13} color={mutedColor} />
                        <Text style={[styles.readOnlyIndicatorText, { color: mutedColor }]}>Read-Only</Text>
                      </View>
                    ) : (
                      <Pressable
                        style={[
                          styles.saveBtn,
                          {
                            backgroundColor: hasUnsavedChanges && !isSubmitting ? accentBg : (isDark ? colors.neutral[700] : colors.neutral[200]),
                            opacity: !hasUnsavedChanges || isSubmitting ? 0.55 : 1,
                          },
                        ]}
                        onPress={handleSave}
                        disabled={!hasUnsavedChanges || isSubmitting}
                      >
                        <Lucide name="save" size={14} color="#FFFFFF" />
                        <Text style={styles.saveBtnText}>
                          {isSubmitting ? 'Saving…' : 'Save Changes'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Right Body */}
                <ScrollView
                  style={[styles.rightBody, { backgroundColor: canvasBg }]}
                  contentContainerStyle={styles.rightBodyContent}
                  showsVerticalScrollIndicator={false}
                >
                  {isCurrentRoleReadOnly && (
                    <View style={[styles.readOnlyBanner, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7', borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A' }]}>
                      <Lucide name="lock" size={14} color={isDark ? '#FBBF24' : '#B45309'} />
                      <Text style={[styles.readOnlyBannerText, { color: isDark ? '#FCD34D' : '#92400E' }]}>
                        Standard system role: Permissions are read-only to preserve consistency across all tenants. To customize permissions for this role, click Add to create a custom role.
                      </Text>
                    </View>
                  )}

                  <View style={styles.matrixToolbar}>
                    <View style={[styles.permSearchRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                      <Lucide name="search" size={14} color={mutedColor} />
                      <TextInput
                        style={[styles.permSearchInput, { color: textColor }]}
                        placeholder="Search permissions..."
                        placeholderTextColor={mutedColor}
                        value={permissionQuery}
                        onChangeText={setPermissionQuery}
                      />
                      {permissionQuery.length > 0 && (
                        <Pressable onPress={() => setPermissionQuery('')} hitSlop={8}>
                          <Lucide name="x" size={13} color={mutedColor} />
                        </Pressable>
                      )}
                    </View>

                    {!isCurrentRoleReadOnly && (
                      <Pressable
                        style={[styles.selectAllBtn, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}
                        onPress={handleToggleSelectAll}
                      >
                        <Lucide
                          name={isAllSelected ? 'x-circle' : 'check-circle'}
                          size={13}
                          color={mutedColor}
                        />
                        <Text style={[styles.selectAllText, { color: mutedColor }]}>
                          {isAllSelected ? 'Deselect All' : 'Select All'}
                        </Text>
                      </Pressable>
                    )}
                  </View>

                  {categories.length === 0 ? (
                    <View style={styles.emptyPerms}>
                      <Text style={[styles.emptyText, { color: mutedColor }]}>
                        No permissions match your search.
                      </Text>
                    </View>
                  ) : (
                    categories.map((cat) => (
                      <PermissionCategoryCard
                        key={cat.id}
                        category={cat}
                        activePermissionIds={activePermissions}
                        onTogglePermission={handleTogglePermission}
                        readOnly={isCurrentRoleReadOnly}
                      />
                    ))
                  )}
                </ScrollView>
              </>
            )}
          </Animated.View>
        </>
      )}

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toastMsg !== null && (
        <View style={[styles.toast, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[900] }]}>
          <Lucide name="check-circle" size={15} color="#10B981" />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
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

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },

  // ── Mobile adaptive container ─────────────────────────────────────────────
  mobileContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  mobileTabContent: {
    flex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Left Panel ─────────────────────────────────────────────────────────────
  leftPanel: {
    width: 300,
    borderRightWidth: 1,
    flexDirection: 'column',
  },
  leftHeader: {
    borderBottomWidth: 1,
    paddingHorizontal: SPACING[16],
    paddingTop: SPACING[16],
    paddingBottom: SPACING[12],
    gap: SPACING[10],
  },
  leftHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.button,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[10],
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: SPACING[6],
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  roleList: {
    flex: 1,
  },
  loadingState: {
    padding: SPACING[24],
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
  },
  emptyState: {
    padding: SPACING[32],
    alignItems: 'center',
    gap: SPACING[8],
  },
  emptyText: {
    fontSize: 13,
  },

  // ── Right Panel ────────────────────────────────────────────────────────────
  rightPanel: {
    flex: 1,
    flexDirection: 'column',
  },
  emptyRight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[12],
  },
  emptyRightText: {
    fontSize: 14,
  },

  // Right Header (sticky)
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[12],
    borderBottomWidth: 1,
  },
  rightHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  roleAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleAvatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
  roleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
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
    minWidth: 140,
  },
  inlineEditIconBtn: {
    padding: 4,
  },
  roleTitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  unsavedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  roleScopeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  roleScopeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rightHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
  },
  discardBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  discardBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.button,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Right Body
  rightBody: {
    flex: 1,
  },
  rightBodyContent: {
    padding: SPACING[20],
    gap: SPACING[12],
  },
  matrixToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
  },
  permSearchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[10],
    paddingVertical: 8,
  },
  permSearchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.button,
    flexShrink: 0,
  },
  selectAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyPerms: {
    paddingVertical: SPACING[32],
    alignItems: 'center',
  },
  readOnlyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    marginBottom: SPACING[12],
  },
  readOnlyBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  readOnlyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.button,
  },
  readOnlyIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 24,
    right: 24,
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
