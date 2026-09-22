import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, Icon as Lucide, useTheme } from '@edge/ui';

interface EmployeesHeaderProps {
  isMobile: boolean;
  viewMode: 'cards' | 'table';
  onSetViewMode: (mode: 'cards' | 'table') => void;
  onOpenAddModal: () => void;
}

export function EmployeesHeader({
  isMobile,
  viewMode,
  onSetViewMode,
  onOpenAddModal,
}: EmployeesHeaderProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.headerSection}>
      {/* Breadcrumb Navigation: ADMIN -> DASHBOARD -> EMPLOYEE ACCOUNTS */}
      <View style={styles.breadcrumb}>
        <Text style={[styles.breadcrumbText, { color: colors.textMuted }]}>Admin</Text>
        <Lucide name="chevron-right" size={12} color={colors.textMuted} style={styles.breadcrumbDivider} />
        <Text style={[styles.breadcrumbText, { color: colors.textMuted }]}>Dashboard</Text>
        <Lucide name="chevron-right" size={12} color={colors.textMuted} style={styles.breadcrumbDivider} />
        <Text style={[styles.breadcrumbText, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>
          Employee Accounts
        </Text>
      </View>

      {/* Header Title & Actions Banner */}
      <View style={[styles.headerBanner, isMobile && styles.headerBannerMobile]}>
        <View style={styles.headerTitleArea}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Employee Accounts</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Manage staff roles, evaluator assignments, and system administrative access.
          </Text>
        </View>

        <View style={[styles.headerActions, isMobile && styles.headerActionsMobile]}>
          {/* View Mode Toggle */}
          <View
            style={[
              styles.viewToggleGroup,
              { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: colors.border },
            ]}
          >
            <Pressable
              style={[
                styles.toggleBtn,
                viewMode === 'cards' && [
                  styles.toggleBtnActive,
                  { backgroundColor: isDark ? colors.neutral[700] : colors.cardBg },
                ],
              ]}
              onPress={() => onSetViewMode('cards')}
            >
              <Lucide
                name="grid"
                size={16}
                color={viewMode === 'cards' ? (isDark ? colors.brand[400] : colors.brand[800]) : colors.textMuted}
              />
            </Pressable>
            <Pressable
              style={[
                styles.toggleBtn,
                viewMode === 'table' && [
                  styles.toggleBtnActive,
                  { backgroundColor: isDark ? colors.neutral[700] : colors.cardBg },
                ],
              ]}
              onPress={() => onSetViewMode('table')}
            >
              <Lucide
                name="list"
                size={16}
                color={viewMode === 'table' ? (isDark ? colors.brand[400] : colors.brand[800]) : colors.textMuted}
              />
            </Pressable>
          </View>

          {/* Add Employee Button */}
          <Pressable style={styles.addEmployeeBtn} onPress={onOpenAddModal}>
            <Lucide name="plus" size={18} color={COLORS.neutral.white} style={{ marginRight: 6 }} />
            <Text style={styles.addEmployeeBtnText}>Add Employee</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    width: '100%',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[12],
  },
  breadcrumbText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breadcrumbDivider: {
    marginHorizontal: 8,
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[20],
    flexWrap: 'wrap',
    gap: SPACING[16],
  },
  headerBannerMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerTitleArea: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    color: COLORS.neutral[500],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  headerActionsMobile: {
    width: '100%',
    justifyContent: 'space-between',
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    borderRadius: RADIUS.button,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  toggleBtn: {
    width: 36,
    height: 34,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(15,23,42,.08)',
      },
    }),
  },
  addEmployeeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand[800],
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
      },
    }),
  },
  addEmployeeBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
});
