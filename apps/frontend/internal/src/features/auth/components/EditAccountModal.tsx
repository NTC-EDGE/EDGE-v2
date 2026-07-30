import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Modal,
  Pressable,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, useTheme } from '@edge/ui';
import { useAuthContext } from '../context/AuthContext';

interface EditAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'profile' | 'security';

type UserResourceType = NonNullable<ReturnType<typeof useAuthContext>['clerkUser']>;
type EmailAddressResourceType = Awaited<ReturnType<UserResourceType['createEmailAddress']>>;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  
  if (typeof error === 'object' && error !== null) {
    // Check for Clerk-style error response which contains an 'errors' array
    const errors = Reflect.get(error, 'errors');
    if (Array.isArray(errors) && errors.length > 0) {
      const firstError = errors[0];
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

export function EditAccountModal({ visible, onClose }: EditAccountModalProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const { clerkUser } = useAuthContext();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // Profile inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  
  // Password inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password visibility
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Email verification flow states
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmailResource, setPendingEmailResource] = useState<EmailAddressResourceType | null>(null);

  // Message states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync initial user details when modal opens
  useEffect(() => {
    if (visible && clerkUser !== null && clerkUser !== undefined) {
      setFirstName(clerkUser.firstName ?? '');
      setLastName(clerkUser.lastName ?? '');
      setUsername(clerkUser.username ?? '');
      setEmail(clerkUser.primaryEmailAddress?.emailAddress ?? '');
      
      // Reset security fields and status messages
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setSuccessMsg('');
      setVerificationPending(false);
      setPendingEmailResource(null);
      setVerificationCode('');
    }
  }, [visible, clerkUser]);

  const handleSaveProfile = async () => {
    if (clerkUser === null || clerkUser === undefined) {
      setErrorMsg('Authentication session not loaded.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Update basic profile info if changed
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

      // 2. Update email if changed
      const currentEmail = clerkUser.primaryEmailAddress?.emailAddress ?? '';
      if (email !== currentEmail) {
        const emailRes = await clerkUser.createEmailAddress({ email });
        await emailRes.prepareVerification({ strategy: 'email_code' });
        setPendingEmailResource(emailRes);
        setVerificationPending(true);
        setLoading(false);
        return;
      }

      setSuccessMsg('Account profile details updated successfully.');
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      // Keep loading indicator off if we're waiting for email verification
      if (email === (clerkUser?.primaryEmailAddress?.emailAddress ?? '')) {
        setLoading(false);
      }
    }
  };

  const handleVerifyEmail = async () => {
    if (pendingEmailResource === null || pendingEmailResource === undefined) {
      setErrorMsg('No email verification process pending.');
      return;
    }
    if (clerkUser === null || clerkUser === undefined) {
      setErrorMsg('Authentication session not loaded.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await pendingEmailResource.attemptVerification({ code: verificationCode });
      await clerkUser.update({ primaryEmailAddressId: pendingEmailResource.id });
      
      setSuccessMsg('Email address updated and verified successfully.');
      setVerificationPending(false);
      setPendingEmailResource(null);
      setVerificationCode('');
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (clerkUser === null || clerkUser === undefined) {
      setErrorMsg('Authentication session not loaded.');
      return;
    }
    if (currentPassword.length === 0) {
      setErrorMsg('Please enter your current password.');
      return;
    }
    if (newPassword.length === 0) {
      setErrorMsg('Please enter your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and password confirmation do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await clerkUser.updatePassword({
        currentPassword,
        newPassword,
      });
      setSuccessMsg('Security password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, SHADOWS.modal]}>
          {/* Close X Button */}
          <Pressable style={styles.modalCloseBtn} onPress={onClose}>
            <Lucide name="x" size={18} color={COLORS.neutral[500]} />
          </Pressable>

          <View style={styles.modalHeader}>
            <View style={styles.headerIconCircle}>
              <Lucide name="user" size={18} color={COLORS.brand.primary} />
            </View>
            <Text style={styles.modalTitle}>Account Settings</Text>
          </View>

          {/* Success / Error Messages */}
          {errorMsg.length > 0 && (
            <View style={styles.errorBox}>
              <Lucide name="alert-circle" size={16} color={COLORS.brand.redDark} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {successMsg.length > 0 && (
            <View style={styles.successBox}>
              <Lucide name="check-circle" size={16} color={COLORS.semantic.success} style={{ marginRight: 6 }} />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          )}

          {/* Standard Form Screen */}
          {!verificationPending ? (
            <>
              {/* Tab Switcher */}
              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
                  onPress={() => {
                    setActiveTab('profile');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                >
                  <Lucide name="sliders" size={14} color={activeTab === 'profile' ? COLORS.brand[800] : COLORS.neutral[500]} style={{ marginRight: 6 }} />
                  <Text style={[styles.tabButtonText, activeTab === 'profile' && styles.tabButtonTextActive]}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'security' && styles.tabButtonActive]}
                  onPress={() => {
                    setActiveTab('security');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                >
                  <Lucide name="lock" size={14} color={activeTab === 'security' ? COLORS.brand[800] : COLORS.neutral[500]} style={{ marginRight: 6 }} />
                  <Text style={[styles.tabButtonText, activeTab === 'security' && styles.tabButtonTextActive]}>Security</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
                {activeTab === 'profile' ? (
                  /* Profile details settings fields */
                  <View style={styles.formContainer}>
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabelSmall}>Username</Text>
                      <TextInput
                        value={username}
                        onChangeText={setUsername}
                        placeholder="username"
                        style={styles.greyInput}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabelSmall}>First Name</Text>
                      <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First Name"
                        style={styles.greyInput}
                      />
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabelSmall}>Last Name</Text>
                      <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last Name"
                        style={styles.greyInput}
                      />
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabelSmall}>Email Address</Text>
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="email@example.com"
                        style={styles.greyInput}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.actionBtn, loading && styles.actionBtnDisabled]}
                      onPress={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color={COLORS.neutral.white} />
                      ) : (
                        <Text style={styles.actionBtnText}>Save Profile Changes</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Security settings fields */
                  <View style={styles.formContainer}>
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabelSmall}>Current Password</Text>
                      <View style={styles.inputWithIconWrapper}>
                        <TextInput
                          value={currentPassword}
                          onChangeText={setCurrentPassword}
                          placeholder="••••••••"
                          secureTextEntry={!showCurrentPass}
                          style={styles.greyInput}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        <TouchableOpacity
                          style={styles.eyeIconButton}
                          onPress={() => setShowCurrentPass(!showCurrentPass)}
                        >
                          <Lucide name={showCurrentPass ? 'eye-off' : 'eye'} size={18} color={COLORS.neutral[500]} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabelSmall}>New Password</Text>
                      <View style={styles.inputWithIconWrapper}>
                        <TextInput
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="••••••••"
                          secureTextEntry={!showNewPass}
                          style={styles.greyInput}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        <TouchableOpacity
                          style={styles.eyeIconButton}
                          onPress={() => setShowNewPass(!showNewPass)}
                        >
                          <Lucide name={showNewPass ? 'eye-off' : 'eye'} size={18} color={COLORS.neutral[500]} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabelSmall}>Confirm New Password</Text>
                      <View style={styles.inputWithIconWrapper}>
                        <TextInput
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          placeholder="••••••••"
                          secureTextEntry={!showConfirmPass}
                          style={styles.greyInput}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        <TouchableOpacity
                          style={styles.eyeIconButton}
                          onPress={() => setShowConfirmPass(!showConfirmPass)}
                        >
                          <Lucide name={showConfirmPass ? 'eye-off' : 'eye'} size={18} color={COLORS.neutral[500]} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.actionBtn, loading && styles.actionBtnDisabled]}
                      onPress={handleSavePassword}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color={COLORS.neutral.white} />
                      ) : (
                        <Text style={styles.actionBtnText}>Update Password</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </>
          ) : (
            /* Verification Multi-step flow Screen */
            <View style={styles.verificationContainer}>
              <View style={styles.verificationIntroBox}>
                <Lucide name="mail" size={24} color={COLORS.brand.primary} style={{ marginBottom: 8 }} />
                <Text style={styles.verifyTitle}>Verify New Email Address</Text>
                <Text style={styles.verifyDescriptionText}>
                  A security verification code has been dispatched to {email}. Please retrieve the code and submit it below to authorize this email update.
                </Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabelSmall}>Verification Code</Text>
                <TextInput
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="Enter 6-digit code"
                  style={styles.greyInput}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.actionBtn, loading && styles.actionBtnDisabled]}
                onPress={handleVerifyEmail}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.neutral.white} />
                ) : (
                  <Text style={styles.actionBtnText}>Confirm Code & Verify Email</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.verificationBackBtn}
                onPress={() => {
                  setVerificationPending(false);
                  setPendingEmailResource(null);
                  setVerificationCode('');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
              >
                <Text style={styles.verificationBackBtnText}>Cancel & Go Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440, // Standard size constraint to avoid overstretching on wide browsers
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.brand.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand.navy,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    marginBottom: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  tabButtonActive: {
    borderBottomColor: COLORS.brand[800],
  },
  tabButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[500],
  },
  tabButtonTextActive: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[800],
  },
  formScroll: {
    maxHeight: 400,
  },
  formContainer: {
    gap: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabelSmall: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginBottom: 6,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  greyInput: {
    height: 48,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.neutral[900],
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  inputWithIconWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeIconButton: {
    position: 'absolute',
    right: 14,
    padding: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  actionBtn: {
    height: 48,
    backgroundColor: COLORS.brand[800],
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Platform.select({
      web: {
        transition: 'all 200ms ease-out',
        cursor: 'pointer',
      },
    }),
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
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
    padding: 12,
    marginBottom: 16,
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
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.semantic.success,
  },
  verificationContainer: {
    alignItems: 'center',
    gap: 16,
  },
  verificationIntroBox: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  verifyTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand.navy,
    marginTop: 8,
    marginBottom: 6,
  },
  verifyDescriptionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    textAlign: 'center',
    lineHeight: 18,
  },
  verificationBackBtn: {
    paddingVertical: 8,
    alignSelf: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  verificationBackBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
});
