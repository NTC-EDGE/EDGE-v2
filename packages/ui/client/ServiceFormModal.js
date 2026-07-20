"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceFormModal = ServiceFormModal;
const react_1 = require("react");
const react_native_1 = require("react-native");
const tokens_1 = require("../theme/tokens");
const vector_icons_1 = require("@expo/vector-icons");
function ServiceFormModal({ visible, serviceTitle, onClose, onSubmit, isSubmitting, }) {
    const [name, setName] = (0, react_1.useState)("");
    const [email, setEmail] = (0, react_1.useState)("");
    const [notes, setNotes] = (0, react_1.useState)("");
    const [fileAttached, setFileAttached] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)("");
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
        }
        catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
            else {
                setError("An error occurred during submission. Please try again.");
            }
        }
    };
    return (<react_native_1.Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <react_native_1.View style={styles.modalOverlay}>
        <react_native_1.View style={[styles.modalContent, tokens_1.SHADOWS.modal]}>
          {/* Header */}
          <react_native_1.View style={styles.header}>
            <react_native_1.View style={styles.titleContainer}>
              <vector_icons_1.Feather name="edit-3" size={18} color={tokens_1.COLORS.neutral.white} style={styles.headerIcon}/>
              <react_native_1.Text style={styles.headerTitle} numberOfLines={1}>
                Application Form
              </react_native_1.Text>
            </react_native_1.View>
            <react_native_1.TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={isSubmitting}>
              <vector_icons_1.Feather name="x" size={18} color={tokens_1.COLORS.neutral.white}/>
            </react_native_1.TouchableOpacity>
          </react_native_1.View>

          {/* Body */}
          <react_native_1.View style={styles.body}>
            <react_native_1.Text style={styles.subtitle}>{serviceTitle}</react_native_1.Text>
            
            {error.length > 0 ? (<react_native_1.View style={styles.errorContainer}>
                <vector_icons_1.Feather name="alert-circle" size={14} color={tokens_1.COLORS.semantic.error} style={{ marginRight: 6 }}/>
                <react_native_1.Text style={styles.errorText}>{error}</react_native_1.Text>
              </react_native_1.View>) : null}

            <react_native_1.Text style={styles.label}>Applicant Full Name</react_native_1.Text>
            <react_native_1.TextInput placeholder="e.g. Juan dela Cruz / Acme Corp." placeholderTextColor={tokens_1.COLORS.neutral[400]} value={name} onChangeText={setName} style={styles.input} editable={!isSubmitting}/>

            <react_native_1.Text style={styles.label}>Contact Email</react_native_1.Text>
            <react_native_1.TextInput placeholder="e.g. applicant@domain.com" placeholderTextColor={tokens_1.COLORS.neutral[400]} value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" editable={!isSubmitting}/>

            <react_native_1.Text style={styles.label}>Additional Details / Notes (Optional)</react_native_1.Text>
            <react_native_1.TextInput placeholder="Provide any additional specifications or request context..." placeholderTextColor={tokens_1.COLORS.neutral[400]} value={notes} onChangeText={setNotes} style={[styles.input, styles.textArea]} multiline={true} numberOfLines={4} editable={!isSubmitting}/>

            {/* Document upload simulation */}
            <react_native_1.Text style={styles.label}>Requirements Documents (Simulated Upload)</react_native_1.Text>
            <react_native_1.Pressable onPress={isSubmitting ? undefined : handleAttachFile} style={[
            styles.uploadArea,
            fileAttached && styles.uploadAreaAttached,
        ]}>
              <vector_icons_1.Feather name={fileAttached ? "check-circle" : "upload-cloud"} size={22} color={fileAttached ? tokens_1.COLORS.semantic.success : tokens_1.COLORS.neutral[400]} style={{ marginBottom: 6 }}/>
              <react_native_1.Text style={[
            styles.uploadText,
            fileAttached && styles.uploadTextAttached,
        ]}>
                {fileAttached
            ? "supporting_documents.zip (Attached)"
            : "Click to upload required PDF / ZIP files"}
              </react_native_1.Text>
              <react_native_1.Text style={styles.uploadSubtitle}>
                {fileAttached ? "Tap again to remove file" : "Upload size limit: 25MB"}
              </react_native_1.Text>
            </react_native_1.Pressable>
          </react_native_1.View>

          {/* Footer Actions */}
          <react_native_1.View style={styles.footer}>
            <react_native_1.TouchableOpacity onPress={onClose} style={styles.cancelBtn} disabled={isSubmitting}>
              <react_native_1.Text style={styles.cancelBtnText}>Cancel</react_native_1.Text>
            </react_native_1.TouchableOpacity>

            <react_native_1.TouchableOpacity onPress={handleFormSubmit} style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} disabled={isSubmitting}>
              {isSubmitting ? (<react_native_1.ActivityIndicator size="small" color={tokens_1.COLORS.neutral.white}/>) : (<>
                  <react_native_1.Text style={styles.submitBtnText}>Submit Application</react_native_1.Text>
                  <vector_icons_1.Feather name="send" size={14} color={tokens_1.COLORS.neutral.white} style={{ marginLeft: 6 }}/>
                </>)}
            </react_native_1.TouchableOpacity>
          </react_native_1.View>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.Modal>);
}
const styles = react_native_1.StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(3, 26, 110, 0.4)", // Translucent branding color overlay
        justifyContent: "center",
        alignItems: "center",
        padding: tokens_1.SPACING[20],
    },
    modalContent: {
        backgroundColor: tokens_1.COLORS.neutral.white,
        borderRadius: 16,
        width: "100%",
        maxWidth: 480, // Prevent stretching on wide screens
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: tokens_1.COLORS.brand[900],
        paddingHorizontal: tokens_1.SPACING[20],
        paddingVertical: tokens_1.SPACING[16],
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
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 16,
        fontWeight: tokens_1.TYPOGRAPHY.weights.semibold,
        color: tokens_1.COLORS.neutral.white,
    },
    closeBtn: {
        padding: 4,
    },
    body: {
        padding: tokens_1.SPACING[24],
    },
    subtitle: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 15,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral[900],
        marginBottom: tokens_1.SPACING[16],
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: tokens_1.COLORS.semantic.errorBg,
        borderColor: tokens_1.COLORS.semantic.errorBorder,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: tokens_1.SPACING[16],
    },
    errorText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 13,
        color: tokens_1.COLORS.semantic.error,
        fontWeight: tokens_1.TYPOGRAPHY.weights.medium,
        flex: 1,
    },
    label: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 12,
        fontWeight: tokens_1.TYPOGRAPHY.weights.semibold,
        color: tokens_1.COLORS.neutral[600],
        textTransform: "uppercase",
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    input: {
        width: "100%",
        height: 40,
        backgroundColor: tokens_1.COLORS.neutral[50],
        borderColor: tokens_1.COLORS.neutral[200],
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: tokens_1.SPACING[16],
        fontSize: 14,
        color: tokens_1.COLORS.neutral[900],
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        ...react_native_1.Platform.select({
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
        paddingVertical: tokens_1.SPACING[16],
        paddingHorizontal: tokens_1.SPACING[12],
        backgroundColor: tokens_1.COLORS.neutral[50],
        borderColor: tokens_1.COLORS.neutral[300],
        borderStyle: "dashed",
        borderWidth: 1.5,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        ...react_native_1.Platform.select({
            web: {
                cursor: "pointer",
            },
        }),
    },
    uploadAreaAttached: {
        backgroundColor: tokens_1.COLORS.semantic.successBg,
        borderColor: tokens_1.COLORS.semantic.successBorder,
    },
    uploadText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 13,
        color: tokens_1.COLORS.neutral[600],
        fontWeight: tokens_1.TYPOGRAPHY.weights.medium,
        textAlign: "center",
    },
    uploadTextAttached: {
        color: tokens_1.COLORS.semantic.success,
    },
    uploadSubtitle: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 11,
        color: tokens_1.COLORS.neutral[400],
        marginTop: 2,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        borderTopWidth: 1,
        borderTopColor: tokens_1.COLORS.neutral[200],
        paddingHorizontal: tokens_1.SPACING[24],
        paddingVertical: tokens_1.SPACING[16],
        gap: 12,
    },
    cancelBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: tokens_1.COLORS.neutral[200],
        ...react_native_1.Platform.select({
            web: {
                cursor: "pointer",
            },
        }),
    },
    cancelBtnText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 14,
        color: tokens_1.COLORS.neutral[600],
        fontWeight: tokens_1.TYPOGRAPHY.weights.semibold,
    },
    submitBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: tokens_1.COLORS.brand[700],
        ...react_native_1.Platform.select({
            web: {
                cursor: "pointer",
            },
        }),
    },
    submitBtnDisabled: {
        backgroundColor: tokens_1.COLORS.neutral[300],
    },
    submitBtnText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 14,
        color: tokens_1.COLORS.neutral.white,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
    },
});
