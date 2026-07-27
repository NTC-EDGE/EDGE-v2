import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  useWindowDimensions,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, useNavigation, NavigationProp } from '@edge/ui';
import { useAuthContext } from '../../auth/context/AuthContext';
import { REGIONS_LIST } from '../../employees/data/mockEmployees';
import { useRole, ROLES, UserRole } from '../../shell/context/RoleContext';

type TabType = 'profile' | 'security' | 'appearance' | 'support';

type AuthParamList = {
  Dashboard: undefined;
  AccountSettings: undefined;
};

type UserResourceType = NonNullable<ReturnType<typeof useAuthContext>['clerkUser']>;
type EmailAddressResourceType = ReturnType<UserResourceType['createEmailAddress']> extends Promise<infer T> ? T : never;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  
  if (typeof error === 'object' && error !== null) {
    const errors = Reflect.get(error, 'errors');
    if (Array.isArray(errors) && errors.length > 0) {
      const firstError: unknown = errors[0];
      if (typeof firstError === 'object' && firstError !== null) {
        const msg = Reflect.get(firstError, 'message');
        if (typeof msg === 'string') {
          return msg;
        }
      }
    }
    const message = Reflect.get(error, 'message');
    if (typeof message === 'string') return message;
  }
  return 'An error occurred. Please try again.';
}

export function SettingsScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { clerkUser, user } = useAuthContext();
  const { currentRole, setCurrentRole } = useRole();
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (!isEditingProfile) {
      setSelectedRole(currentRole);
    }
  }, [currentRole, isEditingProfile]);

  const handleBackToDashboard = () => {
    if (typeof navigation === 'object' && navigation !== null) {
      const navigateFunc = Reflect.get(navigation, 'navigate');
      if (typeof navigateFunc === 'function') {
        Reflect.apply(navigateFunc, navigation, ['Dashboard']);
      }
    }
  };

  // Profile Inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  
  // Custom metadata (persisted in local state/storage for demonstration)
  const [position, setPosition] = useState('admin');
  const [department, setDepartment] = useState('admin');
  const [designation, setDesignation] = useState('admin');
  const [phone, setPhone] = useState('09123456789');

  // Profile state flags
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Email verification flow states
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmailResource, setPendingEmailResource] = useState<EmailAddressResourceType | null>(null);

  // Security Inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  // Security visibility state
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Security status messages
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  // Appearance Settings
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [reduceMotion, setReduceMotion] = useState(false);

  // Initialize profile values from Clerk context
  useEffect(() => {
    if (clerkUser !== null && clerkUser !== undefined) {
      setFirstName(clerkUser.firstName ?? '');
      setLastName(clerkUser.lastName ?? '');
      setUsername(clerkUser.username ?? '');
      setEmail(clerkUser.primaryEmailAddress?.emailAddress ?? '');

      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        setPosition(window.localStorage.getItem('edge-settings-position') ?? 'admin');
        setDepartment(window.localStorage.getItem('edge-settings-department') ?? 'admin');
        setDesignation(window.localStorage.getItem('edge-settings-designation') ?? 'admin');
        setPhone(window.localStorage.getItem('edge-settings-phone') ?? '09123456789');
        setSelectedRegion(window.localStorage.getItem('edge-settings-region') ?? 'Central Office (Headquarters)');
        
        const savedTheme = window.localStorage.getItem('edge-settings-theme') as 'light' | 'dark' | null;
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setTheme(savedTheme);
        }
        
        setReduceMotion(window.localStorage.getItem('edge-settings-reduce-motion') === 'true');
      } else {
        setSelectedRegion('Central Office (Headquarters)');
      }
    }
  }, [clerkUser]);

  // Password checklist calculations
  const pChecklist = useMemo(() => {
    const hasMinLength = newPassword.length >= 8;
    const hasUpperAndLower = /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    
    let strengthText = 'Weak';
    let strengthColor: string = COLORS.semantic.error;
    let strengthProgress = 0.33;
    
    const count = (hasMinLength ? 1 : 0) + (hasUpperAndLower ? 1 : 0) + (hasNumber ? 1 : 0);
    
    if (newPassword.length === 0) {
      strengthText = 'None';
      strengthColor = COLORS.neutral[300];
      strengthProgress = 0;
    } else if (count === 2) {
      strengthText = 'Medium';
      strengthColor = '#F59E0B'; // Amber
      strengthProgress = 0.66;
    } else if (count === 3) {
      strengthText = 'Strong';
      strengthColor = COLORS.semantic.success;
      strengthProgress = 1.0;
    }
    
    return {
      hasMinLength,
      hasUpperAndLower,
      hasNumber,
      strengthText,
      strengthColor,
      strengthProgress,
    };
  }, [newPassword]);

  // Save profile edits
  const handleSaveProfile = async () => {
    if (clerkUser === null || clerkUser === undefined) {
      setProfileError('Authentication session not loaded.');
      return;
    }

    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const profileChanged =
        firstName !== (clerkUser.firstName ?? '') ||
        lastName !== (clerkUser.lastName ?? '') ||
        username !== (clerkUser.username ?? '');

      if (profileChanged) {
        await clerkUser.update({
          firstName,
          lastName,
          username: username || undefined,
        });
      }

      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('edge-settings-position', position);
        window.localStorage.setItem('edge-settings-department', department);
        window.localStorage.setItem('edge-settings-designation', designation);
        window.localStorage.setItem('edge-settings-phone', phone);
      }

      const currentEmail = clerkUser.primaryEmailAddress?.emailAddress ?? '';
      if (email !== currentEmail) {
        const emailRes = await clerkUser.createEmailAddress({ email });
        await emailRes.prepareVerification({ strategy: 'email_code' });
        setPendingEmailResource(emailRes as EmailAddressResourceType);
        setVerificationPending(true);
        setProfileLoading(false);
        return;
      }

      setCurrentRole(selectedRole);
      setIsRoleDropdownOpen(false);
      setProfileSuccess('Profile details updated successfully.');
      setIsEditingProfile(false);
    } catch (err: unknown) {
      setProfileError(getErrorMessage(err));
    } finally {
      if (email === (clerkUser.primaryEmailAddress?.emailAddress ?? '')) {
        setProfileLoading(false);
      }
    }
  };

  // Confirm email OTP code
  const handleVerifyEmail = async () => {
    if (pendingEmailResource === null || pendingEmailResource === undefined) {
      setProfileError('No email verification process pending.');
      return;
    }
    if (clerkUser === null || clerkUser === undefined) {
      setProfileError('Authentication session not loaded.');
      return;
    }

    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      await pendingEmailResource.attemptVerification({ code: verificationCode });
      await clerkUser.update({ primaryEmailAddressId: pendingEmailResource.id });
      
      setProfileSuccess('Email address updated and verified successfully.');
      setVerificationPending(false);
      setPendingEmailResource(null);
      setVerificationCode('');
      setIsEditingProfile(false);
    } catch (err: unknown) {
      setProfileError(getErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  };

  // Save new password and region
  const handleSaveSecurity = async () => {
    setSecurityError('');
    setSecuritySuccess('');

    if (clerkUser === null || clerkUser === undefined) {
      setSecurityError('Authentication session not loaded.');
      return;
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('edge-settings-region', selectedRegion);
    }

    if (currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0) {
      if (currentPassword.length === 0) {
        setSecurityError('Please enter your current password.');
        return;
      }
      if (newPassword.length === 0) {
        setSecurityError('Please enter your new password.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setSecurityError('New password and confirmation do not match.');
        return;
      }
      if (!pChecklist.hasMinLength || !pChecklist.hasUpperAndLower || !pChecklist.hasNumber) {
        setSecurityError('Please meet all password requirements.');
        return;
      }

      setSecurityLoading(true);
      try {
        await clerkUser.updatePassword({
          currentPassword,
          newPassword,
        });
        setSecuritySuccess('Security settings and password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (err: unknown) {
        setSecurityError(getErrorMessage(err));
      } finally {
        setSecurityLoading(false);
      }
    } else {
      setSecuritySuccess('Security settings updated successfully.');
    }
  };

  // Toggle local theme selection
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('edge-settings-theme', newTheme);
    }
  };

  // Toggle reduce motion setting
  const handleReduceMotionChange = (val: boolean) => {
    setReduceMotion(val);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('edge-settings-reduce-motion', val ? 'true' : 'false');
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      const first = parts[0]?.charAt(0) ?? '';
      const second = parts[1]?.charAt(0) ?? '';
      return `${first}${second}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const profileName = user?.name ?? 'Staff User';
  const activeRoleName = selectedRole;

  return (
    <View style={styles.container}>
      
      {/* Left Settings Sidebar (Desktop Only) */}
      {!isMobile && (
        <View style={styles.sidebar}>
          
          {/* User Profile Block */}
          <View style={styles.sidebarHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials(profileName)}</Text>
            </View>
            <View style={styles.sidebarHeaderInfo}>
              <Text style={styles.sidebarName} numberOfLines={1}>
                {profileName}
              </Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{activeRoleName}</Text>
              </View>
            </View>
          </View>

          {/* Navigation Links */}
          <View style={styles.sidebarMenu}>
            <Pressable
              style={[styles.sidebarItem, activeTab === 'profile' && styles.sidebarItemActive]}
              onPress={() => setActiveTab('profile')}
            >
              <Lucide name="user" size={16} color={activeTab === 'profile' ? '#1E3A8A' : '#64748B'} style={{ marginRight: 12 }} />
              <Text style={[styles.sidebarItemText, activeTab === 'profile' && styles.sidebarItemTextActive]}>
                Profile
              </Text>
            </Pressable>

            <Pressable
              style={[styles.sidebarItem, activeTab === 'security' && styles.sidebarItemActive]}
              onPress={() => setActiveTab('security')}
            >
              <Lucide name="shield" size={16} color={activeTab === 'security' ? '#1E3A8A' : '#64748B'} style={{ marginRight: 12 }} />
              <Text style={[styles.sidebarItemText, activeTab === 'security' && styles.sidebarItemTextActive]}>
                Security
              </Text>
            </Pressable>

            <Pressable
              style={[styles.sidebarItem, activeTab === 'appearance' && styles.sidebarItemActive]}
              onPress={() => setActiveTab('appearance')}
            >
              <Lucide name="aperture" size={16} color={activeTab === 'appearance' ? '#1E3A8A' : '#64748B'} style={{ marginRight: 12 }} />
              <Text style={[styles.sidebarItemText, activeTab === 'appearance' && styles.sidebarItemTextActive]}>
                Appearance
              </Text>
            </Pressable>

            <Pressable
              style={[styles.sidebarItem, activeTab === 'support' && styles.sidebarItemActive]}
              onPress={() => setActiveTab('support')}
            >
              <Lucide name="info" size={16} color={activeTab === 'support' ? '#1E3A8A' : '#64748B'} style={{ marginRight: 12 }} />
              <Text style={[styles.sidebarItemText, activeTab === 'support' && styles.sidebarItemTextActive]}>
                Help & Support
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Right Content Area */}
      <View style={styles.rightContentContainer}>
        
        {/* Mobile segmented horizontal tab bar */}
        {isMobile && (
          <View style={styles.mobileTabBarWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileTabBar}>
              <Pressable
                style={[styles.mobileTabItem, activeTab === 'profile' && styles.mobileTabItemActive]}
                onPress={() => setActiveTab('profile')}
              >
                <Lucide name="user" size={14} color={activeTab === 'profile' ? '#1E3A8A' : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={[styles.mobileTabItemText, activeTab === 'profile' && styles.mobileTabItemTextActive]}>
                  Profile
                </Text>
              </Pressable>

              <Pressable
                style={[styles.mobileTabItem, activeTab === 'security' && styles.mobileTabItemActive]}
                onPress={() => setActiveTab('security')}
              >
                <Lucide name="shield" size={14} color={activeTab === 'security' ? '#1E3A8A' : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={[styles.mobileTabItemText, activeTab === 'security' && styles.mobileTabItemTextActive]}>
                  Security
                </Text>
              </Pressable>

              <Pressable
                style={[styles.mobileTabItem, activeTab === 'appearance' && styles.mobileTabItemActive]}
                onPress={() => setActiveTab('appearance')}
              >
                <Lucide name="aperture" size={14} color={activeTab === 'appearance' ? '#1E3A8A' : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={[styles.mobileTabItemText, activeTab === 'appearance' && styles.mobileTabItemTextActive]}>
                  Appearance
                </Text>
              </Pressable>

              <Pressable
                style={[styles.mobileTabItem, activeTab === 'support' && styles.mobileTabItemActive]}
                onPress={() => setActiveTab('support')}
              >
                <Lucide name="info" size={14} color={activeTab === 'support' ? '#1E3A8A' : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={[styles.mobileTabItemText, activeTab === 'support' && styles.mobileTabItemTextActive]}>
                  Help & Support
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        )}

        <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.contentScrollContainer}>
          
          <View style={styles.innerContentWrapper}>
            {/* Top Navigation Row (Back button & Breadcrumbs) */}
            <View style={styles.topNavRow}>
              <Pressable style={styles.backBtn} onPress={handleBackToDashboard}>
                <Lucide name="arrow-left" size={16} color={COLORS.brand[700]} style={{ marginRight: 6 }} />
                <Text style={styles.backBtnText}>Back to Dashboard</Text>
              </Pressable>
              
              <View style={styles.breadcrumb}>
                <Text style={styles.breadcrumbText}>Admin</Text>
                <Lucide name="chevron-right" size={12} color={COLORS.neutral[400]} style={styles.breadcrumbDivider} />
                <Text style={styles.breadcrumbText}>Dashboard</Text>
                <Lucide name="chevron-right" size={12} color={COLORS.neutral[400]} style={styles.breadcrumbDivider} />
                <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>Account Settings</Text>
              </View>
            </View>

            {/* TAB CONTENT: PROFILE */}
            {activeTab === 'profile' && (
              <View style={styles.tabContentGroup}>
                <View style={styles.contentHeaderRow}>
                  <View>
                    <Text style={styles.contentTitle}>Account Settings</Text>
                    <Text style={styles.contentSubtitle}>
                      Manage your profile details and personnel information.
                    </Text>
                  </View>

                  {!verificationPending && (
                    <Pressable
                      style={[styles.outlineBtn, isEditingProfile && styles.outlineBtnActive]}
                      onPress={() => {
                        if (isEditingProfile) {
                          setIsEditingProfile(false);
                          setSelectedRole(currentRole);
                          setIsRoleDropdownOpen(false);
                          setFirstName(clerkUser?.firstName ?? '');
                          setLastName(clerkUser?.lastName ?? '');
                          setUsername(clerkUser?.username ?? '');
                          setEmail(clerkUser?.primaryEmailAddress?.emailAddress ?? '');
                          setProfileError('');
                          setProfileSuccess('');
                        } else {
                          setIsEditingProfile(true);
                        }
                      }}
                    >
                      <Text style={[styles.outlineBtnText, isEditingProfile && styles.outlineBtnTextActive]}>
                        {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                      </Text>
                    </Pressable>
                  )}
                </View>

                {profileError.length > 0 && (
                  <View style={styles.errorBox}>
                    <Lucide name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 8 }} />
                    <Text style={styles.errorText}>{profileError}</Text>
                  </View>
                )}

                {profileSuccess.length > 0 && (
                  <View style={styles.successBox}>
                    <Lucide name="check-circle" size={16} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={styles.successText}>{profileSuccess}</Text>
                  </View>
                )}

                {!verificationPending ? (
                  <View style={styles.formLayout}>
                    {/* Account Details */}
                    <View style={styles.innerCard}>
                      <Text style={styles.innerCardHeading}>Account Details</Text>
                      <View style={styles.dropdownContainer}>
                        <Text style={styles.fieldLabel}>User Role</Text>
                        <Pressable
                          style={[
                            styles.dropdownSelector,
                            !isEditingProfile && styles.disabledInput,
                          ]}
                          onPress={() => {
                            if (isEditingProfile) {
                              setIsRoleDropdownOpen(!isRoleDropdownOpen);
                            }
                          }}
                          disabled={!isEditingProfile}
                        >
                          <Text
                            style={[
                              styles.dropdownSelectorText,
                              !isEditingProfile && styles.disabledInputText,
                            ]}
                          >
                            {selectedRole}
                          </Text>
                          <Lucide
                            name={isRoleDropdownOpen ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color={isEditingProfile ? COLORS.neutral[600] : COLORS.neutral[400]}
                          />
                        </Pressable>

                        {isEditingProfile && isRoleDropdownOpen && (
                          <View style={[styles.dropdownList, SHADOWS.card]}>
                            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                              {ROLES.map((roleOption) => {
                                const isSelected = selectedRole === roleOption;
                                return (
                                  <Pressable
                                    key={roleOption}
                                    style={[
                                      styles.dropdownItem,
                                      isSelected && styles.dropdownItemActive,
                                    ]}
                                    onPress={() => {
                                      setSelectedRole(roleOption);
                                      setIsRoleDropdownOpen(false);
                                    }}
                                  >
                                    <Text
                                      style={[
                                        styles.dropdownItemText,
                                        isSelected && styles.dropdownItemTextActive,
                                      ]}
                                    >
                                      {roleOption}
                                    </Text>
                                    {isSelected && (
                                      <Lucide name="check" size={14} color="#1E3A8A" />
                                    )}
                                  </Pressable>
                                );
                              })}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Personal Info */}
                    <View style={styles.innerCard}>
                      <Text style={styles.innerCardHeading}>Personal Information</Text>
                      <View style={styles.formGrid}>
                        <View style={[styles.gridCol, isMobile && styles.gridColMobile]}>
                          <Text style={styles.fieldLabel}>Full Name</Text>
                          <TextInput
                            value={`${firstName} ${lastName}`.trim()}
                            onChangeText={(val) => {
                              const parts = val.split(' ');
                              setFirstName(parts[0] ?? '');
                              setLastName(parts.slice(1).join(' '));
                            }}
                            editable={isEditingProfile}
                            placeholder="Full Name"
                            style={[styles.inputField, !isEditingProfile && styles.disabledInput]}
                          />
                        </View>

                        <View style={[styles.gridCol, isMobile && styles.gridColMobile]}>
                          <Text style={styles.fieldLabel}>Position</Text>
                          <TextInput
                            value={position}
                            onChangeText={setPosition}
                            editable={isEditingProfile}
                            placeholder="Position"
                            style={[styles.inputField, !isEditingProfile && styles.disabledInput]}
                          />
                        </View>

                        <View style={[styles.gridCol, isMobile && styles.gridColMobile]}>
                          <Text style={styles.fieldLabel}>Department/Division</Text>
                          <TextInput
                            value={department}
                            onChangeText={setDepartment}
                            editable={isEditingProfile}
                            placeholder="Department"
                            style={[styles.inputField, !isEditingProfile && styles.disabledInput]}
                          />
                        </View>

                        <View style={[styles.gridCol, isMobile && styles.gridColMobile]}>
                          <Text style={styles.fieldLabel}>Designation</Text>
                          <TextInput
                            value={designation}
                            onChangeText={setDesignation}
                            editable={isEditingProfile}
                            placeholder="Designation"
                            style={[styles.inputField, !isEditingProfile && styles.disabledInput]}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Contact Info */}
                    <View style={styles.innerCard}>
                      <Text style={styles.innerCardHeading}>Contact Information</Text>
                      <View style={styles.formGrid}>
                        <View style={[styles.gridCol, isMobile && styles.gridColMobile]}>
                          <Text style={styles.fieldLabel}>Official Email</Text>
                          <TextInput
                            value={email}
                            onChangeText={setEmail}
                            editable={isEditingProfile}
                            placeholder="email@edge.gov"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={[styles.inputField, !isEditingProfile && styles.disabledInput]}
                          />
                        </View>

                        <View style={[styles.gridCol, isMobile && styles.gridColMobile]}>
                          <Text style={styles.fieldLabel}>Phone Number</Text>
                          <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            editable={isEditingProfile}
                            placeholder="Phone number"
                            keyboardType="phone-pad"
                            style={[styles.inputField, !isEditingProfile && styles.disabledInput]}
                          />
                        </View>
                      </View>
                    </View>

                    {isEditingProfile && (
                      <Pressable
                        style={[styles.primaryBtn, profileLoading && styles.disabledBtn]}
                        onPress={handleSaveProfile}
                        disabled={profileLoading}
                      >
                        {profileLoading ? (
                          <ActivityIndicator size="small" color={COLORS.neutral.white} />
                        ) : (
                          <Text style={styles.primaryBtnText}>Save Changes</Text>
                        )}
                      </Pressable>
                    )}
                  </View>
                ) : (
                  /* Verification OTP */
                  <View style={styles.verificationContainer}>
                    <View style={styles.verificationIntro}>
                      <View style={styles.verificationIconBg}>
                        <Lucide name="mail" size={24} color="#1E3A8A" />
                      </View>
                      <Text style={styles.verifyTitle}>Verify Email Address</Text>
                      <Text style={styles.verifyDescription}>
                        A verification code was dispatched to {email}. To save changes, enter it below.
                      </Text>
                    </View>

                    <View style={styles.verifyField}>
                      <Text style={styles.fieldLabel}>Verification Code</Text>
                      <TextInput
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        placeholder="Enter 6-digit OTP"
                        keyboardType="number-pad"
                        maxLength={6}
                        style={styles.inputField}
                      />
                    </View>

                    <Pressable
                      style={[styles.primaryBtn, profileLoading && styles.disabledBtn]}
                      onPress={handleVerifyEmail}
                      disabled={profileLoading}
                    >
                      {profileLoading ? (
                        <ActivityIndicator size="small" color={COLORS.neutral.white} />
                      ) : (
                        <Text style={styles.primaryBtnText}>Confirm Code & Verify</Text>
                      )}
                    </Pressable>

                    <Pressable
                      style={styles.verifyCancelBtn}
                      onPress={() => {
                        setVerificationPending(false);
                        setPendingEmailResource(null);
                        setVerificationCode('');
                        setProfileError('');
                        setProfileSuccess('');
                      }}
                    >
                      <Text style={styles.verifyCancelText}>Cancel & Go Back</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}

            {/* TAB CONTENT: SECURITY */}
            {activeTab === 'security' && (
              <View style={styles.tabContentGroup}>
                <View style={styles.contentHeaderRow}>
                  <View>
                    <Text style={styles.contentTitle}>Security</Text>
                    <Text style={styles.contentSubtitle}>
                      Manage your password and account security settings.
                    </Text>
                  </View>
                </View>

                {securityError.length > 0 && (
                  <View style={styles.errorBox}>
                    <Lucide name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 8 }} />
                    <Text style={styles.errorText}>{securityError}</Text>
                  </View>
                )}

                {securitySuccess.length > 0 && (
                  <View style={styles.successBox}>
                    <Lucide name="check-circle" size={16} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={styles.successText}>{securitySuccess}</Text>
                  </View>
                )}

                <View style={styles.formLayout}>
                  <View style={styles.innerCard}>
                    <Text style={styles.innerCardHeading}>Administrative Region</Text>
                    <View style={styles.dropdownContainer}>
                      <Text style={styles.fieldLabel}>Region</Text>
                      <Pressable
                        style={styles.dropdownSelector}
                        onPress={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                      >
                        <Text style={styles.dropdownSelectorText}>{selectedRegion}</Text>
                        <Lucide name={isRegionDropdownOpen ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.neutral[500]} />
                      </Pressable>

                      {isRegionDropdownOpen && (
                        <View style={[styles.dropdownList, SHADOWS.modal]}>
                          <ScrollView style={{ maxHeight: 220 }}>
                            {REGIONS_LIST.map((reg) => {
                              const isSelected = selectedRegion === reg;
                              return (
                                <Pressable
                                  key={reg}
                                  style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                                  onPress={() => {
                                    setSelectedRegion(reg);
                                    setIsRegionDropdownOpen(false);
                                  }}
                                >
                                  <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}>
                                    {reg}
                                  </Text>
                                  {isSelected && (
                                    <Lucide name="check" size={14} color="#1E3A8A" />
                                  )}
                                </Pressable>
                              );
                            })}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.innerCard}>
                    <Text style={styles.innerCardHeading}>Update Password</Text>
                    
                    <View style={styles.formRow}>
                      <View style={styles.inputWrapperFull}>
                        <Text style={styles.fieldLabel}>Old password</Text>
                        <View style={styles.inputWithIcon}>
                          <TextInput
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Old password"
                            secureTextEntry={!showCurrentPass}
                            autoCapitalize="none"
                            style={styles.inputWithIconField}
                          />
                          <Pressable onPress={() => setShowCurrentPass(!showCurrentPass)} style={styles.eyeBtn}>
                            <Lucide name={showCurrentPass ? 'eye-off' : 'eye'} size={18} color={COLORS.neutral[500]} />
                          </Pressable>
                        </View>
                      </View>
                    </View>

                    <View style={styles.formRow}>
                      <View style={styles.inputWrapperFull}>
                        <Text style={styles.fieldLabel}>New password</Text>
                        <View style={styles.inputWithIcon}>
                          <TextInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="New password"
                            secureTextEntry={!showNewPass}
                            autoCapitalize="none"
                            style={styles.inputWithIconField}
                          />
                          <Pressable onPress={() => setShowNewPass(!showNewPass)} style={styles.eyeBtn}>
                            <Lucide name={showNewPass ? 'eye-off' : 'eye'} size={18} color={COLORS.neutral[500]} />
                          </Pressable>
                        </View>
                      </View>
                    </View>

                    {/* Requirements checklist */}
                    <View style={styles.checklistCard}>
                      <Text style={styles.checklistTitle}>Your password must have:</Text>
                      
                      <View style={styles.checkItem}>
                        <Lucide
                          name={pChecklist.hasMinLength ? 'check-square' : 'square'}
                          size={16}
                          color={pChecklist.hasMinLength ? COLORS.semantic.success : COLORS.neutral[400]}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={[styles.checkText, pChecklist.hasMinLength && styles.checkTextActive]}>
                          8 or more characters
                        </Text>
                      </View>

                      <View style={styles.checkItem}>
                        <Lucide
                          name={pChecklist.hasUpperAndLower ? 'check-square' : 'square'}
                          size={16}
                          color={pChecklist.hasUpperAndLower ? COLORS.semantic.success : COLORS.neutral[400]}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={[styles.checkText, pChecklist.hasUpperAndLower && styles.checkTextActive]}>
                          Uppercase and lowercase letters
                        </Text>
                      </View>

                      <View style={styles.checkItem}>
                        <Lucide
                          name={pChecklist.hasNumber ? 'check-square' : 'square'}
                          size={16}
                          color={pChecklist.hasNumber ? COLORS.semantic.success : COLORS.neutral[400]}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={[styles.checkText, pChecklist.hasNumber && styles.checkTextActive]}>
                          At least one number
                        </Text>
                      </View>

                      {newPassword.length > 0 && (
                        <View style={styles.strengthWrapper}>
                          <View style={styles.strengthTextRow}>
                            <Text style={styles.strengthLabel}>Strength:</Text>
                            <Text style={[styles.strengthValue, { color: pChecklist.strengthColor }]}>
                              {pChecklist.strengthText}
                            </Text>
                          </View>
                          <View style={styles.strengthTrack}>
                            <View
                              style={[
                                styles.strengthFill,
                                {
                                  width: `${pChecklist.strengthProgress * 100}%`,
                                  backgroundColor: pChecklist.strengthColor,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      )}
                    </View>

                    <View style={styles.formRow}>
                      <View style={styles.inputWrapperFull}>
                        <Text style={styles.fieldLabel}>Confirm new password</Text>
                        <View style={styles.inputWithIcon}>
                          <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm new password"
                            secureTextEntry={!showConfirmPass}
                            autoCapitalize="none"
                            style={styles.inputWithIconField}
                          />
                          <Pressable onPress={() => setShowConfirmPass(!showConfirmPass)} style={styles.eyeBtn}>
                            <Lucide name={showConfirmPass ? 'eye-off' : 'eye'} size={18} color={COLORS.neutral[500]} />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>

                  <Pressable
                    style={[styles.primaryBtn, securityLoading && styles.disabledBtn]}
                    onPress={handleSaveSecurity}
                    disabled={securityLoading}
                  >
                    {securityLoading ? (
                      <ActivityIndicator size="small" color={COLORS.neutral.white} />
                    ) : (
                      <Text style={styles.primaryBtnText}>Change Password</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            )}

            {/* TAB CONTENT: APPEARANCE */}
            {activeTab === 'appearance' && (
              <View style={styles.tabContentGroup}>
                <View style={styles.contentHeaderRow}>
                  <View>
                    <Text style={styles.contentTitle}>Appearance</Text>
                    <Text style={styles.contentSubtitle}>
                      Customize the look and feel of your account.
                    </Text>
                  </View>
                </View>

                <View style={styles.formLayout}>
                  <View style={styles.innerCard}>
                    <Text style={styles.innerCardHeading}>Theme</Text>
                    
                    <Pressable
                      style={[styles.radioRow, theme === 'light' && styles.radioRowSelected]}
                      onPress={() => handleThemeChange('light')}
                    >
                      <View style={styles.radioOuter}>
                        {theme === 'light' && <View style={styles.radioInner} />}
                      </View>
                      <View>
                        <Text style={styles.radioTitle}>Light</Text>
                        <Text style={styles.radioDesc}>Standard light UI colors optimized for readability.</Text>
                      </View>
                    </Pressable>

                    <Pressable
                      style={[styles.radioRow, theme === 'dark' && styles.radioRowSelected]}
                      onPress={() => handleThemeChange('dark')}
                    >
                      <View style={styles.radioOuter}>
                        {theme === 'dark' && <View style={styles.radioInner} />}
                      </View>
                      <View>
                        <Text style={styles.radioTitle}>Dark</Text>
                        <Text style={styles.radioDesc}>Sleek dark theme optimized for low-light environments.</Text>
                      </View>
                    </Pressable>
                  </View>

                  <View style={styles.innerCard}>
                    <View style={styles.switchRow}>
                      <View style={styles.switchInfo}>
                        <Text style={styles.switchTitle}>Reduce Motion</Text>
                        <Text style={styles.switchDesc}>Limit animations and layout transitions across navigation.</Text>
                      </View>
                      <Switch
                        value={reduceMotion}
                        onValueChange={handleReduceMotionChange}
                        trackColor={{ false: COLORS.neutral[200], true: '#1E3A8A' }}
                        thumbColor={COLORS.neutral.white}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* TAB CONTENT: SUPPORT */}
            {activeTab === 'support' && (
              <View style={styles.tabContentGroup}>
                <View style={styles.contentHeaderRow}>
                  <View>
                    <Text style={styles.contentTitle}>Help & Support</Text>
                    <Text style={styles.contentSubtitle}>
                      Find resources and get in touch with us.
                    </Text>
                  </View>
                </View>

                <View style={styles.formLayout}>
                  <View style={styles.innerCard}>
                    <View style={styles.helpCenterHeader}>
                      <Text style={styles.innerCardHeading}>Help Center</Text>
                      <Pressable style={styles.supportLinkBtn}>
                        <Text style={styles.supportLinkBtnText}>Get Support Anytime</Text>
                      </Pressable>
                    </View>
                    
                    <Text style={styles.supportDescText}>
                      Need help? Our Help Center provides quick answers to common questions and guides you through using the system.
                    </Text>
                    
                    <View style={styles.bulletList}>
                      <View style={styles.bulletRow}>
                        <View style={styles.bulletPoint} />
                        <Text style={styles.bulletText}>Account and Login Issues</Text>
                      </View>

                      <View style={styles.bulletRow}>
                        <View style={styles.bulletPoint} />
                        <Text style={styles.bulletText}>Password Recovery</Text>
                      </View>

                      <View style={styles.bulletRow}>
                        <View style={styles.bulletPoint} />
                        <Text style={styles.bulletText}>Submitting Service Requests</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.innerCard}>
                    <Text style={styles.innerCardHeading}>Contact Support</Text>
                    <Text style={styles.supportEmail}>ntc.edge@gmail.com</Text>

                    <View style={styles.commitmentBox}>
                      <Text style={styles.commitmentHeading}>Response Commitment</Text>
                      <Text style={styles.commitmentBody}>
                        We aim to resolve all inquiries quickly, with most responses sent within 24-48 hours.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    width: '100%',
    height: '100%',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    padding: 32,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F2B92', // Dark blue matching SU avatar circle exactly
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  sidebarHeaderInfo: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  sidebarName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF', // light blue background badge
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1E3A8A', // blue badge text
  },
  sidebarMenu: {
    gap: 8,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 150ms ease-out',
      },
    }),
  },
  sidebarItemActive: {
    backgroundColor: '#EEF2FF', // Active state background matching screen 1 exactly
  },
  sidebarItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: '#475569',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  sidebarItemTextActive: {
    color: '#1E3A8A', // Active blue color text
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  rightContentContainer: {
    flex: 1,
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  contentScrollView: {
    flex: 1,
  },
  contentScrollContainer: {
    paddingHorizontal: 40,
    paddingVertical: 32,
    alignItems: 'center',
  },
  innerContentWrapper: {
    width: '100%',
    maxWidth: 1000,
    gap: 24,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  backBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[800],
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
  },
  breadcrumbActive: {
    color: COLORS.neutral[800],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  breadcrumbDivider: {
    marginHorizontal: 8,
  },
  tabContentGroup: {
    gap: 24,
    width: '100%',
  },
  contentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 20,
    marginBottom: 4,
    gap: 16,
    width: '100%',
  },
  contentTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: 6,
  },
  contentSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
    lineHeight: 20,
  },
  outlineBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: RADIUS.button,
    borderWidth: 1.5,
    borderColor: COLORS.brand[700],
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 200ms ease-out',
      },
    }),
  },
  outlineBtnActive: {
    backgroundColor: COLORS.neutral[100],
  },
  outlineBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  outlineBtnTextActive: {
    color: COLORS.neutral[700],
  },
  formLayout: {
    gap: 20,
    width: '100%',
  },
  innerCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: 24,
    gap: 16,
    width: '100%',
  },
  innerCardHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 8,
  },
  formRow: {
    width: '100%',
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  gridCol: {
    width: '48%',
    flexGrow: 1,
    minWidth: 220,
  },
  gridColMobile: {
    width: '100%',
  },
  inputWrapperFull: {
    width: '100%',
  },
  fieldLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[500],
    marginBottom: 8,
  },
  inputField: {
    height: 48,
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.neutral[900],
    fontFamily: TYPOGRAPHY.fonts.primary,
    width: '100%',
  },
  disabledInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    color: COLORS.neutral[500],
  },
  disabledInputText: {
    color: COLORS.neutral[500],
  },
  inputWithIcon: {
    position: 'relative',
    justifyContent: 'center',
    height: 48,
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.input,
    width: '100%',
  },
  inputWithIconField: {
    height: '100%',
    paddingLeft: 16,
    paddingRight: 48,
    fontSize: 14,
    color: COLORS.neutral[900],
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 12,
    padding: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  primaryBtn: {
    height: 48,
    backgroundColor: COLORS.brand[800],
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    width: '100%',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 200ms ease-out',
      },
    }),
  },
  disabledBtn: {
    opacity: 0.6,
  },
  primaryBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.semantic.errorBg,
    borderColor: COLORS.semantic.errorBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    width: '100%',
  },
  errorText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.semantic.error,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.semantic.successBg,
    borderColor: COLORS.semantic.successBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    width: '100%',
  },
  successText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.semantic.success,
  },
  verificationContainer: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: 32,
    alignItems: 'center',
    gap: 20,
    maxWidth: 500,
    alignSelf: 'center',
    marginTop: 20,
    width: '100%',
  },
  verificationIntro: {
    alignItems: 'center',
    gap: 8,
  },
  verificationIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifyTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  verifyDescription: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  verifyField: {
    width: '100%',
  },
  verifyCancelBtn: {
    paddingVertical: 10,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  verifyCancelText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  dropdownContainer: {
    width: '100%',
    position: 'relative',
    zIndex: 100,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
  },
  dropdownSelectorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[900],
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
  },
  dropdownItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[700],
  },
  dropdownItemTextActive: {
    color: '#1E3A8A',
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  checklistCard: {
    backgroundColor: '#FAFAFC',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 8,
    padding: 16,
    gap: 8,
    width: '100%',
  },
  checklistTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[500],
    marginBottom: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[400],
  },
  checkTextActive: {
    color: COLORS.semantic.success,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  strengthWrapper: {
    marginTop: 12,
    gap: 6,
  },
  strengthTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strengthLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  strengthValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  strengthTrack: {
    height: 4,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.neutral[200],
    borderRadius: 8,
    gap: 12,
    width: '100%',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  radioRowSelected: {
    borderColor: '#1E3A8A',
    backgroundColor: 'rgba(37, 99, 235, 0.02)',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.neutral[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E3A8A',
  },
  radioTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#1E293B',
  },
  radioDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  switchDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 4,
    lineHeight: 16,
  },
  helpCenterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 8,
    width: '100%',
  },
  supportLinkBtn: {
    paddingVertical: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  supportLinkBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1E3A8A',
  },
  supportDescText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
    lineHeight: 20,
  },
  bulletList: {
    gap: 8,
    marginTop: 8,
    width: '100%',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.neutral[400],
  },
  bulletText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
  },
  supportEmail: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1E3A8A',
  },
  commitmentBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    gap: 4,
    width: '100%',
  },
  commitmentHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[700],
  },
  commitmentBody: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    lineHeight: 18,
  },
  mobileTabBarWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    backgroundColor: '#FAFAFC',
    width: '100%',
  },
  mobileTabBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  mobileTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  mobileTabItemActive: {
    backgroundColor: '#EEF2FF',
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  mobileTabItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  mobileTabItemTextActive: {
    color: '#1E3A8A',
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
