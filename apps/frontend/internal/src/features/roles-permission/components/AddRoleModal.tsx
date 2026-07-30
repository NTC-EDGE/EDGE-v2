import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Modal, ScrollView, useWindowDimensions } from 'react-native';
import { useTheme, COLORS, SPACING, RADIUS, SHADOWS, Icon as Lucide } from '@edge/ui';
import { usePermissionsCatalog, PermissionCategoryGroup } from '@edge/api';
import { Role } from '../data/mockRolesPermissions';

interface AddRoleModalProps {
  visible: boolean;
  onClose: () => void;
  onAddRole: (newRole: {
    name: string;
    initialPermissionIds: string[];
  }) => void;
  existingRoles: Role[];
  rolePermissionsMap: Record<string, string[]>;
}

export function AddRoleModal({
  visible,
  onClose,
  onAddRole,
  existingRoles,
  rolePermissionsMap,
}: AddRoleModalProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { categories } = usePermissionsCatalog();

  const [roleName, setRoleName] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Preset Template loader
  const handleApplyTemplate = (templateRoleId: string) => {
    if (!templateRoleId) {
      setSelectedPermissionIds([]);
      return;
    }
    const perms = rolePermissionsMap[templateRoleId];
    if (perms !== undefined) {
      setSelectedPermissionIds([...perms]);
    }
  };

  // Toggle single permission checkbox
  const handleTogglePermission = (permId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  // Toggle all permissions in a category
  const handleToggleCategory = (category: PermissionCategoryGroup) => {
    const categoryPermIds = category.options.map((opt) => opt.id);
    const allSelected = categoryPermIds.every((id) => selectedPermissionIds.includes(id));

    if (allSelected) {
      // Remove all from this category
      setSelectedPermissionIds((prev) => prev.filter((id) => !categoryPermIds.includes(id)));
    } else {
      // Add all missing from this category
      const newSet = new Set([...selectedPermissionIds, ...categoryPermIds]);
      setSelectedPermissionIds(Array.from(newSet));
    }
  };

  // Global Select All / Clear All
  const handleSelectAllGlobal = () => {
    const allIds = categories.flatMap((cat) => cat.options.map((opt) => opt.id));
    setSelectedPermissionIds(allIds);
  };

  const handleClearAllGlobal = () => {
    setSelectedPermissionIds([]);
  };

  const handleCreate = () => {
    const trimmedName = roleName.trim();
    if (!trimmedName) {
      setErrorMsg('Role name is required.');
      return;
    }

    onAddRole({
      name: trimmedName,
      initialPermissionIds: selectedPermissionIds,
    });

    handleReset();
    onClose();
  };

  const handleReset = () => {
    setRoleName('');
    setSelectedPermissionIds([]);
    setErrorMsg('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.cardBg }, SHADOWS.modal]}>
          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: isDark ? colors.cardBg : colors.bg, borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <View style={[styles.headerBadge, { backgroundColor: isDark ? colors.cardBg : COLORS.brand.blueLight }]}>
                <Lucide name="shield" size={20} color={colors.brand.primary} />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Role</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Define role details and assign initial module permissions.
                </Text>
              </View>
            </View>
            <Pressable style={styles.closeBtn} onPress={handleClose} accessibilityLabel="Close modal">
              <Lucide name="x" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView
            style={styles.modalBodyScroll}
            contentContainerStyle={styles.modalBodyContent}
            showsVerticalScrollIndicator={false}
          >
            {errorMsg !== '' && (
              <View style={styles.errorContainer}>
                <Lucide name="alert-circle" size={16} color={COLORS.semantic.error} style={styles.errorIcon} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Form Fields Section */}
            <View style={styles.formSection}>
              <View style={styles.formRow}>
                <View style={styles.formGroupFlex}>
                  <Text style={styles.label}>
                    Role Name <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Senior Evaluator"
                    value={roleName}
                    onChangeText={(val) => {
                      setRoleName(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholderTextColor={COLORS.neutral[400]}
                  />
                </View>

                <View style={styles.formGroupFlex}>
                  <Text style={styles.label}>Template Presets</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
                    <Pressable
                      style={[styles.presetChip, selectedPermissionIds.length === 0 && styles.presetChipActive]}
                      onPress={() => handleApplyTemplate('')}
                    >
                      <Text style={[styles.presetChipText, selectedPermissionIds.length === 0 && styles.presetChipTextActive]}>
                        Clear
                      </Text>
                    </Pressable>
                    {existingRoles.map((r) => (
                      <Pressable
                        key={r.id}
                        style={styles.presetChip}
                        onPress={() => handleApplyTemplate(r.id)}
                      >
                        <Text style={styles.presetChipText}>Copy {r.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Permission Checkbox Grid Section */}
            <View style={styles.permissionsSection}>
              <View style={styles.permSectionHeader}>
                <View style={styles.permTitleRow}>
                  <Text style={styles.permSectionTitle}>MODULE PERMISSIONS</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{selectedPermissionIds.length} Selected</Text>
                  </View>
                </View>

                <View style={styles.globalActionsRow}>
                  <Pressable style={styles.actionLinkBtn} onPress={handleSelectAllGlobal}>
                    <Text style={styles.actionLinkText}>Select All</Text>
                  </Pressable>
                  <Text style={styles.actionDivider}>•</Text>
                  <Pressable style={styles.actionLinkBtn} onPress={handleClearAllGlobal}>
                    <Text style={styles.actionLinkText}>Clear All</Text>
                  </Pressable>
                </View>
              </View>

              {/* Categories Grid */}
              <View style={[styles.categoriesGrid, isMobile && styles.categoriesGridMobile]}>
                {categories.map((category) => {
                  const categoryPermIds = category.options.map((opt) => opt.id);
                  const isCategoryAllSelected = categoryPermIds.every((id) =>
                    selectedPermissionIds.includes(id)
                  );

                  return (
                    <View key={category.id} style={[styles.categoryCard, { backgroundColor: isDark ? colors.cardBg : colors.bg, borderColor: colors.border }]}>
                      <View style={[styles.categoryHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.categoryTitle, { color: colors.text }]}>{category.title}</Text>
                        <Pressable
                          style={styles.categoryToggleBtn}
                          onPress={() => handleToggleCategory(category)}
                        >
                          <Text style={[styles.categoryToggleText, { color: colors.brand.primary }]}>
                            {isCategoryAllSelected ? 'Deselect All' : 'Select All'}
                          </Text>
                        </Pressable>
                      </View>

                      <View style={styles.optionsGrid}>
                        {category.options.map((option) => {
                          const isChecked = selectedPermissionIds.includes(option.id);
                          return (
                            <Pressable
                              key={option.id}
                              style={styles.optionCheckboxRow}
                              onPress={() => handleTogglePermission(option.id)}
                            >
                              <View
                                style={[
                                  styles.checkbox,
                                  isChecked ? styles.checkboxChecked : [styles.checkboxUnchecked, { backgroundColor: colors.cardBg, borderColor: colors.border }],
                                ]}
                              >
                                {isChecked && (
                                  <Lucide name="check" size={14} color={COLORS.neutral.white} />
                                )}
                              </View>
                              <Text
                                style={[
                                  styles.optionLabel,
                                  isChecked ? [styles.optionLabelChecked, { color: colors.text }] : [styles.optionLabelUnchecked, { color: colors.textMuted }],
                                ]}
                              >
                                {option.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.modalFooter, { backgroundColor: isDark ? colors.cardBg : colors.bg, borderTopColor: colors.border }]}>
            <Pressable style={[styles.cancelBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]} onPress={handleClose}>
              <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.submitBtn, { backgroundColor: colors.brand.primary }]} onPress={handleCreate}>
              <Lucide name="plus" size={16} color={COLORS.neutral.white} style={styles.submitIcon} />
              <Text style={styles.submitBtnText}>Create Role</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[16],
  },
  modalCard: {
    width: '100%',
    maxWidth: 880,
    maxHeight: '90%',
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.dialog,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.brand.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[12],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.neutral[900],
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  closeBtn: {
    padding: SPACING[4],
  },
  modalBodyScroll: {
    flex: 1,
  },
  modalBodyContent: {
    padding: SPACING[24],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.semantic.errorBg,
    borderColor: COLORS.semantic.errorBorder,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    padding: SPACING[12],
    marginBottom: SPACING[16],
  },
  errorIcon: {
    marginRight: SPACING[8],
  },
  errorText: {
    color: COLORS.semantic.error,
    fontSize: 13,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: SPACING[16],
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING[16],
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  formGroupFlex: {
    flex: 1,
    minWidth: 260,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral[700],
    marginBottom: 6,
  },
  requiredStar: {
    color: COLORS.semantic.error,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[12],
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.neutral[900],
    backgroundColor: COLORS.neutral.white,
  },
  presetsRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  presetChip: {
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
    borderRadius: RADIUS.circle,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    marginRight: SPACING[8],
  },
  presetChipActive: {
    backgroundColor: COLORS.brand.dark,
    borderColor: COLORS.brand.dark,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.neutral[700],
  },
  presetChipTextActive: {
    color: COLORS.neutral.white,
  },
  permissionsSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    paddingTop: SPACING[16],
  },
  permSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[16],
  },
  permTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.brand[700],
    letterSpacing: 1.1,
    marginRight: SPACING[8],
  },
  countBadge: {
    backgroundColor: COLORS.brand.blueLight,
    paddingHorizontal: SPACING[8],
    paddingVertical: 2,
    borderRadius: RADIUS.circle,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.brand[900],
  },
  globalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLinkBtn: {
    paddingVertical: 2,
  },
  actionLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.brand[700],
  },
  actionDivider: {
    marginHorizontal: SPACING[8],
    color: COLORS.neutral[400],
    fontSize: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  categoriesGridMobile: {
    flexDirection: 'column',
  },
  categoryCard: {
    width: '49%',
    minWidth: 260,
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[12],
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[8],
    paddingBottom: SPACING[4],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  categoryToggleBtn: {
    paddingVertical: 2,
  },
  categoryToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.brand[600],
  },
  optionsGrid: {
    flexDirection: 'column',
    gap: SPACING[8],
  },
  optionCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[8],
  },
  checkboxChecked: {
    backgroundColor: COLORS.brand.dark,
    borderColor: COLORS.brand.dark,
    borderWidth: 1,
  },
  checkboxUnchecked: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[400],
    borderWidth: 1.5,
  },
  optionLabel: {
    fontSize: 13,
  },
  optionLabelChecked: {
    fontWeight: '600',
    color: COLORS.neutral[900],
  },
  optionLabelUnchecked: {
    fontWeight: '400',
    color: COLORS.neutral[600],
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
    gap: SPACING[12],
  },
  cancelBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[20],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand[700],
  },
  submitIcon: {
    marginRight: 6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },
});
