import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
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
      {/* Left active border indicator */}
      {isActive ? <View style={styles.activeBar} /> : null}

      <View
        style={[
          styles.contentWrapper,
          !isActive && isHovered && styles.contentWrapperHover,
        ]}
      >
        <View style={styles.navIconWrapper}>
          <Lucide
            name={link.icon}
            size={18}
            color={
              isActive
                ? COLORS.brand[700]
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
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  navItem: {
    position: 'relative',
    borderRadius: 8,
    marginBottom: SPACING[4],
    overflow: 'hidden',
    ...Platform.select({
      web: {
        transition: 'all 200ms ease-out',
        cursor: 'pointer',
      },
    }),
  },
  navItemActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)', // Soft blue wash background
  },
  navItemInactive: {
    backgroundColor: 'transparent',
  },
  navItemHover: {
    backgroundColor: COLORS.neutral[100], // Soft gray hover
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: COLORS.brand[700],
    borderRadius: 9999,
    zIndex: 2,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    width: '100%',
    ...Platform.select({
      web: {
        transition: 'transform 200ms ease-out',
      },
    }),
  },
  contentWrapperHover: {
    transform: [{ translateX: 4 }], // Micro-shift hover animation
  },
  navIconWrapper: {
    marginRight: SPACING[12],
    width: 20,
    alignItems: 'center',
  },
  navText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
  },
  navTextActive: {
    color: COLORS.brand[700],
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
