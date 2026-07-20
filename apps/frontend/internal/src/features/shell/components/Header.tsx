import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, Avatar, Icon as Lucide } from '@edge/ui';
import { UserRole } from '../context/RoleContext';
import { UserProfile as UserProfileType } from '../../auth/context/AuthContext';
import { RoleSwitcher } from './RoleSwitcher';

interface HeaderProps {
  currentRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
  showRoleDropdown: boolean;
  toggleRoleDropdown: () => void;
  closeRoleDropdown: () => void;
  isSwitcherHovered: boolean;
  setIsSwitcherHovered: (hovered: boolean) => void;
  isLogoutHovered: boolean;
  setIsLogoutHovered: (hovered: boolean) => void;
  user: UserProfileType | null;
  onLogout: () => void | Promise<void>;
  isMobile?: boolean;
  onMenuPress?: () => void;
}

export function Header({
  currentRole,
  onRoleSelect,
  showRoleDropdown,
  toggleRoleDropdown,
  closeRoleDropdown,
  isSwitcherHovered,
  setIsSwitcherHovered,
  isLogoutHovered,
  setIsLogoutHovered,
  user,
  onLogout,
  isMobile = false,
  onMenuPress,
}: HeaderProps) {
  const profileName = user?.name ?? 'Staff User';
  const profileEmail = user?.email ?? 'staff@edge.gov';

  return (
    <View style={[styles.header, isMobile && styles.headerMobile]}>
      {/* Left side: Hamburger (Mobile) and Title */}
      <View style={styles.leftContainer}>
        {isMobile && (
          <Pressable onPress={onMenuPress} style={styles.menuBtn}>
            <Lucide name="menu" size={20} color={COLORS.neutral.white} />
          </Pressable>
        )}
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {isMobile ? 'NTC Portal' : 'National Telecommunications Commission'}
        </Text>
      </View>

      {/* Header Controls */}
      <View style={styles.headerControls}>
        {!isMobile ? (
          <>
            {/* Role Switcher */}
            <RoleSwitcher
              currentRole={currentRole}
              onRoleSelect={onRoleSelect}
              showRoleDropdown={showRoleDropdown}
              toggleRoleDropdown={toggleRoleDropdown}
              closeRoleDropdown={closeRoleDropdown}
              isSwitcherHovered={isSwitcherHovered}
              setIsSwitcherHovered={setIsSwitcherHovered}
            />

            {/* Vertical Divider */}
            <View style={styles.divider} />

            {/* User Profile */}
            <View style={styles.profileContainer}>
              <Avatar
                imageUri={user?.avatarUrl}
                name={profileName}
                size="md"
                variant="circle"
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profileName}</Text>
                <Text style={styles.profileEmail}>{profileEmail}</Text>
              </View>
            </View>

            {/* Logout Button */}
            <Pressable
              onPress={() => {
                const result = onLogout();
                if (result instanceof Promise) {
                  result.catch((error: unknown) => console.error('Logout error:', error));
                }
              }}
              onHoverIn={() => setIsLogoutHovered(true)}
              onHoverOut={() => setIsLogoutHovered(false)}
              style={[
                styles.logoutBtn,
                isLogoutHovered && styles.logoutBtnHover,
              ]}
            >
              <Lucide name="log-out" size={16} color={COLORS.neutral.white} />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </>
        ) : (
          /* Mobile Simplified Profile (toggles sidebar on press) */
          <Pressable onPress={onMenuPress} style={styles.mobileAvatarPressable}>
            <Avatar
              imageUri={user?.avatarUrl}
              name={profileName}
              size="sm"
              variant="circle"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[32],
    zIndex: 5,
    backgroundColor: COLORS.brand[900],
    ...Platform.select({
      web: {
        backgroundImage: `linear-gradient(135deg, ${COLORS.brand[900]} 0%, ${COLORS.brand[800]} 100%)`,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  headerMobile: {
    paddingHorizontal: SPACING[16],
    height: 64,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING[16],
  },
  menuBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
    letterSpacing: 0.5,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: SPACING[20],
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: SPACING[12],
    marginRight: SPACING[20],
  },
  profileName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  profileEmail: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.input,
    ...Platform.select({
      web: {
        transition: 'all 200ms ease-out',
        cursor: 'pointer',
      },
    }),
  },
  logoutBtnHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral.white,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginLeft: 8,
  },
  mobileAvatarPressable: {
    borderRadius: 9999,
    padding: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

