import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon as Lucide, RADIUS, SPACING, TYPOGRAPHY, useTheme } from '@edge/ui';
import type { Role } from '../types';

interface RoleListItemProps {
  role: Role;
  isSelected: boolean;
  onPress: () => void;
  onDeletePress: () => void;
}

export function RoleListItem({
  role,
  isSelected,
  onPress,
  onDeletePress,
}: RoleListItemProps) {
  const { colors, isDark } = useTheme();

  const textColor = isDark ? colors.neutral[100] : colors.neutral[900];
  const mutedColor = isDark ? colors.neutral[400] : colors.neutral[500];
  const selectedBg = isDark ? 'rgba(96, 165, 250, 0.08)' : 'rgba(59, 130, 246, 0.06)';
  const accentColor = isDark ? '#60A5FA' : colors.brand[700];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.item,
        isSelected && [
          styles.itemSelected,
          {
            backgroundColor: selectedBg,
            borderLeftColor: accentColor,
          },
        ],
        !isSelected && styles.itemIdle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Select role ${role.name}`}
      accessibilityState={{ selected: isSelected }}
    >
      {/* Name + Badge */}
      <View style={styles.info}>
        <Text
          style={[
            styles.name,
            {
              color: isSelected ? accentColor : textColor,
              fontWeight: isSelected ? '700' : '600',
            },
          ]}
          numberOfLines={1}
        >
          {role.name}
        </Text>
        <View
          style={[
            styles.scopeBadge,
            {
              backgroundColor: role.isSystemRole
                ? (isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7')
                : (isDark ? 'rgba(96,165,250,0.12)' : '#EFF6FF'),
            },
          ]}
        >
          <Lucide
            name={role.isSystemRole ? 'lock' : 'settings'}
            size={9}
            color={role.isSystemRole
              ? (isDark ? '#FBBF24' : '#B45309')
              : accentColor}
          />
          <Text
            style={[
              styles.scopeText,
              {
                color: role.isSystemRole
                  ? (isDark ? '#FBBF24' : '#B45309')
                  : accentColor,
              },
            ]}
          >
            {role.isSystemRole ? 'SYSTEM' : 'CUSTOM'}
          </Text>
        </View>
      </View>

      {/* Delete (custom roles only) */}
      {!role.isSystemRole && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onDeletePress();
          }}
          style={styles.deleteBtn}
          hitSlop={8}
          accessibilityLabel={`Delete role ${role.name}`}
        >
          <Lucide
            name="trash-2"
            size={13}
            color={isDark ? '#F87171' : '#EF4444'}
          />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[10],
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    gap: SPACING[10],
  },
  itemIdle: {
    borderLeftColor: 'transparent',
  },
  itemSelected: {
    borderLeftWidth: 3,
  },
  info: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  name: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  scopeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  scopeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  deleteBtn: {
    padding: 4,
    borderRadius: 4,
    flexShrink: 0,
  },
});
