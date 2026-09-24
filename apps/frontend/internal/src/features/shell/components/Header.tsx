import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
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
import { useAdminApplications, useAdminAnnouncements } from '@edge/api';
import { useMeetingsList } from '../../meet/hooks/useMeetingsList';
import { useChatConversations } from '../../chat/hooks/useChatConversations';
import { UserRole, NAV_GROUP_ORDER, ROLE_NAVIGATION_LINKS, NavigationLink } from '../context/RoleContext';
import { UserProfile as UserProfileType } from '../../auth/context/AuthContext';
import { EditAccountModal } from '../../auth/components/EditAccountModal';
import { openQueueApplication } from '../../queue/data/internalApplicationNavigationHelper';

// ─── Constants & Storage ──────────────────────────────────────────────────────

const NOTIF_STORAGE_PREFIX = 'edge_internal_read_notifications';

function getStoredReadNotifs(userId?: string): Set<string> {
  if (Platform.OS !== 'web') return new Set();
  try {
    const key = userId !== undefined && userId !== '' ? `${NOTIF_STORAGE_PREFIX}_${userId}` : NOTIF_STORAGE_PREFIX;
    const raw = window.localStorage.getItem(key);
    if (raw !== null && raw !== '') {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch {
    // ignore
  }
  return new Set();
}

function saveStoredReadNotifs(set: Set<string>, userId?: string): void {
  if (Platform.OS !== 'web') return;
  try {
    const key = userId !== undefined && userId !== '' ? `${NOTIF_STORAGE_PREFIX}_${userId}` : NOTIF_STORAGE_PREFIX;
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

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
  const links: readonly NavigationLink[] = ROLE_NAVIGATION_LINKS[currentRole];
  const found = links.find((l) => l.screen === activeScreen);
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
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(() => getStoredReadNotifs(user?.email));

  useEffect(() => {
    if (user?.email !== undefined && user?.email !== '') {
      setReadNotifIds(getStoredReadNotifs(user.email));
    }
  }, [user?.email]);

  const profileName = user?.name ?? 'User';
  const profileEmail = user?.email ?? '';
  const initials = getInitials(profileName);
  const breadcrumb = getBreadcrumb(activeScreen, currentRole);

  // Applications and Announcements
  const { applications } = useAdminApplications(
    {
      queueTab: 'pending',
      scope: 'queue',
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  const { announcements } = useAdminAnnouncements({
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });

  const { meetings } = useMeetingsList(user?.tenantId);
  const { conversations } = useChatConversations(user?.tenantId);

  const notifications = useMemo(() => {
    const list: Array<{
      id: string;
      appId?: string;
      title: string;
      description: string;
      timestamp?: string;
      type: 'evaluation' | 'announcement' | 'meeting' | 'chat';
      screen: string;
      isRead: boolean;
    }> = [];

    if (Array.isArray(meetings)) {
      for (const meet of meetings) {
        if (meet.status === 'Scheduled' || meet.status === 'Live') {
          list.push({
            id: `meet_${meet.id}`,
            title: meet.status === 'Live' ? 'Live Meeting Ongoing' : 'Upcoming Meet Reminder',
            description: `${meet.title} (Host: ${meet.hostUserName})`,
            timestamp: meet.scheduledStartTime,
            type: 'meeting',
            screen: 'Meet',
            isRead: readNotifIds.has(`meet_${meet.id}`),
          });
        }
      }
    }

    if (Array.isArray(conversations)) {
      for (const conv of conversations) {
        if (conv.unreadCount > 0) {
          list.push({
            id: `chat_${conv.id}`,
            title: conv.title ?? 'New Message',
            description: conv.lastMessagePreview ?? `${conv.unreadCount} unread message(s)`,
            timestamp: conv.lastMessageAt ?? undefined,
            type: 'chat',
            screen: 'Chat',
            isRead: readNotifIds.has(`chat_${conv.id}`),
          });
        }
      }
    }

    if (Array.isArray(applications)) {
      for (const app of applications) {
        list.push({
          id: `app_${app.id}`,
          appId: app.id,
          title: 'Application Submitted',
          description: `Ref #${app.referenceNumber ?? app.applicationNumber ?? 'N/A'}: ${app.serviceName ?? 'Application'} awaiting evaluation`,
          timestamp: app.createdAt,
          type: 'evaluation',
          screen: 'Activities',
          isRead: readNotifIds.has(`app_${app.id}`),
        });
      }
    }

    if (Array.isArray(announcements)) {
      for (const item of announcements) {
        if (item.isActive) {
          list.push({
            id: `ann_${item.id}`,
            title: item.title,
            description: item.message,
            timestamp: item.createdAt,
            type: 'announcement',
            screen: 'Announcements',
            isRead: readNotifIds.has(`ann_${item.id}`),
          });
        }
      }
    }

    return list;
  }, [applications, announcements, meetings, conversations, readNotifIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markAllAsRead = useCallback(() => {
    const nextSet = new Set(readNotifIds);
    for (const n of notifications) {
      nextSet.add(n.id);
    }
    setReadNotifIds(nextSet);
    saveStoredReadNotifs(nextSet, user?.email);
  }, [notifications, readNotifIds, user?.email]);

  const markAsRead = useCallback((id: string) => {
    const nextSet = new Set(readNotifIds);
    nextSet.add(id);
    setReadNotifIds(nextSet);
    saveStoredReadNotifs(nextSet, user?.email);
  }, [readNotifIds, user?.email]);

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
  }) ?? {};

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
          <Pressable
            onPress={() => setNotifOpen((prev) => !prev)}
            style={[styles.iconBtn, { backgroundColor: iconBtnBg }]}
          >
            <Lucide name="bell" size={16} color={iconColor} />
          </Pressable>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : String(unreadCount)}
              </Text>
            </View>
          )}

          {/* Notifications Dropdown */}
          {notifOpen && (
            <>
              <Pressable style={styles.backdrop} onPress={() => setNotifOpen(false)} />
              <View
                style={[
                  styles.notifDropdown,
                  SHADOWS.modal,
                  {
                    backgroundColor: dropdownBg,
                    borderColor: dropdownBorder,
                  },
                ]}
              >
              <View style={[styles.notifHeader, { borderBottomColor: dropdownBorder }]}>
                <View style={styles.notifHeaderTitleRow}>
                  <Text style={[styles.notifTitle, { color: dropdownText }]}>
                    Notifications
                  </Text>
                  {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
                    </View>
                  )}
                </View>
                {unreadCount > 0 && (
                  <Pressable onPress={markAllAsRead}>
                    <Text style={[styles.markAllReadText, { color: colors.brand[500] }]}>
                      Mark all as read
                    </Text>
                  </Pressable>
                )}
              </View>

              <ScrollView style={styles.notifList} showsVerticalScrollIndicator={false}>
                {notifications.length === 0 ? (
                  <View style={styles.notifEmpty}>
                    <Lucide name="bell-off" size={24} color={isDark ? '#64748B' : '#94A3B8'} />
                    <Text style={[styles.notifEmptyText, { color: isDark ? '#64748B' : '#94A3B8' }]}>
                      No notifications right now
                    </Text>
                  </View>
                ) : (
                  notifications.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        markAsRead(item.id);
                        setNotifOpen(false);
                        if (item.appId !== undefined && item.appId !== null && item.appId !== '') {
                          openQueueApplication(item.appId);
                        }
                        if (onNavigate !== undefined) {
                          onNavigate(item.screen);
                        }
                      }}
                      style={[
                        styles.notifItem,
                        !item.isRead && {
                          backgroundColor: isDark
                            ? 'rgba(59, 130, 246, 0.08)'
                            : 'rgba(59, 130, 246, 0.04)',
                        },
                      ]}
                    >
                      <View style={styles.notifItemIconWrap}>
                        <Lucide
                          name={
                            item.type === 'announcement'
                              ? 'volume-2'
                              : item.type === 'meeting'
                              ? 'video'
                              : item.type === 'chat'
                              ? 'message-square'
                              : 'activity'
                          }
                          size={14}
                          color={
                            item.isRead
                              ? isDark ? '#64748B' : '#94A3B8'
                              : isDark ? colors.brand[400] : colors.brand[600]
                          }
                        />
                      </View>
                      <View style={styles.notifItemContent}>
                        <View style={styles.notifItemHeaderRow}>
                          <Text
                            style={[
                              styles.notifItemTitle,
                              {
                                color: dropdownText,
                                fontWeight: item.isRead
                                  ? TYPOGRAPHY.weights.regular
                                  : TYPOGRAPHY.weights.semibold,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          {!item.isRead && (
                            <View style={[styles.unreadDot, { backgroundColor: colors.brand[500] }]} />
                          )}
                        </View>
                        <Text
                          style={[styles.notifItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}
                          numberOfLines={2}
                        >
                          {item.description}
                        </Text>
                        {item.timestamp !== undefined && (
                          <Text style={[styles.notifItemTime, { color: isDark ? '#64748B' : '#94A3B8' }]}>
                            {formatTimeAgo(item.timestamp)}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
            </>
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
              <>
                <Pressable style={styles.backdrop} onPress={() => setProfileOpen(false)} />
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
              </>
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
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 150,
    backgroundColor: 'transparent',
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
  notifDropdown: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 320,
    maxHeight: 380,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    zIndex: 200,
    overflow: 'hidden',
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  notifHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  unreadBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#3B82F6',
  },
  markAllReadText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  notifList: {
    maxHeight: 320,
  },
  notifEmpty: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  notifEmptyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  notifItem: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    gap: 10,
    alignItems: 'flex-start',
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  notifItemIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  notifItemContent: {
    flex: 1,
  },
  notifItemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  notifItemTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    flex: 1,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  notifItemDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  notifItemTime: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    marginTop: 4,
  },
});

