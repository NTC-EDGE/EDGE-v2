import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Feather as Lucide } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../shared/theme/tokens';
import { NavigationLink } from '../context/RoleContext';

interface SidebarNavItemProps {
  link: NavigationLink;
  isActive: boolean;
  onPress: (screen: string) => void;
}

export function SidebarNavItem({ link, isActive, onPress }: SidebarNavItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onPress={() => onPress(link.screen)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.navItem,
        isActive ? styles.navItemActive : styles.navItemInactive,
        !isActive && isHovered && styles.navItemHover,
      ]}
    >
      <View style={styles.navIconWrapper}>
        <Lucide
          name={link.icon}
          size={20}
          color={
            isActive
              ? COLORS.neutral.white
              : isHovered
                ? COLORS.brand[800]
                : COLORS.neutral[500]
          }
        />
      </View>
      <Text
        style={[
          styles.navText,
          isActive ? styles.navTextActive : styles.navTextInactive,
          !isActive && isHovered && styles.navTextHover,
        ]}
      >
        {link.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderRadius: 14,
    marginBottom: SPACING[8],
  },
  navItemActive: {
    backgroundColor: COLORS.brand[700],
  },
  navItemInactive: {
    backgroundColor: 'transparent',
  },
  navItemHover: {
    backgroundColor: COLORS.neutral[100],
  },
  navIconWrapper: {
    marginRight: SPACING[16],
    width: 24,
    alignItems: 'center',
  },
  navText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
  },
  navTextActive: {
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  navTextInactive: {
    color: COLORS.neutral[600],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  navTextHover: {
    color: COLORS.brand[800],
  },
});
