import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useTheme, SPACING, RADIUS, SHADOWS } from '@edge/ui';
import { Role } from '../data/mockRolesPermissions';

interface RoleCardProps {
  role: Role;
  isSelected: boolean;
  onSelect: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RoleCard({ role, isSelected, onSelect, onDelete }: RoleCardProps) {
  const { colors, isDark } = useTheme();
  const avatarBg = role.avatarBgColor !== undefined ? role.avatarBgColor : colors.brand.primary;

  return (
    <Pressable
      style={[
        styles.cardContainer,
        {
          backgroundColor: isSelected
            ? (isDark ? colors.cardBg : colors.bg)
            : colors.cardBg,
          borderColor: isSelected ? colors.brand.primary : colors.border,
          borderWidth: isSelected ? 1.5 : 1,
        },
      ]}
      onPress={() => onSelect(role)}
      accessibilityRole="button"
      accessibilityLabel={`Select role ${role.name}`}
    >
      <View style={styles.contentRow}>
        <View style={[styles.avatarCircle, { backgroundColor: isDark ? colors.neutral[700] : avatarBg }]}>
          <Text style={[styles.avatarText, { color: isDark ? colors.neutral[100] : colors.brand.secondary }]}>{role.avatarInitials}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={[styles.roleNameText, { color: colors.text }]}>{role.name}</Text>
          <Text style={[styles.roleIdText, { color: colors.textMuted }]} numberOfLines={1}>
            Role ID: {role.id}
          </Text>
        </View>

        {!role.isSystemRole && (
          <Pressable
            style={({ pressed }: { pressed: boolean }) => [
              styles.deleteBtn,
              { backgroundColor: pressed ? colors.semantic.errorBorder : colors.semantic.errorBg },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onDelete(role);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Delete role ${role.name}`}
          >
            <Text style={[styles.deleteBtnText, { color: colors.semantic.error }]}>Delete</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: RADIUS.card,
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[16],
    marginBottom: SPACING[12],
    ...SHADOWS.card,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[12],
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoCol: {
    flex: 1,
    marginRight: SPACING[8],
  },
  roleNameText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  roleIdText: {
    fontSize: 11,
  },
  deleteBtn: {
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.button,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
