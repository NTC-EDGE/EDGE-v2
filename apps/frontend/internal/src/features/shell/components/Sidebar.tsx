import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Feather as Lucide } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../shared/theme/tokens';
import { UserRole, NavigationLink } from '../context/RoleContext';
import { SidebarNavItem } from './SidebarNavItem';

interface SidebarProps {
  currentRole: UserRole;
  links: readonly NavigationLink[];
  activeScreen: string;
  onNavigate: (screenName: string) => void;
}

export function Sidebar({ currentRole, links, activeScreen, onNavigate }: SidebarProps) {
  return (
    <View style={styles.sidebar}>
      {/* Sidebar Header */}
      <View style={styles.sidebarHeader}>
        <View style={styles.logoIcon}>
          <Lucide name="shield" size={24} color={COLORS.brand[800]} />
        </View>
        <View>
          <Text style={styles.logoTitle}>EDGE</Text>
          <Text style={styles.logoSubtitle}>INTERNAL PORTAL</Text>
        </View>
      </View>

      {/* Sidebar Navigation Links */}
      <ScrollView
        style={styles.sidebarNav}
        contentContainerStyle={styles.sidebarNavContent}
      >
        {links.map((link) => {
          const isActive = activeScreen === link.screen;
          return (
            <SidebarNavItem
              key={link.name}
              link={link}
              isActive={isActive}
              onPress={onNavigate}
            />
          );
        })}
      </ScrollView>

      {/* Sidebar Footer */}
      <View style={styles.sidebarFooter}>
        <Text style={styles.roleLabel}>Current Role</Text>
        <Text style={styles.roleValue}>{currentRole}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    backgroundColor: COLORS.neutral.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
    flexDirection: 'column',
    height: '100%',
    zIndex: 10,
  },
  sidebarHeader: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[20],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[12],
  },
  logoTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[500],
    letterSpacing: 1,
  },
  sidebarNav: {
    flex: 1,
  },
  sidebarNavContent: {
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[16],
  },
  sidebarFooter: {
    padding: SPACING[20],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
  },
  roleLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  roleValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    color: COLORS.brand[800],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
