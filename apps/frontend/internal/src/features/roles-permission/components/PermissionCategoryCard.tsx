import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { COLORS, SPACING, RADIUS, Icon as Lucide } from '@edge/ui';
import { PermissionCategory } from '../data/mockRolesPermissions';

interface PermissionCategoryCardProps {
  category: PermissionCategory;
  activePermissionIds: string[];
  onTogglePermission: (permissionId: string) => void;
}

export function PermissionCategoryCard({
  category,
  activePermissionIds,
  onTogglePermission,
}: PermissionCategoryCardProps) {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.leftAccentBar} />
      <View style={styles.cardInner}>
        <Text style={styles.categoryTitle}>{category.title}</Text>

        <View style={styles.optionsList}>
          {category.options.map((option, index) => {
            const isChecked = activePermissionIds.includes(option.id);
            const isLast = index === category.options.length - 1;

            return (
              <Pressable
                key={option.id}
                style={[styles.optionRow, !isLast && styles.optionBorderBottom]}
                onPress={() => onTogglePermission(option.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isChecked }}
                accessibilityLabel={`${category.title} ${option.label}`}
              >
                <View style={[styles.checkbox, isChecked ? styles.checkboxChecked : styles.checkboxUnchecked]}>
                  {isChecked && <Lucide name="check" size={14} color={COLORS.neutral.white} />}
                </View>
                <Text style={[styles.optionLabel, isChecked ? styles.optionLabelChecked : styles.optionLabelUnchecked]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    marginBottom: SPACING[16],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    flexDirection: 'row',
    overflow: 'hidden',
  },
  leftAccentBar: {
    width: 4,
    backgroundColor: COLORS.brand[700],
  },
  cardInner: {
    flex: 1,
    padding: SPACING[16],
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.neutral[900],
    marginBottom: SPACING[12],
  },
  optionsList: {
    flexDirection: 'column',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[12],
  },
  optionBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[12],
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
    fontSize: 14,
  },
  optionLabelChecked: {
    fontWeight: '600',
    color: COLORS.neutral[900],
  },
  optionLabelUnchecked: {
    fontWeight: '400',
    color: COLORS.neutral[600],
  },
});
