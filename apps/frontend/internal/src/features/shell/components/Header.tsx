import React, { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {
  COLORS,
  Icon as Lucide,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
  ThemeToggle,
  useTheme,
} from '@edge/ui';
import { UserRole, NAV_GROUP_ORDER, ROLE_NAVIGATION_LINKS } from '../context/RoleContext';
import { UserProfile as UserProfileType } from '../../auth/context/AuthContext';
import { EditAccountModal } from '../../auth/components/EditAccountModal';

// ─── Asset ───────────────────────────────────────────────────────────────────

const footerLogoAsset: ImageSourcePropType = require('../../../../assets/footer-logo.png');

// ─── Types ───────────────────────────────────────────────────────────────────

interface HeaderProps {
  currentRole: UserRole;
  activeScreen: string;
  onRoleSelect: (role: UserRole) => void;
  showRoleDropdown: boolean;
  toggleRoleDropdown: () => void;
  closeRoleDropdown: () => void;
  isSwitcherHovered: boolean;
  setIsSwitcherHovered: (v: boolean) => void;
  isLogoutHovered: boolean;
  setIsLogoutHovered: (v: boolean) => void;
  user: UserProfileType | null;
  onLogout: () => void | Promise<void>;
  isMobile?: boolean;
  onMenuPress?: () => void;
  onNavigate?: (screenName: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name || name === 'User') return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2 && parts[0] !== undefined && parts[1] !== undefined) {
    const first = parts[0][0];
    const second = parts[1][0];
    if (first !== undefined && second !== undefined) {
      return `${first}${second}`.toUpperCase();
    }
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Given an activeScreen name and a role, resolve the breadcrumb:
 * group label (e.g. "Administration") + screen name (e.g. "Users")
 */
function getBreadcrumb(
  activeScreen: string,
  currentRole: UserRole,
): { group: string; screen: string } | null {
  const links = ROLE_NAVIGATION_LINKS[currentRole];
  // links is a readonly array of NavigationLink
  const found = (links as ReadonlyArray<{ name: string; screen: string; group: string }>).find(
    (l) => l.screen === activeScreen,
  );
  if (found === undefined) return null;
  return { group: found.group, screen: found.name };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Header({
  currentRole,
  activeScreen,
  onRoleSelect: _onRoleSelect,
  showRoleDropdown: _showRoleDropdown,
  toggleRoleDropdown: _toggleRoleDropdown,
  closeRoleDropdown: _closeRoleDropdown,
  isSwitcherHovered: _isSwitcherHovered,
  setIsSwitcherHovered: _setIsSwitcherHovered,
  isLogoutHovered: _isLogoutHovered,
  setIsLogoutHovered: _setIsLogoutHovered,
  user,
  onLogout,
  isMobile = false,
  onMenuPress,
  onNavigate,
}: HeaderProps) {
  const { colors, isDark } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const profileName = user?.name ?? 'User';
  const profileEmail = user?.email ?? '';
  const initials = getInitials(profileName);
  const breadcrumb = getBreadcrumb(activeScreen, currentRole);

  // Unread notifications mock count
  const notifCount = 3;

  const dropdownBg = isDark ? colors.neutral[900] : colors.cardBg;
  const dropdownBorder = isDark ? colors.neutral[800] : colors.border;
  const dropdownText = colors.text;

  const headerBorderColor = isDark ? 'rgba(255,255,255,0.08)' : colors.border;
  const iconColor = isDark ? COLORS.neutral.white : colors.text;
  const iconBtnBg = isDark ? 'rgba(255,255,255,0.07)' : colors.neutral[100];
  const breadcrumbGroupColor = isDark ? 'rgba(255,255,255,0.45)' : colors.textMuted;
  const breadcrumbChevronColor = isDark ? 'rgba(255,255,255,0.4)' : colors.textMuted;
  const breadcrumbScreenColor = isDark ? 'rgba(255,255,255,0.85)' : colors.text;
  const dividerColor = isDark ? 'rgba(255,255,255,0.15)' : colors.border;
  const avatarBg = isDark ? 'rgba(255,255,255,0.15)' : colors.brand[100];
  const avatarBorder = isDark ? 'rgba(255,255,255,0.25)' : colors.brand[300];
  const avatarTextColor = isDark ? '#FFFFFF' : colors.brand[700];
  const nameColor = isDark ? '#FFFFFF' : colors.text;
  const roleColor = isDark ? 'rgba(255,255,255,0.55)' : colors.textMuted;
  const chevronColor = isDark ? 'rgba(255,255,255,0.5)' : colors.textMuted;

  const headerDynamicStyle: ViewStyle = Platform.select({
    web: {
      backgroundImage: isDark
        ? `linear-gradient(to right, #0E1B61 0%, #1E3A8A 50%, #1E293B 100%)`
        : `linear-gradient(to right, #FFFFFF 0%, #F8FAFC 50%, #EFF6FF 100%)`,
      boxShadow: isDark ? '0 1px 3px 0 rgba(0,0,0,0.25)' : '0 1px 3px 0 rgba(0,0,0,0.05)',
      borderBottomColor: headerBorderColor,
      flexShrink: 0,
    },
    default: {
      backgroundColor: isDark ? '#1E3A8A' : colors.cardBg,
      borderBottomColor: headerBorderColor,
    },
  }) as ViewStyle;

  return (
    <View
      style={[
        styles.header,
        headerDynamicStyle,
        isMobile && styles.headerMobile,
      ]}
    >
      {/* ── Left: Hamburger (mobile) + Logo ─────────────────────────────── */}
      <View style={styles.left}>
        {isMobile && onMenuPress !== undefined && (
          <Pressable onPress={onMenuPress} style={[styles.iconBtn, { backgroundColor: iconBtnBg }]}>
            <Lucide name="menu" size={18} color={iconColor} />
          </Pressable>
        )}
        <Image
          source={footerLogoAsset}
          style={isMobile ? styles.logoMobile : styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* ── Center: Breadcrumb ───────────────────────────────────────────── */}
      {!isMobile && breadcrumb !== null && (
        <View style={styles.breadcrumb} pointerEvents="none">
          <Text style={[styles.breadcrumbGroup, { color: breadcrumbGroupColor }]}>{breadcrumb.group}</Text>
          <Lucide
            name="chevron-right"
            size={12}
            color={breadcrumbChevronColor}
          />
          <Text style={[styles.breadcrumbScreen, { color: breadcrumbScreenColor }]}>{breadcrumb.screen}</Text>
        </View>
      )}

      {/* ── Right: Controls ─────────────────────────────────────────────── */}
      <View style={styles.right}>
        {/* Theme toggle — icon only */}
        <ThemeToggle variant="icon" size="sm" />

        {/* Notifications bell */}
        <View style={styles.bellWrap}>
          <Pressable style={[styles.iconBtn, { backgroundColor: iconBtnBg }]}>
            <Lucide name="bell" size={16} color={iconColor} />
          </Pressable>
          {notifCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notifCount > 9 ? '9+' : String(notifCount)}
              </Text>
            </View>
          )}
        </View>

        {/* Vertical divider */}
        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        {/* Profile */}
        {!isMobile ? (
          <View>
            <Pressable
              onPress={() => setProfileOpen((v) => !v)}
              style={styles.profileBtn}
            >
              <View style={[styles.profileAvatar, { backgroundColor: avatarBg, borderColor: avatarBorder }]}>
                <Text style={[styles.profileAvatarText, { color: avatarTextColor }]}>{initials}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: nameColor }]} numberOfLines={1}>
                  {profileName}
                </Text>
                <Text style={[styles.profileRole, { color: roleColor }]} numberOfLines={1}>
                  {currentRole}
                </Text>
              </View>
              <Lucide
                name={profileOpen ? 'chevron-up' : 'chevron-down'}
                size={13}
                color={chevronColor}
              />
            </Pressable>

            {/* Profile dropdown */}
            {profileOpen && (
              <View
                style={[
                  styles.dropdown,
                  SHADOWS.modal,
                  {
                    backgroundColor: dropdownBg,
                    borderColor: dropdownBorder,
                  },
                ]}
              >
                {/* Identity */}
                <View style={styles.dropdownIdent}>
                  <Text style={[styles.dropdownName, { color: dropdownText }]}>
                    {profileName}
                  </Text>
                  <Text
                    style={[
                      styles.dropdownEmail,
                      { color: isDark ? '#64748B' : '#94A3B8' },
                    ]}
                  >
                    {profileEmail}
                  </Text>
                </View>

                <View
                  style={[
                    styles.dropdownDivider,
                    { backgroundColor: dropdownBorder },
                  ]}
                />

                {/* Account Settings */}
                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => {
                    setProfileOpen(false);
                    if (onNavigate !== undefined) {
                      onNavigate('AccountSettings');
                    } else {
                      setSettingsModalOpen(true);
                    }
                  }}
                >
                  <Lucide name="settings" size={13} color={dropdownText} />
                  <Text style={[styles.dropdownItemText, { color: dropdownText }]}>
                    Account Settings
                  </Text>
                </Pressable>

                <View
                  style={[
                    styles.dropdownDivider,
                    { backgroundColor: dropdownBorder },
                  ]}
                />

                {/* Logout */}
                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => {
                    setProfileOpen(false);
                    const result = onLogout();
                    if (result instanceof Promise) {
                      result.catch((err: unknown) =>
                        console.error('Logout error:', err),
                      );
                    }
                  }}
                >
                  <Lucide
                    name="log-out"
                    size={13}
                    color={isDark ? '#F87171' : '#EF4444'}
                  />
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: isDark ? '#F87171' : '#EF4444' },
                    ]}
                  >
                    Sign out
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          /* Mobile avatar */
          <Pressable
            onPress={() => {
              if (onNavigate !== undefined) {
                onNavigate('AccountSettings');
              } else {
                setSettingsModalOpen(true);
              }
            }}
          >
            <View style={[styles.profileAvatar, styles.profileAvatarMobile, { backgroundColor: avatarBg, borderColor: avatarBorder }]}>
              <Text style={[styles.profileAvatarText, { color: avatarTextColor }]}>{initials}</Text>
            </View>
          </Pressable>
        )}
      </View>

      <EditAccountModal
        visible={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[16],
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: SPACING[12],
  },
  headerMobile: {
    paddingHorizontal: SPACING[12],
    height: 52,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
    flexShrink: 0,
  },
  logo: {
    height: 40,
    width: 130,
  },
  logoMobile: {
    height: 34,
    width: 110,
  },
  breadcrumb: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  breadcrumbGroup: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  breadcrumbScreen: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    marginLeft: 'auto',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 120ms ease',
      },
    }),
  },
  bellWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 8,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
    lineHeight: 10,
  },
  divider: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    paddingHorizontal: SPACING[8],
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 120ms ease',
      },
    }),
  },
  profileAvatar: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarMobile: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  profileAvatarText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  profileInfo: {
    alignItems: 'flex-start',
  },
  profileName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    maxWidth: 100,
  },
  profileRole: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  dropdown: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 220,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    zIndex: 200,
    overflow: 'hidden',
  },
  dropdownIdent: {
    padding: 12,
  },
  dropdownName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dropdownEmail: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 2,
  },
  dropdownDivider: {
    height: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  dropdownItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

