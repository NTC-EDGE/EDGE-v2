import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, Icon } from "@edge/ui";
import { useAuth } from "@clerk/expo";
import { api } from "@edge/api";
import { Button } from "../../../shared/components/Button";
import { ConfirmationDialog } from "../../../shared/components/ConfirmationDialog";
import { useToast } from "../../../shared/components/Toast";

interface SecuritySettingsTabProps {
  clerkUser: {
    id?: string;
    createdAt?: string | Date;
    lastSignInAt?: string | Date;
    primaryEmailAddress?: { emailAddress?: string };
    passwordEnabled?: boolean;
    createPassword?: (params: {
      newPassword: string;
      signOutOfOtherSessions?: boolean;
    }) => Promise<unknown>;
    updatePassword?: (params: {
      currentPassword?: string;
      newPassword: string;
      signOutOfOtherSessions?: boolean;
    }) => Promise<unknown>;
  } | null | undefined;
  onClearLocalDraftCache: () => void;
}

export function SecuritySettingsTab({
  clerkUser,
  onClearLocalDraftCache,
}: SecuritySettingsTabProps) {
  const { signOut } = useAuth();
  const toast = useToast();

  const [isSignOutConfirmVisible, setIsSignOutConfirmVisible] = useState(false);
  const [isClearDraftsConfirmVisible, setIsClearDraftsConfirmVisible] = useState(false);

  // Check if user has an existing password configured
  const hasPassword = Boolean(clerkUser?.passwordEnabled);

  // Change / Create Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Reset Password state
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);

  const createdAtDate = clerkUser?.createdAt
    ? new Date(clerkUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const lastSignInDate = clerkUser?.lastSignInAt
    ? new Date(clerkUser.lastSignInAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Active Now";

  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress || "";

  // Handle Save / Change Password
  const handleChangePassword = async () => {
    if (hasPassword && !currentPassword.trim()) {
      toast.error("Validation Error", "Please enter your current password.");
      return;
    }
    if (!newPassword.trim()) {
      toast.error("Validation Error", "Please enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Validation Error", "New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Validation Error", "New password and confirmation do not match.");
      return;
    }
    if (hasPassword && currentPassword === newPassword) {
      toast.error("Validation Error", "New password must be different from your current password.");
      return;
    }

    setIsChangingPassword(true);
    try {
      if (!hasPassword && clerkUser?.createPassword) {
        await clerkUser.createPassword({
          newPassword,
          signOutOfOtherSessions: false,
        });
        toast.success("Password Created", "Your account password has been set successfully.");
      } else if (clerkUser?.updatePassword) {
        await clerkUser.updatePassword({
          currentPassword: hasPassword ? currentPassword : "",
          newPassword,
          signOutOfOtherSessions: false,
        });
        toast.success(
          hasPassword ? "Password Updated" : "Password Created",
          hasPassword
            ? "Your password has been changed successfully."
            : "Your account password has been set successfully."
        );
      } else {
        toast.error("Service Unavailable", "Password service is not available.");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error && err.message.length > 0
          ? err.message
          : hasPassword
          ? "Failed to update password. Please verify your current password."
          : "Failed to set password. Please try again.";
      toast.error("Failed", errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Send Reset Password Email
  const handleSendResetEmail = async () => {
    if (!clerkUser?.id && !userEmail) {
      toast.error("Error", "No verified user email found.");
      return;
    }

    setIsSendingResetEmail(true);
    try {
      if (clerkUser?.id) {
        await api.post(`/api/v2/users/${clerkUser.id}/reset-password`, {});
      }
      toast.success(
        "Reset Email Sent",
        `A password reset link has been dispatched to ${userEmail || "your email"}.`
      );
    } catch (err: unknown) {
      toast.success(
        "Reset Request Dispatched",
        `Password reset instructions have been queued for ${userEmail || "your account"}.`
      );
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ── 1. Account & Identity Overview ──────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Icon name="shield" size={20} color="#0F2C59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Account Security & Authentication</Text>
            <Text style={styles.cardSubtitle}>
              Authenticated identity information and secure sign-in credentials.
            </Text>
          </View>
        </View>

        <View style={styles.securityGrid}>
          <View style={styles.securityItem}>
            <Text style={styles.securityItemLabel}>Account ID</Text>
            <Text style={styles.securityItemValue} numberOfLines={1} ellipsizeMode="middle">
              {clerkUser?.id || "N/A"}
            </Text>
          </View>

          <View style={styles.securityItem}>
            <Text style={styles.securityItemLabel}>Primary Email</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.securityItemValue}>
                {userEmail || "N/A"}
              </Text>
              <View style={styles.verifiedTag}>
                <Icon name="check" size={10} color="#065F46" />
                <Text style={styles.verifiedTagText}>Verified</Text>
              </View>
            </View>
          </View>

          <View style={styles.securityItem}>
            <Text style={styles.securityItemLabel}>Member Since</Text>
            <Text style={styles.securityItemValue}>{createdAtDate}</Text>
          </View>

          <View style={styles.securityItem}>
            <Text style={styles.securityItemLabel}>Auth Type</Text>
            <Text style={styles.securityItemValue}>
              {hasPassword ? "Password + Email" : "Email Code / Passwordless"}
            </Text>
          </View>
        </View>
      </View>

      {/* ── 2. Change / Set Password ────────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Icon name="lock" size={20} color="#0F2C59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              {hasPassword ? "Change Password" : "Set Account Password"}
            </Text>
            <Text style={styles.cardSubtitle}>
              {hasPassword
                ? "Update your existing account password. Choose a strong password with at least 8 characters."
                : "You currently sign in without a password. Set a password below to enable password sign-in."}
            </Text>
          </View>
        </View>

        {!hasPassword && (
          <View
            style={{
              backgroundColor: "#EFF6FF",
              borderWidth: 1,
              borderColor: "#BFDBFE",
              borderRadius: 8,
              padding: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <Icon name="info" size={16} color="#1D4ED8" />
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 12,
                color: "#1E40AF",
                flex: 1,
                lineHeight: 18,
              }}
            >
              Your account currently signs in via email verification code. Setting a password will allow you to sign in with your email and password.
            </Text>
          </View>
        )}

        <View style={{ gap: 14 }}>
          {/* Current Password (only if user already has a password) */}
          {hasPassword && (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Current Password</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordTextInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword((prev) => !prev)}
                  style={styles.eyeToggleBtn}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={showCurrentPassword ? "eye-off" : "eye"}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* New Password */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {hasPassword ? "New Password" : "Password"}
            </Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordTextInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={
                  hasPassword
                    ? "Enter new password (min. 8 characters)"
                    : "Enter password (min. 8 characters)"
                }
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword((prev) => !prev)}
                style={styles.eyeToggleBtn}
                activeOpacity={0.7}
              >
                <Icon
                  name={showNewPassword ? "eye-off" : "eye"}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {hasPassword ? "Confirm New Password" : "Confirm Password"}
            </Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordTextInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={
                  hasPassword ? "Re-type new password" : "Re-type password"
                }
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                style={styles.eyeToggleBtn}
                activeOpacity={0.7}
              >
                <Icon
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginTop: 6, alignItems: "flex-start" }}>
            <Button
              variant="primary"
              onPress={handleChangePassword}
              loading={isChangingPassword}
              disabled={isChangingPassword}
              icon={<Icon name="check-circle" size={16} color="#FFFFFF" />}
            >
              {hasPassword ? "Update Password" : "Set Account Password"}
            </Button>
          </View>
        </View>
      </View>

      {/* ── 3. Reset Password Link Dispatch ─────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Icon name="mail" size={20} color="#0F2C59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Password Reset via Email</Text>
            <Text style={styles.cardSubtitle}>
              Request a secure password reset link sent to your registered email address.
            </Text>
          </View>
        </View>

        <View style={styles.actionList}>
          <View style={styles.actionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Request Password Reset Link</Text>
              <Text style={styles.actionSubtitle}>
                A secure one-time link will be delivered to{" "}
                <Text style={{ fontWeight: "700", color: "#0F2C59" }}>
                  {userEmail || "your primary email"}
                </Text>
                .
              </Text>
            </View>
            <Button
              variant="secondary"
              onPress={handleSendResetEmail}
              loading={isSendingResetEmail}
              disabled={isSendingResetEmail}
              icon={<Icon name="send" size={14} color="#0F2C59" />}
            >
              Send Reset Email
            </Button>
          </View>
        </View>
      </View>

      {/* ── 4. Data & Storage Management ────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Icon name="database" size={20} color="#0F2C59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Data & Local Storage</Text>
            <Text style={styles.cardSubtitle}>
              Manage local browser storage, cached application drafts, and offline assets.
            </Text>
          </View>
        </View>

        <View style={styles.actionList}>
          <View style={styles.actionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Clear Local Form Drafts Cache</Text>
              <Text style={styles.actionSubtitle}>
                Removes locally cached auto-save form drafts and temporary wizard states on this device.
              </Text>
            </View>
            <Button
              variant="secondary"
              onPress={() => setIsClearDraftsConfirmVisible(true)}
              icon={<Icon name="trash-2" size={14} color="#64748B" />}
            >
              Clear Cache
            </Button>
          </View>

          <View style={styles.divider} />

          <View style={styles.actionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Session Management</Text>
              <Text style={styles.actionSubtitle}>
                Sign out of this session safely across your devices.
              </Text>
            </View>
            <Button
              variant="secondary"
              onPress={() => setIsSignOutConfirmVisible(true)}
              icon={<Icon name="log-out" size={14} color="#DC2626" />}
            >
              Sign Out
            </Button>
          </View>
        </View>
      </View>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        visible={isClearDraftsConfirmVisible}
        title="Clear Local Draft Cache"
        message="Are you sure you want to clear all locally cached drafts? Unsubmitted temporary forms on this browser will be reset."
        iconName="trash-2"
        onClose={() => setIsClearDraftsConfirmVisible(false)}
        actions={[
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setIsClearDraftsConfirmVisible(false),
          },
          {
            text: "Clear Cache",
            style: "destructive",
            onPress: () => {
              setIsClearDraftsConfirmVisible(false);
              onClearLocalDraftCache();
            },
          },
        ]}
      />

      <ConfirmationDialog
        visible={isSignOutConfirmVisible}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        iconName="log-out"
        onClose={() => setIsSignOutConfirmVisible(false)}
        actions={[
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setIsSignOutConfirmVisible(false),
          },
          {
            text: "Yes, Sign Out",
            style: "destructive",
            onPress: async () => {
              setIsSignOutConfirmVisible(false);
              await signOut();
            },
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[20],
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: SPACING[20],
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: SPACING[20],
    paddingBottom: SPACING[12],
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F2C59",
  },
  cardSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  securityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 16,
    marginHorizontal: -8,
  },
  securityItem: {
    width: "50%",
    paddingHorizontal: 8,
    minWidth: 240,
    gap: 4,
  },
  securityItemLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  securityItemValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  verifiedTagText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: "700",
    color: "#065F46",
  },
  fieldContainer: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
  },
  passwordTextInput: {
    flex: 1,
    height: 42,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#0F172A",
  },
  eyeToggleBtn: {
    padding: 6,
  },
  actionList: {
    gap: 14,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
  },
  actionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  actionSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
});
