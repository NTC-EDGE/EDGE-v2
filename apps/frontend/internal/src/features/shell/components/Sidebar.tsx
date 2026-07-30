import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Icon as Lucide, TYPOGRAPHY, useTheme } from '@edge/ui';
import {
  NAV_GROUP_ORDER,
  NavigationLink,
  NavGroup,
  UserRole,
} from '../context/RoleContext';
import { SidebarNavItem } from './SidebarNavItem';

// ─── Constants ───────────────────────────────────────────────────────────────

const SIDEBAR_EXPANDED_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 52;
const STORAGE_KEY = 'edge_sidebar_collapsed';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  currentRole: UserRole;
  links: readonly NavigationLink[];
  activeScreen: string;
  onNavigate: (screenName: string) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
  isMobile?: boolean;
  onClose?: () => void;
  onLogout?: () => void | Promise<void>;
  onRoleSelect?: (role: UserRole) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupLinks(
  links: readonly NavigationLink[],
): Map<NavGroup, readonly NavigationLink[]> {
  const map = new Map<NavGroup, NavigationLink[]>();
  for (const link of links) {
    const existing = map.get(link.group);
    if (existing !== undefined) {
      existing.push(link);
    } else {
      map.set(link.group, [link]);
    }
  }
  return map;
}

function readCollapsedFromStorage(): boolean {
  if (Platform.OS !== 'web') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeCollapsedToStorage(value: boolean): void {
  if (Platform.OS !== 'web') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // ignore
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Sidebar({
  currentRole,
  links,
  activeScreen,
  onNavigate,
  onCollapsedChange,
  isMobile = false,
  onClose,
  onLogout,
  onRoleSelect: _onRoleSelect,
}: SidebarProps) {
  const { colors, isDark } = useTheme();

  // Collapse state — only relevant on non-mobile
  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    isMobile ? false : readCollapsedFromStorage(),
  );

  const widthAnim = useRef(
    new Animated.Value(
      isMobile
        ? SIDEBAR_EXPANDED_WIDTH
        : isCollapsed
        ? SIDEBAR_COLLAPSED_WIDTH
        : SIDEBAR_EXPANDED_WIDTH,
    ),
  ).current;

  const toggleCollapse = useCallback(() => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    writeCollapsedToStorage(next);
    onCollapsedChange?.(next);
    Animated.timing(widthAnim, {
      toValue: next ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [isCollapsed, widthAnim, onCollapsedChange]);

  // Sync on mount in case storage differs from initial state
  useEffect(() => {
    if (isMobile) return;
    widthAnim.setValue(
      isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = groupLinks(links);

  const sidebarBg = isDark ? colors.neutral[900] : colors.cardBg;
  const borderColor = colors.border;
  const groupLabelColor = isDark ? colors.neutral[500] : colors.neutral[400];

  return (
    <Animated.View
      style={[
        styles.sidebar,
        {
          width: isMobile ? SIDEBAR_EXPANDED_WIDTH : widthAnim,
          backgroundColor: sidebarBg,
          borderRightColor: borderColor,
        },
      ]}
    >
      {/* ── Top: Collapse toggle (desktop) or Close button (mobile drawer) ── */}
      <View
        style={[
          styles.topBar,
          {
            borderBottomColor: borderColor,
            justifyContent: isMobile ? 'space-between' : isCollapsed ? 'center' : 'flex-end',
          },
        ]}
      >
        {isMobile && (
          <Text
            style={[styles.mobileTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            Menu
          </Text>
        )}

        <Pressable
          onPress={isMobile ? onClose : toggleCollapse}
          style={[styles.collapseBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50] }]}
        >
          <Lucide
            name={
              isMobile
                ? 'x'
                : isCollapsed
                ? 'chevron-right'
                : 'chevron-left'
            }
            size={14}
            color={isDark ? colors.neutral[400] : colors.neutral[500]}
          />
        </Pressable>
      </View>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.nav}
        contentContainerStyle={[
          styles.navContent,
          isCollapsed && !isMobile && styles.navContentCollapsed,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {NAV_GROUP_ORDER.map((group) => {
          const groupLinks = grouped.get(group);
          if (groupLinks === undefined || groupLinks.length === 0) return null;

          return (
            <View key={group} style={styles.group}>
              {/* Group label — hidden when collapsed */}
              {!isCollapsed && (
                <Text
                  style={[styles.groupLabel, { color: groupLabelColor }]}
                  numberOfLines={1}
                >
                  {group.toUpperCase()}
                </Text>
              )}
              {isCollapsed && (
                <View
                  style={[styles.groupDivider, { backgroundColor: borderColor }]}
                />
              )}

              {groupLinks.map((link) => (
                <SidebarNavItem
                  key={link.screen}
                  link={link}
                  isActive={activeScreen === link.screen}
                  isCollapsed={isCollapsed && !isMobile}
                  onPress={onNavigate}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.footer,
          {
            borderTopColor: borderColor,
            backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
            alignItems: isCollapsed && !isMobile ? 'center' : 'flex-start',
          },
        ]}
      >
        {/* Logout button */}
        <Pressable
          onPress={() => {
            if (onLogout !== undefined) {
              const result = onLogout();
              if (result instanceof Promise) {
                result.catch((err: unknown) =>
                  console.error('Logout error:', err),
                );
              }
            }
          }}
          style={[
            styles.logoutBtn,
            {
              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
              width: isCollapsed && !isMobile ? 32 : '100%',
              justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
            },
          ]}
        >
          <Lucide name="log-out" size={14} color={colors.semantic.error} />
          {(!isCollapsed || isMobile) && (
            <Text
              style={[styles.logoutText, { color: colors.semantic.error }]}
            >
              Logout
            </Text>
          )}
        </Pressable>

        {/* Role badge — shown only when expanded */}
        {(!isCollapsed || isMobile) && (
          <View style={styles.roleBadge}>
            <View
              style={[
                styles.roleAvatar,
                { backgroundColor: isDark ? colors.brand[800] : colors.brand[700] },
              ]}
            >
              <Text style={styles.roleAvatarText}>
                {currentRole[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.roleInfo}>
              <Text
                style={[styles.roleName, { color: colors.text }]}
                numberOfLines={1}
              >
                {currentRole}
              </Text>
              <Text style={[styles.roleCaption, { color: colors.textMuted }]}>
                Active role
              </Text>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sidebar: {
    flexDirection: 'column',
    height: '100%',
    borderRightWidth: 1,
    zIndex: 10,
    overflow: 'hidden',
    ...Platform.select({
      web: { transition: 'width 200ms cubic-bezier(0.4,0,0.2,1)' },
    }),
  },
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  mobileTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  collapseBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'background-color 120ms ease' },
    }),
  },
  nav: {
    flex: 1,
    ...Platform.select({
      web: {
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      },
    }),
  },
  navContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 12,
  },
  navContentCollapsed: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  group: {
    gap: 0,
  },
  groupLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.overline,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.8,
    paddingHorizontal: 8,
    paddingBottom: 4,
    paddingTop: 2,
  },
  groupDivider: {
    height: 1,
    marginVertical: 6,
    marginHorizontal: 10,
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 6,
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'background-color 120ms ease' },
    }),
  },
  logoutText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 2,
  },
  roleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  roleAvatarText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  roleInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  roleName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  roleCaption: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
});
