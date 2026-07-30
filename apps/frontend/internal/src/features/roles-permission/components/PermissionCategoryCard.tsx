import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Icon as Lucide, RADIUS, SPACING, TYPOGRAPHY, useTheme } from '@edge/ui';
import type { PermissionCategoryGroup } from '@edge/api';

interface PermissionCategoryCardProps {
  category: PermissionCategoryGroup;
  activePermissionIds: string[];
  onTogglePermission: (permissionId: string) => void;
  onToggleCategoryGroup?: (category: PermissionCategoryGroup) => void;
}

export function PermissionCategoryCard({
  category,
  activePermissionIds,
  onTogglePermission,
  onToggleCategoryGroup,
}: PermissionCategoryCardProps) {
  const { colors, isDark } = useTheme();
  const [isExpanded, setIsExpanded] = React.useState(true);

  const rotateAnim = useRef(new Animated.Value(1)).current;
  const heightAnim = useRef(new Animated.Value(1)).current;

  const cardBg = isDark ? colors.neutral[800] : '#FFFFFF';
  const borderColor = isDark ? colors.neutral[700] : colors.neutral[200];
  const textColor = isDark ? colors.neutral[100] : colors.neutral[900];
  const mutedColor = isDark ? colors.neutral[400] : colors.neutral[500];
  const accentColor = isDark ? '#60A5FA' : colors.brand[700];
  const subBg = isDark ? colors.neutral[700] : colors.neutral[50];

  const activeCount = category.options.filter((opt) =>
    activePermissionIds.includes(opt.id),
  ).length;
  const totalCount = category.options.length;
  const isFullActive = activeCount === totalCount && totalCount > 0;

  const handleToggleAllInGroup = (e: any) => {
    e.stopPropagation?.();
    if (onToggleCategoryGroup) {
      onToggleCategoryGroup(category);
    } else {
      const targetState = !isFullActive;
      category.options.forEach((opt) => {
        const isActive = activePermissionIds.includes(opt.id);
        if (isActive !== targetState) {
          onTogglePermission(opt.id);
        }
      });
    }
  };

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
    setIsExpanded(!isExpanded);
  };

  const chevronRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const maxHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, totalCount * 52 + 16],
  });

  const opacity = heightAnim;

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      {/* ── Category Header ──────────────────────────────────────────────────── */}
      <Pressable
        style={styles.header}
        onPress={toggleExpand}
        accessibilityRole="button"
        accessibilityLabel={`${isExpanded ? 'Collapse' : 'Expand'} ${category.title}`}
      >
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.ratioBadge,
              {
                backgroundColor: isFullActive
                  ? (isDark ? 'rgba(52, 211, 153, 0.15)' : '#D1FAE5')
                  : (isDark ? colors.neutral[700] : colors.neutral[100]),
              },
            ]}
          >
            <Text
              style={[
                styles.ratioBadgeText,
                {
                  color: isFullActive
                    ? (isDark ? '#34D399' : '#059669')
                    : mutedColor,
                },
              ]}
            >
              {activeCount} / {totalCount}
            </Text>
          </View>
          <Text style={[styles.categoryTitle, { color: textColor }]}>{category.title}</Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            style={[
              styles.selectGroupBtn,
              { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] },
            ]}
            onPress={handleToggleAllInGroup}
            hitSlop={6}
          >
            <Text style={[styles.selectGroupText, { color: accentColor }]}>
              {isFullActive ? 'Deselect All' : 'Select All'}
            </Text>
          </Pressable>

          <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
            <Lucide name="chevron-down" size={16} color={mutedColor} />
          </Animated.View>
        </View>
      </Pressable>

      {/* ── Permission Rows (Animated) ───────────────────────────────────────── */}
      <Animated.View style={{ maxHeight, opacity, overflow: 'hidden' }}>
        <View style={[styles.body, { borderTopColor: borderColor }]}>
          {category.options.map((option, index) => {
            const isActive = activePermissionIds.includes(option.id);
            const isLast = index === category.options.length - 1;
            return (
              <View
                key={option.id}
                style={[
                  styles.permRow,
                  !isLast && { borderBottomWidth: 1, borderBottomColor: borderColor },
                ]}
              >
                {/* Permission label + key + tag + description */}
                <View style={styles.permLabelGroup}>
                  <View style={styles.permTitleRow}>
                    <Text style={[styles.permLabel, { color: isActive ? textColor : mutedColor }]}>
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.permKey,
                        {
                          color: accentColor,
                          backgroundColor: isDark ? 'rgba(96,165,250,0.1)' : '#EFF6FF',
                        },
                      ]}
                    >
                      {option.id}
                    </Text>
                    {option.tag && (
                      <View style={[styles.tagBadge, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}>
                        <Text style={[styles.tagText, { color: mutedColor }]}>
                          {option.tag}
                        </Text>
                      </View>
                    )}
                  </View>
                  {option.description && (
                    <Text style={[styles.permDescription, { color: mutedColor }]}>
                      {option.description}
                    </Text>
                  )}
                </View>

                {/* Toggle */}
                <Switch
                  value={isActive}
                  onValueChange={() => onTogglePermission(option.id)}
                  trackColor={{
                    false: isDark ? colors.neutral[700] : colors.neutral[200],
                    true: isDark ? '#2563EB' : colors.brand[600],
                  }}
                  thumbColor={isActive ? '#FFFFFF' : (isDark ? colors.neutral[500] : '#FFFFFF')}
                  ios_backgroundColor={isDark ? colors.neutral[700] : colors.neutral[200]}
                />
              </View>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
  },
  selectGroupBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selectGroupText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ratioBadge: {
    paddingHorizontal: SPACING[8],
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratioBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    borderTopWidth: 1,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[10],
  },
  permLabelGroup: {
    flex: 1,
    gap: 3,
    marginRight: SPACING[12],
  },
  permTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING[6],
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  permDescription: {
    fontSize: 11,
    marginTop: 1,
  },
  permLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  permKey: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
});
