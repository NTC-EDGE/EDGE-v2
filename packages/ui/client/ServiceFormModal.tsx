import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
} from "react-native";
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from "../theme/tokens";
import { Feather as Icon } from "@expo/vector-icons";

interface ServiceFormModalProps {
  visible: boolean;
  serviceTitle: string;
  onClose: () => void;
  onSubmit: (data: { applicantName: string; email: string; notes: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function ServiceFormModal({
  visible,
  serviceTitle,
  onClose,
  onSubmit,
  isSubmitting,
}: ServiceFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [fileAttached, setFileAttached] = useState(false);
  const [error, setError] = useState("");

  const handleAttachFile = () => {
    setFileAttached((prev) => !prev);
  };

  const handleFormSubmit = async () => {
    if (name.trim() === "") {
      setError("Applicant name is required.");
      return;
    }
    if (email.trim() === "" || !email.includes("@")) {
      setError("A valid email address is required.");
      return;
    }
    setError("");

    try {
      await onSubmit({ applicantName: name, email, notes });
      // Reset form fields on success
      setName("");
      setEmail("");
      setNotes("");
      setFileAttached(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during submission. Please try again.");
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, SHADOWS.modal]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Icon name="edit-3" size={18} color={COLORS.neutral.white} style={styles.headerIcon} />
              <Text style={styles.headerTitle} numberOfLines={1}>
                Application Form
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={isSubmitting}>
              <Icon name="x" size={18} color={COLORS.neutral.white} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.subtitle}>{serviceTitle}</Text>
            
            {error.length > 0 ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={14} color={COLORS.semantic.error} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Applicant Full Name</Text>
            <TextInput
              placeholder="e.g. Juan dela Cruz / Acme Corp."
              placeholderTextColor={COLORS.neutral[400]}
              value={name}
              onChangeText={setName}
              style={styles.input}
              editable={!isSubmitting}
            />

            <Text style={styles.label}>Contact Email</Text>
            <TextInput
              placeholder="e.g. applicant@domain.com"
              placeholderTextColor={COLORS.neutral[400]}
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isSubmitting}
            />

            <Text style={styles.label}>Additional Details / Notes (Optional)</Text>
            <TextInput
              placeholder="Provide any additional specifications or request context..."
              placeholderTextColor={COLORS.neutral[400]}
              value={notes}
              onChangeText={setNotes}
              style={[styles.input, styles.textArea]}
              multiline={true}
              numberOfLines={4}
              editable={!isSubmitting}
            />

            {/* Document upload simulation */}
            <Text style={styles.label}>Requirements Documents (Simulated Upload)</Text>
            <Pressable
              onPress={isSubmitting ? undefined : handleAttachFile}
              style={[
                styles.uploadArea,
                fileAttached && styles.uploadAreaAttached,
              ]}
            >
              <Icon
                name={fileAttached ? "check-circle" : "upload-cloud"}
                size={22}
                color={fileAttached ? COLORS.semantic.success : COLORS.neutral[400]}
                style={{ marginBottom: 6 }}
              />
              <Text
                style={[
                  styles.uploadText,
                  fileAttached && styles.uploadTextAttached,
                ]}
              >
                {fileAttached
                  ? "supporting_documents.zip (Attached)"
                  : "Click to upload required PDF / ZIP files"}
              </Text>
              <Text style={styles.uploadSubtitle}>
                {fileAttached ? "Tap again to remove file" : "Upload size limit: 25MB"}
              </Text>
            </Pressable>
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelBtn}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleFormSubmit}
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={COLORS.neutral.white} />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Submit Application</Text>
                  <Icon name="send" size={14} color={COLORS.neutral.white} style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(3, 26, 110, 0.4)", // Translucent branding color overlay
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING[20],
  },
  modalContent: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 16,
    width: "100%",
    maxWidth: 480, // Prevent stretching on wide screens
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.brand[900],
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: SPACING[24],
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: SPACING[16],
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.semantic.errorBg,
    borderColor: COLORS.semantic.errorBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: SPACING[16],
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.semantic.error,
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[600],
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    width: "100%",
    height: 40,
    backgroundColor: COLORS.neutral[50],
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: SPACING[16],
    fontSize: 14,
    color: COLORS.neutral[900],
    fontFamily: TYPOGRAPHY.fonts.primary,
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: "top",
  },
  uploadArea: {
    width: "100%",
    paddingVertical: SPACING[16],
    paddingHorizontal: SPACING[12],
    backgroundColor: COLORS.neutral[50],
    borderColor: COLORS.neutral[300],
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  uploadAreaAttached: {
    backgroundColor: COLORS.semantic.successBg,
    borderColor: COLORS.semantic.successBorder,
  },
  uploadText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: "center",
  },
  uploadTextAttached: {
    color: COLORS.semantic.success,
  },
  uploadSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.brand[700],
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.neutral[300],
  },
  submitBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
