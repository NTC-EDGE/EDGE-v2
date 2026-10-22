import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { useTheme, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { NavigationLink } from '../context/RoleContext';

interface SidebarNavItemProps {
  link: NavigationLink;
  isActive: boolean;
  isCollapsed: boolean;
  onPress: (screen: string) => void;
}

export function SidebarNavItem({
  link,
  isActive,
  isCollapsed,
  onPress,
}: SidebarNavItemProps) {
  const { colors, isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const activeBg = isDark
    ? 'rgba(96, 165, 250, 0.12)'
    : 'rgba(37, 99, 235, 0.08)';
  const hoverBg = isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.04)';
  const activeIconColor = isDark ? colors.brand[500] : colors.brand[700];
  const inactiveIconColor = isDark ? colors.neutral[400] : colors.neutral[500];
  const activeTextColor = isDark ? colors.brand[500] : colors.brand[700];
  const inactiveTextColor = isDark ? colors.neutral[300] : colors.neutral[600];

  const currentBg = isActive ? activeBg : isHovered ? hoverBg : 'transparent';
  const iconColor = isActive ? activeIconColor : inactiveIconColor;
  const textColor = isActive ? activeTextColor : inactiveTextColor;

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => onPress(link.screen)}
        onHoverIn={() => {
          setIsHovered(true);
          if (isCollapsed) setShowTooltip(true);
        }}
        onHoverOut={() => {
          setIsHovered(false);
          setShowTooltip(false);
        }}
        style={[
          styles.item,
          isCollapsed && styles.itemCollapsed,
          {
            backgroundColor: currentBg,
            borderLeftColor: isActive
              ? isDark ? colors.brand[500] : colors.brand[700]
              : 'transparent',
          },
        ]}
      >
        {/* Left active indicator border */}
        <View
          style={[
            styles.activeBorder,
            {
              backgroundColor: isActive
                ? isDark ? colors.brand[500] : colors.brand[700]
                : 'transparent',
            },
          ]}
        />

        {/* Icon */}
        <View style={[styles.iconWrap, isCollapsed && styles.iconWrapCollapsed]}>
          <Lucide name={link.icon} size={15} color={iconColor} />
          {isCollapsed && link.badgeCount !== undefined && link.badgeCount > 0 && (
            <View
              style={[
                styles.collapsedBadgeDot,
                {
                  backgroundColor: isDark ? colors.brand[500] : colors.brand[600],
                },
              ]}
            />
          )}
        </View>

        {/* Label — hidden when collapsed */}
        {!isCollapsed && (
          <Text
            style={[
              styles.label,
              {
                color: textColor,
                fontWeight: isActive
                  ? TYPOGRAPHY.weights.semibold
                  : TYPOGRAPHY.weights.regular,
              },
            ]}
            numberOfLines={1}
          >
            {link.name}
          </Text>
        )}

        {/* Badge Pill — shown when expanded and count > 0 */}
        {!isCollapsed && link.badgeCount !== undefined && link.badgeCount > 0 && (
          <View
            style={[
              styles.badgePill,
              {
                backgroundColor: isActive
                  ? isDark ? colors.brand[600] : colors.brand[700]
                  : isDark ? colors.neutral[800] : colors.neutral[200],
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: isActive
                    ? '#FFFFFF'
                    : isDark ? colors.brand[400] : colors.brand[700],
                },
              ]}
            >
              {link.badgeCount > 99 ? '99+' : link.badgeCount}
            </Text>
          </View>
        )}
      </Pressable>

      {/* Tooltip — shown on hover when collapsed */}
      {isCollapsed && showTooltip && (
        <View
          style={[
            styles.tooltip,
            {
              backgroundColor: isDark ? colors.neutral[700] : colors.neutral[900],
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.tooltipText}>
            {link.name}
            {link.badgeCount !== undefined && link.badgeCount > 0 ? ` (${link.badgeCount})` : ''}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    borderRadius: 6,
    marginBottom: 1,
    overflow: 'hidden',
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 120ms ease, border-color 120ms ease',
      },
    }),
  },
  itemCollapsed: {
    justifyContent: 'center',
    borderLeftWidth: 3,
  },
  activeBorder: {
    // The borderLeftWidth on the item itself handles this now
    // This view is not needed but kept for layout stability
    width: 0,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 8,
    flexShrink: 0,
    position: 'relative',
  },
  iconWrapCollapsed: {
    marginLeft: 0,
    marginRight: 0,
    width: '100%',
  },
  collapsedBadgeDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    flex: 1,
    ...Platform.select({
      web: { transition: 'opacity 150ms ease' },
    }),
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 18,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: 14,
  },
  tooltip: {
    position: 'absolute',
    left: 56,
    top: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    zIndex: 9999,
    ...Platform.select({
      web: { whiteSpace: 'nowrap' },
    }),
  },
  tooltipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
