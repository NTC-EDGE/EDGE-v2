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
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";
import { Feather as Icon } from "@expo/vector-icons";

export interface ServiceFormModalProps {
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
  const { colors, isDark } = useTheme();
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

  const overlayBg = isDark ? "rgba(15, 23, 42, 0.75)" : "rgba(3, 26, 110, 0.4)";
  const headerBg = isDark ? colors.neutral[800] : colors.brand[900];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: overlayBg }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.cardBg }, SHADOWS.modal]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: headerBg }]}>
            <View style={styles.titleContainer}>
              <Icon name="edit-3" size={18} color={colors.neutral.white} style={styles.headerIcon} />
              <Text style={[styles.headerTitle, { color: colors.neutral.white }]} numberOfLines={1}>
                Application Form
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={isSubmitting}>
              <Icon name="x" size={18} color={colors.neutral.white} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Text style={[styles.subtitle, { color: colors.text }]}>{serviceTitle}</Text>
            
            {error.length > 0 ? (
              <View style={[styles.errorContainer, { backgroundColor: colors.semantic.errorBg, borderColor: colors.semantic.errorBorder }]}>
                <Icon name="alert-circle" size={14} color={colors.semantic.error} style={{ marginRight: 6 }} />
                <Text style={[styles.errorText, { color: colors.semantic.errorText }]}>{error}</Text>
              </View>
            ) : null}

            <Text style={[styles.label, { color: colors.textMuted }]}>Applicant Full Name</Text>
            <TextInput
              placeholder="e.g. Juan dela Cruz / Acme Corp."
              placeholderTextColor={colors.neutral[400]}
              value={name}
              onChangeText={setName}
              style={[styles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: colors.border, color: colors.text }]}
              editable={!isSubmitting}
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>Contact Email</Text>
            <TextInput
              placeholder="e.g. applicant@domain.com"
              placeholderTextColor={colors.neutral[400]}
              value={email}
              onChangeText={setEmail}
              style={[styles.input, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: colors.border, color: colors.text }]}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isSubmitting}
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>Additional Details / Notes (Optional)</Text>
            <TextInput
              placeholder="Provide any additional specifications or request context..."
              placeholderTextColor={colors.neutral[400]}
              value={notes}
              onChangeText={setNotes}
              style={[styles.input, styles.textArea, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: colors.border, color: colors.text }]}
              multiline={true}
              numberOfLines={4}
              editable={!isSubmitting}
            />

            {/* Document upload simulation */}
            <Text style={[styles.label, { color: colors.textMuted }]}>Requirements Documents (Simulated Upload)</Text>
            <Pressable
              onPress={isSubmitting ? undefined : handleAttachFile}
              style={[
                styles.uploadArea,
                { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: colors.border },
                fileAttached && { backgroundColor: colors.semantic.successBg, borderColor: colors.semantic.successBorder },
              ]}
            >
              <Icon
                name={fileAttached ? "check-circle" : "upload-cloud"}
                size={22}
                color={fileAttached ? colors.semantic.success : colors.neutral[400]}
                style={{ marginBottom: 6 }}
              />
              <Text
                style={[
                  styles.uploadText,
                  { color: colors.textMuted },
                  fileAttached && { color: colors.semantic.successText },
                ]}
              >
                {fileAttached
                  ? "supporting_documents.zip (Attached)"
                  : "Click to upload required PDF / ZIP files"}
              </Text>
              <Text style={[styles.uploadSubtitle, { color: colors.neutral[400] }]}>
                {fileAttached ? "Tap again to remove file" : "Upload size limit: 25MB"}
              </Text>
            </Pressable>
          </View>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              disabled={isSubmitting}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleFormSubmit}
              style={[
                styles.submitBtn,
                { backgroundColor: colors.brand[700] },
                isSubmitting && { backgroundColor: colors.neutral[400] },
              ]}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={colors.neutral.white} />
              ) : (
                <>
                  <Text style={[styles.submitBtnText, { color: colors.neutral.white }]}>Submit Application</Text>
                  <Icon name="send" size={14} color={colors.neutral.white} style={{ marginLeft: 6 }} />
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
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING[20],
  },
  modalContent: {
    borderRadius: 16,
    width: "100%",
    maxWidth: 480,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    marginBottom: SPACING[16],
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: SPACING[16],
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: SPACING[16],
    fontSize: 14,
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
  uploadText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: "center",
  },
  uploadSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    paddingHorizontal: SPACING[24],
    paddingVertical: SPACING[16],
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  submitBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
