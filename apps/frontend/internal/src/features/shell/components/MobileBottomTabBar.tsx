import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { COLORS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';

interface TabItem {
  name: string;
  screen: string;
  icon: any; // Lucide icon name
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
  return (
    <View style={[styles.container]}>
      {PRIMARY_TABS.map((tab) => {
        const isActive = activeScreen === tab.screen;
        return (
          <Pressable
            key={tab.screen}
            style={styles.tabButton}
            onPress={() => onNavigate(tab.screen)}
          >
            <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
              <Lucide
                name={tab.icon}
                size={22}
                color={isActive ? COLORS.brand[800] : COLORS.neutral[500]}
              />
            </View>
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.name}
            </Text>
          </Pressable>
        );
      })}

      {/* Menu / More Button */}
      <Pressable style={styles.tabButton} onPress={onMenuPress}>
        <View style={styles.iconContainer}>
          <Lucide name="menu" size={22} color={COLORS.neutral[500]} />
        </View>
        <Text style={styles.tabText}>More</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
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
  iconContainerActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)', // Very soft blue background for active icon
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[500],
  },
  tabTextActive: {
    color: COLORS.brand[800],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
