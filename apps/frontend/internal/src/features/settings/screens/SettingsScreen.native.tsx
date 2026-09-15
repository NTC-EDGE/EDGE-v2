import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import {
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  Icon as Lucide,
  COLORS,
  useTheme,
  AnimatedCard,
  SkeletonLoader,
  ThemeToggle,
} from "@edge/ui";
import { useAuthContext } from "../../auth/context/AuthContext";
import { REGIONS_LIST } from "../../employees/data/mockEmployees";
import { useRole } from "../../shell/context/RoleContext";
import { useAppNavigation } from "../../../navigation/types";
import {
  TabType,
  getErrorMessage,
  isObjectWithCreatePassword,
  calculatePasswordStrength,
  validatePasswordChange,
} from "../utils/settingsUtils";

const isThemeMode = (val: string | null): val is "light" | "dark" =>
  val === "light" || val === "dark";

export function SettingsScreen(): React.ReactElement {
  const { colors, isDark, mode, setMode } = useTheme();
  const { clerkUser } = useAuthContext();
  const { currentRole } = useRole();
  const navigation = useAppNavigation();

  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleBackToDashboard = () => {
    navigation.navigate("Dashboard");
  };

  // Profile Inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("admin");
  const [department, setDepartment] = useState("admin");
  const [designation, setDesignation] = useState("admin");
  const [phone, setPhone] = useState("09123456789");

  // Profile state flags
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Security Inputs
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Central Office (Headquarters)");
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  // Security visibility state
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Security status messages
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");

  // Appearance Settings
  const [reduceMotion, setReduceMotion] = useState(false);

  // Initialize profile values from Clerk context
  useEffect(() => {
    if (clerkUser !== null && clerkUser !== undefined) {
      setFirstName(clerkUser.firstName ?? "");
      setLastName(clerkUser.lastName ?? "");
      setUsername(clerkUser.username ?? "");
      setEmail(clerkUser.primaryEmailAddress?.emailAddress ?? "");
      setSelectedRegion("Central Office (Headquarters)");
    }
  }, [clerkUser]);

  // Password checklist calculations
  const pChecklist = useMemo(() => {
    return calculatePasswordStrength(newPassword, colors);
  }, [newPassword, colors]);

  // Save profile edits
  const handleSaveProfile = async () => {
    if (clerkUser === null || clerkUser === undefined) {
      setProfileError("Authentication session not loaded.");
      return;
    }

    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const profileChanged =
        firstName !== (clerkUser.firstName ?? "") ||
        lastName !== (clerkUser.lastName ?? "") ||
        username !== (clerkUser.username ?? "");

      if (profileChanged) {
        await clerkUser.update({
          firstName,
          lastName,
          username: username || undefined,
        });
      }

      setProfileSuccess("Profile details updated successfully.");
      setIsEditingProfile(false);
    } catch (err: unknown) {
      setProfileError(getErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setSecurityLoading(true);
    setSecurityError("");
    setSecuritySuccess("");

    try {
      const hasPassword = Boolean(clerkUser?.passwordEnabled);

      if (newPassword.length > 0) {
        const validationError = validatePasswordChange({
          hasPassword,
          currentPassword,
          newPassword,
          confirmPassword,
        });

        if (validationError !== null) {
          setSecurityError(validationError);
          setSecurityLoading(false);
          return;
        }
        if (clerkUser !== null && clerkUser !== undefined) {
          if (!hasPassword && isObjectWithCreatePassword(clerkUser)) {
            await clerkUser.createPassword({
              newPassword,
              signOutOfOtherSessions: false,
            });
          } else if (typeof clerkUser.updatePassword === "function") {
            await clerkUser.updatePassword({
              currentPassword: hasPassword ? currentPassword : "",
              newPassword,
              signOutOfOtherSessions: false,
            });
          }
        }
      }
      setSecuritySuccess("Security settings updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setSecurityError(getErrorMessage(err));
    } finally {
      setSecurityLoading(false);
    }
  };

  const tabs: Array<{ id: TabType; label: string; icon: keyof typeof Lucide.glyphMap }> = [
    { id: "profile", label: "Profile", icon: "user" },
    { id: "security", label: "Security", icon: "shield" },
    { id: "appearance", label: "Appearance", icon: "sun" },
    { id: "support", label: "Help & Support", icon: "help-circle" },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header Bar */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={handleBackToDashboard}
              style={[
                styles.backBtn,
                { backgroundColor: isDark ? colors.neutral[800] : colors.cardBg, borderColor: colors.border },
              ]}
              activeOpacity={0.7}
            >
              <Lucide name="arrow-left" size={18} color={colors.text} />
              <Text style={[styles.backBtnText, { color: colors.text }]}>Dashboard</Text>
            </TouchableOpacity>

            <Text style={[styles.screenTitle, { color: colors.text }]}>Account Settings</Text>
          </View>

          {/* Navigation Tabs */}
          <View
            style={[
              styles.tabsContainer,
              { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
            ]}
          >
            {tabs.map((t) => {
              const isActive = activeTab === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setActiveTab(t.id)}
                  style={[
                    styles.tabBtn,
                    isActive && [
                      styles.tabBtnActive,
                      { backgroundColor: isDark ? colors.neutral[700] : colors.cardBg },
                    ],
                  ]}
                  activeOpacity={0.7}
                >
                  <Lucide
                    name={t.icon}
                    size={16}
                    color={isActive ? (isDark ? colors.brand.primary : colors.brand.secondary) : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.tabBtnText,
                      { color: isActive ? (isDark ? colors.brand.primary : colors.brand.secondary) : colors.textMuted },
                      isActive && styles.tabBtnTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tab Content */}
          {activeTab === "profile" && (
            <AnimatedCard delay={0} padding={20} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>User Profile</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                  Manage your personal staff information and department role assignment.
                </Text>
              </View>

              {profileError.length > 0 && (
                <View style={[styles.msgBox, { backgroundColor: colors.semantic.errorBg, borderColor: colors.semantic.errorBorder }]}>
                  <Lucide name="alert-circle" size={16} color={colors.semantic.error} />
                  <Text style={[styles.msgText, { color: colors.semantic.errorText }]}>{profileError}</Text>
                </View>
              )}

              {profileSuccess.length > 0 && (
                <View style={[styles.msgBox, { backgroundColor: colors.semantic.successBg, borderColor: colors.semantic.successBorder }]}>
                  <Lucide name="check-circle" size={16} color={colors.semantic.success} />
                  <Text style={[styles.msgText, { color: colors.semantic.successText }]}>{profileSuccess}</Text>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border, color: colors.text }]}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border, color: colors.text }]}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border, color: colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Assigned Workstation Role</Text>
                <View
                  style={[
                    styles.readOnlyRoleBox,
                    {
                      backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100],
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Lucide name="shield" size={16} color={isDark ? colors.brand.primary : colors.brand.secondary} />
                    <Text style={[styles.readOnlyRoleText, { color: colors.text }]}>{currentRole}</Text>
                  </View>
                  <Text style={[styles.readOnlyRoleHint, { color: colors.textMuted }]}>
                    Assigned and managed by Regional Admin
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: isDark ? colors.brand.primary : colors.brand.secondary }]}
                onPress={handleSaveProfile}
                disabled={profileLoading}
              >
                {profileLoading ? (
                  <ActivityIndicator color={colors.neutral.white} size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Profile Changes</Text>
                )}
              </TouchableOpacity>
            </AnimatedCard>
          )}

          {activeTab === "security" && (
            <AnimatedCard delay={0} padding={20} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Account Security</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                  Update password and authentication preferences.
                </Text>
              </View>

              {securityError.length > 0 && (
                <View style={[styles.msgBox, { backgroundColor: colors.semantic.errorBg, borderColor: colors.semantic.errorBorder }]}>
                  <Lucide name="alert-circle" size={16} color={colors.semantic.error} />
                  <Text style={[styles.msgText, { color: colors.semantic.errorText }]}>{securityError}</Text>
                </View>
              )}

              {securitySuccess.length > 0 && (
                <View style={[styles.msgBox, { backgroundColor: colors.semantic.successBg, borderColor: colors.semantic.successBorder }]}>
                  <Lucide name="check-circle" size={16} color={colors.semantic.success} />
                  <Text style={[styles.msgText, { color: colors.semantic.successText }]}>{securitySuccess}</Text>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border, color: colors.text }]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPass}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border, color: colors.text }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPass}
                />
                <Text style={[styles.strengthText, { color: pChecklist.strengthColor }]}>
                  Strength: {pChecklist.strengthText}
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border, color: colors.text }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPass}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: isDark ? colors.brand.primary : colors.brand.secondary }]}
                onPress={handleSaveSecurity}
                disabled={securityLoading}
              >
                {securityLoading ? (
                  <ActivityIndicator color={colors.neutral.white} size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Update Security</Text>
                )}
              </TouchableOpacity>
            </AnimatedCard>
          )}

          {activeTab === "appearance" && (
            <AnimatedCard delay={0} padding={20} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Appearance & Theme</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                  Customize workspace theme and visual motion effects.
                </Text>
              </View>

              <View style={[styles.switchRow, { borderColor: colors.border }]}>
                <View>
                  <Text style={[styles.switchTitle, { color: colors.text }]}>Dark Mode</Text>
                  <Text style={[styles.switchDesc, { color: colors.textMuted }]}>
                    Switch between Slate light (50) and Slate dark (900) palettes.
                  </Text>
                </View>
                <ThemeToggle variant="segmented" size="sm" />
              </View>

              <View style={[styles.switchRow, { borderColor: colors.border }]}>
                <View>
                  <Text style={[styles.switchTitle, { color: colors.text }]}>Reduce Motion</Text>
                  <Text style={[styles.switchDesc, { color: colors.textMuted }]}>
                    Minimize animated transitions across cards and screens.
                  </Text>
                </View>
                <Switch
                  value={reduceMotion}
                  onValueChange={setReduceMotion}
                  trackColor={{ false: colors.border, true: colors.brand.primary }}
                />
              </View>
            </AnimatedCard>
          )}

          {activeTab === "support" && (
            <AnimatedCard delay={0} padding={20} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Help & Support</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                  Access system documentation and technical support resources.
                </Text>
              </View>

              <View style={styles.supportList}>
                <TouchableOpacity style={[styles.supportItem, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: colors.border }]}>
                  <Lucide name="book-open" size={20} color={isDark ? colors.brand.primary : colors.brand.secondary} />
                  <View style={styles.supportText}>
                    <Text style={[styles.supportTitle, { color: colors.text }]}>User Manual & Documentation</Text>
                    <Text style={[styles.supportDesc, { color: colors.textMuted }]}>Read guides on queue processing and licensing.</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.supportItem, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: colors.border }]}>
                  <Lucide name="mail" size={20} color={colors.semantic.success} />
                  <View style={styles.supportText}>
                    <Text style={[styles.supportTitle, { color: colors.text }]}>Contact Technical Support</Text>
                    <Text style={[styles.supportDesc, { color: colors.textMuted }]}>Submit an inquiry ticket to IT helpdesk.</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </AnimatedCard>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
  },
  container: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  backBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  screenTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tabsContainer: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabBtnActive: {
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  tabBtnTextActive: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  card: {
    width: "100%",
    borderRadius: 16,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  msgBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  msgText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
  },
  dropdownBtn: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
  },
  dropdownList: {
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 12,
  },
  dropdownItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  readOnlyRoleBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  readOnlyRoleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  readOnlyRoleHint: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  saveBtn: {
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  strengthText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  switchTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  switchDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
  supportList: {
    gap: 12,
  },
  supportItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  supportText: {
    flex: 1,
  },
  supportTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  supportDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
});
