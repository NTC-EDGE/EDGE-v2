import React, { useState, useRef, useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Icon as Lucide,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
  useTheme,
} from '@edge/ui';
import { usePermissionsCatalog, PermissionCategoryGroup, roleService } from '@edge/api';
import type { Role } from '../types';

interface AddRoleModalProps {
  visible: boolean;
  onClose: () => void;
  onAddRole: (newRole: { name: string; initialPermissionIds: string[] }) => void;
  existingRoles: Role[];
  /** @deprecated Not needed anymore — permissions are fetched on-demand */
  rolePermissionsMap?: Record<string, string[]>;
}

export function AddRoleModal({
  visible,
  onClose,
  onAddRole,
  existingRoles,
}: AddRoleModalProps) {
  const { colors, isDark } = useTheme();
  const { categories } = usePermissionsCatalog();

  const [roleName, setRoleName] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [permSearchQuery, setPermSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTemplateId, setActiveTemplateId] = useState<string>('');
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  const filteredCategories = useMemo(() => {
    const q = permSearchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        options: cat.options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(q) ||
            opt.id.toLowerCase().includes(q) ||
            (opt.description !== undefined && opt.description !== null && opt.description.toLowerCase().includes(q)),
        ),
      }))
      .filter((cat) => cat.options.length > 0);
  }, [categories, permSearchQuery]);

  const canvasBg = isDark ? colors.neutral[900] : colors.neutral[50];
  const cardBg = isDark ? colors.neutral[800] : '#FFFFFF';
  const borderColor = isDark ? colors.neutral[700] : colors.neutral[200];
  const textColor = isDark ? colors.neutral[100] : colors.neutral[900];
  const mutedColor = isDark ? colors.neutral[400] : colors.neutral[500];
  const inputBg = isDark ? colors.neutral[900] : '#FFFFFF';
  const inputBorder = isDark ? colors.neutral[600] : colors.neutral[300];
  const accentColor = isDark ? '#60A5FA' : colors.brand[700];
  const accentBg = isDark ? colors.brand[800] : colors.brand[700];

  // ── Mouse Drag-to-Scroll Web Ref & Handlers ─────────────────────────────
  const presetsScrollRef = useRef<ScrollView>(null);
  const isDraggingPresets = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const handleMouseDown = (e: any) => {
    if (Platform.OS !== 'web') return;
    isDraggingPresets.current = true;
    const pageX = e.nativeEvent?.pageX || e.pageX || 0;
    dragStartX.current = pageX;
    const scrollNode = (presetsScrollRef.current as any)?.getScrollableNode
      ? (presetsScrollRef.current as any).getScrollableNode()
      : null;
    if (scrollNode) {
      dragScrollLeft.current = scrollNode.scrollLeft;
    }
  };

  const handleMouseLeaveOrUp = () => {
    isDraggingPresets.current = false;
  };

  const handleMouseMove = (e: any) => {
    if (!isDraggingPresets.current || Platform.OS !== 'web') return;
    const pageX = e.nativeEvent?.pageX || e.pageX || 0;
    const distance = (pageX - dragStartX.current) * 1.5;
    const scrollNode = (presetsScrollRef.current as any)?.getScrollableNode
      ? (presetsScrollRef.current as any).getScrollableNode()
      : null;
    if (scrollNode) {
      scrollNode.scrollLeft = dragScrollLeft.current - distance;
    }
  };

  // ── Fetch permissions for template role from the backend ────────────────────
  const handleApplyTemplate = async (templateRoleId: string) => {
    if (!templateRoleId) {
      setActiveTemplateId('');
      setSelectedPermissionIds([]);
      return;
    }

    setActiveTemplateId(templateRoleId);
    setIsLoadingTemplate(true);

    const [perms, err] = await roleService.getRolePermissions(templateRoleId);

    setIsLoadingTemplate(false);

    if (!err && perms !== null) {
      setSelectedPermissionIds([...perms]);
    }
  };

  const handleTogglePermission = (permId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId],
    );
  };

  const handleToggleCategory = (category: PermissionCategoryGroup) => {
    const categoryPermIds = category.options.map((opt) => opt.id);
    const allSelected = categoryPermIds.every((id) => selectedPermissionIds.includes(id));
    if (allSelected) {
      setSelectedPermissionIds((prev) => prev.filter((id) => !categoryPermIds.includes(id)));
    } else {
      const newSet = new Set([...selectedPermissionIds, ...categoryPermIds]);
      setSelectedPermissionIds(Array.from(newSet));
    }
  };

  const handleSelectAll = () => {
    setSelectedPermissionIds(categories.flatMap((cat) => cat.options.map((opt) => opt.id)));
  };

  const handleClearAll = () => {
    setSelectedPermissionIds([]);
  };

  const handleCreate = () => {
    const trimmedName = roleName.trim();
    if (!trimmedName) {
      setErrorMsg('Role name is required.');
      return;
    }
    onAddRole({ name: trimmedName, initialPermissionIds: selectedPermissionIds });
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setRoleName('');
    setSelectedPermissionIds([]);
    setPermSearchQuery('');
    setErrorMsg('');
    setActiveTemplateId('');
    setIsLoadingTemplate(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: cardBg }, SHADOWS.modal]}>
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <View style={[styles.header, { backgroundColor: canvasBg, borderBottomColor: borderColor }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIcon, { backgroundColor: isDark ? 'rgba(96,165,250,0.15)' : '#DBEAFE' }]}>
                <Lucide name="shield" size={18} color={accentColor} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: textColor }]}>Add New Role</Text>
                <Text style={[styles.headerSub, { color: mutedColor }]}>
                  Name a role and assign initial permissions
                </Text>
              </View>
            </View>
            <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={8}>
              <Lucide name="x" size={18} color={mutedColor} />
            </Pressable>
          </View>

          {/* ── Body ────────────────────────────────────────────────────────── */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Error Banner */}
            {errorMsg !== '' && (
              <View style={[styles.errorBanner, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', borderColor: isDark ? '#F87171' : '#FECACA' }]}>
                <Lucide name="alert-circle" size={14} color="#EF4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Role Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: textColor }]}>
                Role Name <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
                placeholder="e.g. Senior Evaluator"
                placeholderTextColor={mutedColor}
                value={roleName}
                onChangeText={(val) => {
                  setRoleName(val);
                  if (errorMsg) setErrorMsg('');
                }}
              />
            </View>

            {/* Copy from Template */}
            {existingRoles.length > 0 && (
              <View style={styles.fieldGroup}>
                <View style={styles.templateLabelRow}>
                  <Text style={[styles.label, { color: textColor }]}>Copy from Template</Text>
                  {isLoadingTemplate && (
                    <ActivityIndicator size="small" color={accentColor} />
                  )}
                </View>
                <ScrollView
                  ref={presetsScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  {...({
                    onMouseDown: handleMouseDown,
                    onMouseLeave: handleMouseLeaveOrUp,
                    onMouseUp: handleMouseLeaveOrUp,
                    onMouseMove: handleMouseMove,
                  } as any)}
                >
                  <View style={styles.presetsRow}>
                    {/* Clear chip */}
                    <Pressable
                      style={[
                        styles.presetChip,
                        {
                          backgroundColor: activeTemplateId === ''
                            ? accentBg
                            : (isDark ? colors.neutral[700] : colors.neutral[100]),
                          borderColor: activeTemplateId === '' ? accentBg : borderColor,
                        },
                      ]}
                      onPress={() => handleApplyTemplate('')}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          { color: activeTemplateId === '' ? '#FFFFFF' : mutedColor },
                        ]}
                      >
                        Clear
                      </Text>
                    </Pressable>

                    {/* Role template chips */}
                    {existingRoles.map((r) => {
                      const isActive = activeTemplateId === r.id;
                      return (
                        <Pressable
                          key={r.id}
                          style={[
                            styles.presetChip,
                            {
                              backgroundColor: isActive
                                ? accentBg
                                : (isDark ? colors.neutral[700] : colors.neutral[100]),
                              borderColor: isActive ? accentBg : borderColor,
                              opacity: isLoadingTemplate && !isActive ? 0.5 : 1,
                            },
                          ]}
                          onPress={() => handleApplyTemplate(r.id)}
                          disabled={isLoadingTemplate}
                        >
                          {isActive && isLoadingTemplate && (
                            <ActivityIndicator
                              size="small"
                              color="#FFFFFF"
                              style={{ transform: [{ scale: 0.75 }] }}
                            />
                          )}
                          <Text
                            style={[
                              styles.presetChipText,
                              { color: isActive ? '#FFFFFF' : textColor },
                            ]}
                          >
                            Copy {r.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Permissions */}
            <View style={[styles.permSection, { borderTopColor: borderColor }]}>
              <View style={styles.permHeader}>
                <View style={styles.permHeaderLeft}>
                  <Text style={[styles.permTitle, { color: accentColor }]}>PERMISSIONS</Text>
                  <View style={[styles.countPill, { backgroundColor: isDark ? 'rgba(96,165,250,0.15)' : '#DBEAFE' }]}>
                    <Text style={[styles.countPillText, { color: accentColor }]}>
                      {selectedPermissionIds.length} selected
                    </Text>
                  </View>
                </View>
                <View style={styles.permActions}>
                  <Pressable onPress={handleSelectAll}>
                    <Text style={[styles.permActionText, { color: accentColor }]}>Select All</Text>
                  </Pressable>
                  <Text style={[styles.permActionDivider, { color: mutedColor }]}>·</Text>
                  <Pressable onPress={handleClearAll}>
                    <Text style={[styles.permActionText, { color: mutedColor }]}>Clear</Text>
                  </Pressable>
                </View>
              </View>

              {/* Permissions Search */}
              <View style={[styles.permSearchRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                <Lucide name="search" size={14} color={mutedColor} />
                <TextInput
                  style={[styles.permSearchInput, { color: textColor }]}
                  placeholder="Search permissions..."
                  placeholderTextColor={mutedColor}
                  value={permSearchQuery}
                  onChangeText={setPermSearchQuery}
                />
                {permSearchQuery.length > 0 && (
                  <Pressable onPress={() => setPermSearchQuery('')} hitSlop={8}>
                    <Lucide name="x" size={13} color={mutedColor} />
                  </Pressable>
                )}
              </View>

              {filteredCategories.length === 0 ? (
                <View style={styles.emptyPerms}>
                  <Text style={[styles.emptyPermsText, { color: mutedColor }]}>
                    No permissions match "{permSearchQuery}"
                  </Text>
                </View>
              ) : (
                <View style={styles.categoriesGrid}>
                  {filteredCategories.map((category) => {
                  const catIds = category.options.map((opt) => opt.id);
                  const allSel = catIds.every((id) => selectedPermissionIds.includes(id));
                  return (
                    <View
                      key={category.id}
                      style={[styles.categoryCard, { backgroundColor: canvasBg, borderColor }]}
                    >
                      <View style={[styles.categoryHeader, { borderBottomColor: borderColor }]}>
                        <Text style={[styles.categoryTitle, { color: textColor }]}>
                          {category.title}
                        </Text>
                        <Pressable onPress={() => handleToggleCategory(category)}>
                          <Text style={[styles.categoryToggle, { color: accentColor }]}>
                            {allSel ? 'Deselect All' : 'Select All'}
                          </Text>
                        </Pressable>
                      </View>
                      <View style={styles.optionsList}>
                        {category.options.map((opt) => {
                          const isChecked = selectedPermissionIds.includes(opt.id);
                          return (
                            <Pressable
                              key={opt.id}
                              style={styles.optionRow}
                              onPress={() => handleTogglePermission(opt.id)}
                            >
                              <View
                                style={[
                                  styles.checkbox,
                                  {
                                    backgroundColor: isChecked ? accentBg : inputBg,
                                    borderColor: isChecked ? accentBg : inputBorder,
                                  },
                                ]}
                              >
                                {isChecked && <Lucide name="check" size={12} color="#FFFFFF" />}
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text
                                  style={[
                                    styles.optionLabel,
                                    {
                                      color: isChecked ? textColor : mutedColor,
                                      fontWeight: isChecked ? '600' : '400',
                                    },
                                  ]}
                                >
                                  {opt.label}
                                </Text>
                                {opt.description && (
                                  <Text style={[styles.optionDescription, { color: mutedColor }]}>
                                    {opt.description}
                                  </Text>
                                )}
                              </View>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
            </View>
          </ScrollView>

          {/* ── Footer ──────────────────────────────────────────────────────── */}
          <View style={[styles.footer, { backgroundColor: canvasBg, borderTopColor: borderColor }]}>
            <Pressable style={[styles.cancelBtn, { borderColor }]} onPress={handleClose}>
              <Text style={[styles.cancelBtnText, { color: textColor }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.createBtn, { backgroundColor: accentBg }]}
              onPress={handleCreate}
            >
              <Lucide name="plus" size={15} color="#FFFFFF" />
              <Text style={styles.createBtnText}>Create Role</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[16],
  },
  sheet: {
    width: '100%',
    maxWidth: 860,
    maxHeight: '92%',
    borderRadius: RADIUS.dialog,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: SPACING[4],
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: SPACING[24],
    gap: SPACING[16],
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    padding: SPACING[12],
    borderRadius: RADIUS.input,
    borderWidth: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
  },
  fieldGroup: {
    gap: SPACING[6],
  },
  templateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[12],
    paddingVertical: 10,
    fontSize: 14,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: SPACING[8],
    paddingVertical: 4,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    height: 32,
    paddingHorizontal: SPACING[12],
    borderRadius: 16,
    borderWidth: 1,
    gap: SPACING[6],
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  permSection: {
    borderTopWidth: 1,
    paddingTop: SPACING[16],
    gap: SPACING[12],
  },
  permHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  permTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  countPill: {
    paddingHorizontal: SPACING[8],
    paddingVertical: 2,
    borderRadius: 10,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  permActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
  },
  permActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  permActionDivider: {
    fontSize: 14,
  },
  permSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[10],
    paddingVertical: 8,
    marginBottom: SPACING[12],
  },
  permSearchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  emptyPerms: {
    paddingVertical: SPACING[24],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPermsText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  categoryCard: {
    width: '48%',
    minWidth: 240,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryToggle: {
    fontSize: 11,
    fontWeight: '600',
  },
  optionsList: {
    padding: SPACING[8],
    gap: SPACING[4],
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    paddingVertical: 5,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 13,
  },
  optionDescription: {
    fontSize: 11,
    marginTop: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING[12],
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
    paddingHorizontal: SPACING[20],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
