import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@edge/ui';
import { Role } from '../data/mockRolesPermissions';

interface RoleCardProps {
  role: Role;
  isSelected: boolean;
  onSelect: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RoleCard({ role, isSelected, onSelect, onDelete }: RoleCardProps) {
  const avatarBg = role.avatarBgColor !== undefined ? role.avatarBgColor : COLORS.brand[500];

  return (
    <Pressable
      style={[
        styles.cardContainer,
        isSelected ? styles.cardSelected : styles.cardUnselected,
      ]}
      onPress={() => onSelect(role)}
      accessibilityRole="button"
      accessibilityLabel={`Select role ${role.name}`}
    >
      <View style={styles.contentRow}>
        <View style={[styles.avatarCircle, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarText}>{role.avatarInitials}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.roleNameText}>{role.name}</Text>
          <Text style={styles.roleIdText} numberOfLines={1}>
            Role ID: {role.id}
          </Text>
        </View>

        {!role.isSystemRole && (
          <Pressable
            style={({ pressed }: { pressed: boolean }) => [
              styles.deleteBtn,
              pressed && styles.deleteBtnPressed,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onDelete(role);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Delete role ${role.name}`}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[16],
    marginBottom: SPACING[12],
    borderWidth: 1,
  },
  cardUnselected: {
    borderColor: COLORS.neutral[200],
    ...SHADOWS.card,
  },
  cardSelected: {
    borderColor: COLORS.brand[600],
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
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
    color: COLORS.brand[900],
  },
  infoCol: {
    flex: 1,
    marginRight: SPACING[8],
  },
  roleNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.neutral[900],
    marginBottom: 2,
  },
  roleIdText: {
    fontSize: 11,
    color: COLORS.neutral[400],
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.button,
  },
  deleteBtnPressed: {
    backgroundColor: '#FCA5A5',
  },
  deleteBtnText: {
    color: COLORS.semantic.error,
    fontSize: 12,
    fontWeight: '600',
  },
});
