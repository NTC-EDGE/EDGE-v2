import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform, Image } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, Icon as Lucide, SHADOWS } from '@edge/ui';

const footerLogoAsset = require('../../../../assets/footer-logo.png');
import { UserRole } from '../context/RoleContext';
import { UserProfile as UserProfileType } from '../../auth/context/AuthContext';
import { RoleSwitcher } from './RoleSwitcher';
import { EditAccountModal } from '../../auth/components/EditAccountModal';

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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const profileName = user?.name ?? 'ADMIN Lorilla';
  const profileEmail = user?.email ?? 'admin@edge.gov';

  const getInitials = (name: string) => {
    if (name === 'ADMIN Lorilla') return 'EE';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };


  return (
    <View style={[styles.header, isMobile && styles.headerMobile]}>
      {/* Left side: Hamburger (Mobile) and Title */}
      <View style={styles.leftContainer}>
        {isMobile && (
          <Pressable onPress={onMenuPress} style={styles.menuBtn}>
            <Lucide name="menu" size={20} color={COLORS.neutral.white} />
          </Pressable>
        )}
        <Image
          source={footerLogoAsset}
          style={[styles.headerLogo, isMobile && styles.headerLogoMobile]}
          resizeMode="contain"
        />
      </View>

      {/* Header Controls */}
      <View style={styles.headerControls}>
        {/* Notification Bell */}
        <Pressable style={styles.bellBtn}>
          <Lucide name="bell" size={20} color={COLORS.neutral.white} />
        </Pressable>

        {!isMobile ? (
          <View style={styles.profileWrapper}>
            {/* User Profile Pressable (opens dropdown) */}
            <Pressable
              onPress={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              style={styles.profileContainer}
            >
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profileName}</Text>
                <Text style={styles.profileRole}>{currentRole}</Text>
              </View>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{getInitials(profileName)}</Text>
              </View>
            </Pressable>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <View style={[styles.profileDropdownCard, SHADOWS.modal]}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownName}>{profileName}</Text>
                  <Text style={styles.dropdownEmail}>{profileEmail}</Text>
                </View>

                <View style={styles.dropdownDivider} />

                <Pressable
                  onPress={() => {
                    setIsProfileDropdownOpen(false);
                    setIsSettingsModalOpen(true);
                  }}
                  style={styles.dropdownItemBtn}
                >
                  <Lucide name="settings" size={14} color={COLORS.neutral[700]} />
                  <Text style={styles.dropdownItemText}>Account Settings</Text>
                </Pressable>

                <View style={styles.dropdownDivider} />

                <Text style={styles.dropdownSectionTitle}>Switch Active Role</Text>
                <RoleSwitcher
                  currentRole={currentRole}
                  onRoleSelect={(role) => {
                    onRoleSelect(role);
                    setIsProfileDropdownOpen(false);
                  }}
                  showRoleDropdown={showRoleDropdown}
                  toggleRoleDropdown={toggleRoleDropdown}
                  closeRoleDropdown={closeRoleDropdown}
                  isSwitcherHovered={isSwitcherHovered}
                  setIsSwitcherHovered={setIsSwitcherHovered}
                  variant="dropdown"
                />

                <View style={styles.dropdownDivider} />

                <Pressable
                  onPress={() => {
                    setIsProfileDropdownOpen(false);
                    const result = onLogout();
                    if (result instanceof Promise) {
                      result.catch((error: unknown) => console.error('Logout error:', error));
                    }
                  }}
                  style={styles.dropdownLogoutBtn}
                >
                  <Lucide name="log-out" size={14} color={COLORS.semantic.error} />
                  <Text style={styles.dropdownLogoutText}>Logout</Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          /* Mobile Simplified Profile (toggles sidebar on press) */
          <Pressable onPress={onMenuPress} style={styles.mobileAvatarPressable}>
            <View style={[styles.avatarCircle, { width: 32, height: 32, borderRadius: 16 }]}>
              <Text style={[styles.avatarText, { fontSize: 11 }]}>{getInitials(profileName)}</Text>
            </View>
          </Pressable>
        )}
      </View>
      <EditAccountModal
        visible={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[32],
    zIndex: 100,
    backgroundColor: '#1839B3',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(to right, #0E1B61 0%, #1839B3 50%, #2B56F0 100%)',
        boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  headerMobile: {
    paddingHorizontal: SPACING[16],
    height: 76,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING[16],
    gap: SPACING[12],
  },
  menuBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLogo: {
    height: 60,
    width: 192,
  },
  headerLogoMobile: {
    height: 52,
    width: 166.4,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[16],
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    ...Platform.select({
      web: {
        transition: 'background-color 200ms ease',
        cursor: 'pointer',
      },
    }),
  },
  profileWrapper: {
    position: 'relative',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  profileInfo: {
    alignItems: 'flex-end',
  },
  profileName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  profileRole: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: 2,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00E676', // Premium bright green-blue border from screenshot 2
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 13,
  },
  mobileAvatarPressable: {
    borderRadius: 9999,
    padding: 2,
  },
  profileDropdownCard: {
    position: 'absolute',
    top: 68,
    right: 0,
    width: 250,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
    zIndex: 200,
  },
  dropdownHeader: {
    marginBottom: SPACING[8],
  },
  dropdownName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  dropdownEmail: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginVertical: SPACING[12],
  },
  dropdownSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING[8],
  },
  dropdownLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: SPACING[4],
  },
  dropdownLogoutText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.semantic.error,
  },
  dropdownItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: SPACING[8],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dropdownItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
});

