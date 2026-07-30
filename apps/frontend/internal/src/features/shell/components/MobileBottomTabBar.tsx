import React, { ComponentProps } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { useTheme, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';

interface TabItem {
  name: string;
  screen: string;
  icon: ComponentProps<typeof Lucide>['name'];
}

interface MobileBottomTabBarProps {
  activeScreen: string;
  onNavigate: (screenName: string) => void;
  onMenuPress: () => void;
}

// Define the primary tabs shown on mobile.
// Make sure these screen names match what's actually defined in AuthStack.
const PRIMARY_TABS: TabItem[] = [
  { name: 'Dashboard', screen: 'Dashboard', icon: 'grid' },
  { name: 'Employees', screen: 'Employees', icon: 'users' },
  { name: 'Users', screen: 'Users', icon: 'user' },
];

export function MobileBottomTabBar({ activeScreen, onNavigate, onMenuPress }: MobileBottomTabBarProps) {
  const { colors, isDark } = useTheme();

  const activeColor = isDark ? colors.brand[500] : colors.brand[800];
  const inactiveColor = isDark ? colors.neutral[400] : colors.neutral[500];
  const activePillBg = isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.1)';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.neutral[900] : colors.cardBg,
          borderTopColor: colors.border,
        },
      ]}
    >
      {PRIMARY_TABS.map((tab) => {
        const isActive = activeScreen === tab.screen;
        return (
          <Pressable
            key={tab.screen}
            style={styles.tabButton}
            onPress={() => onNavigate(tab.screen)}
          >
            <View
              style={[
                styles.iconContainer,
                isActive && { backgroundColor: activePillBg },
              ]}
            >
              <Lucide
                name={tab.icon}
                size={22}
                color={isActive ? activeColor : inactiveColor}
              />
            </View>
            <Text
              style={[
                styles.tabText,
                { color: inactiveColor },
                isActive && [styles.tabTextActive, { color: activeColor }],
              ]}
            >
              {tab.name}
            </Text>
          </Pressable>
        );
      })}

      {/* Menu / More Button */}
      <Pressable style={styles.tabButton} onPress={onMenuPress}>
        <View style={styles.iconContainer}>
          <Lucide name="menu" size={22} color={inactiveColor} />
        </View>
        <Text style={[styles.tabText, { color: inactiveColor }]}>More</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 100,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconContainer: {
    width: 48,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  tabTextActive: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

