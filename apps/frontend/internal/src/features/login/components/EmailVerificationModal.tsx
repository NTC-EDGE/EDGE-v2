import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
  TextStyle,
} from "react-native";
import {
  COLORS,
  SPACING,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
} from "@edge/ui";
import { parseApiError } from "@edge/api";

interface EmailVerificationModalProps {
  visible: boolean;
  email: string;
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
}

export function EmailVerificationModal({
  visible,
  email,
  onVerify,
  onCancel,
}: EmailVerificationModalProps) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleVerify = async () => {
    if (code.trim().length === 0) {
      setErrorMessage("Please enter the verification code sent to your email.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onVerify(code.trim());
    } catch (err: unknown) {
      setErrorMessage(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, SHADOWS.modal]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onCancel} disabled={isSubmitting}>
            <Lucide name="x" size={20} color={COLORS.neutral[500]} />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Lucide name="mail" size={28} color="#0E1B61" />
          </View>

          <Text style={styles.title}>Email Verification Required</Text>
          <Text style={styles.subtitle}>
            A 6-digit verification code has been sent to{"\n"}
            <Text style={styles.emailHighlight}>{email}</Text>. Please enter the code below to complete sign-in.
          </Text>

          {errorMessage !== null && errorMessage.trim().length > 0 ? (
            <View style={styles.errorBox}>
              <Lucide name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>6-Digit Verification Code</Text>
            <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
              <Lucide name="key" size={18} color={isFocused ? "#0E1B61" : COLORS.neutral[400]} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 123456"
                placeholderTextColor={COLORS.neutral[400]}
                value={code}
                onChangeText={setCode}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType="number-pad"
                autoCapitalize="none"
                maxLength={6}
                editable={!isSubmitting}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.neutral.white} size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={isSubmitting}>
            <Text style={styles.cancelBtnText}>Cancel Sign-In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING[16],
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  emailHighlight: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#0E1B61",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    width: "100%",
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#991B1B",
  },
  fieldGroup: {
    width: "100%",
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[700],
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: "#0E1B61",
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF",
  },
  textInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    letterSpacing: 4,
    color: COLORS.neutral[900],
    height: "100%",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? ({ outlineWidth: 0, outlineColor: "transparent" } as unknown as TextStyle) : {}),
  },
  verifyButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#0E1B61",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  verifyButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
  },
});
