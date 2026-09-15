import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
  Platform,
  ScrollView,
} from "react-native";
import { Icon, TYPOGRAPHY } from "@edge/ui";

export interface DocumentPreviewFile {
  name: string;
  uri?: string;
  category?: string;
  size?: string;
  type?: string;
}

export interface DocumentPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  file: DocumentPreviewFile | string | null;
  label?: string;
}

export function DocumentPreviewModal({
  visible,
  onClose,
  file,
  label,
}: DocumentPreviewModalProps) {
  if (!file) return null;

  const fileName = typeof file === "string" ? file : file.name || "Attachment Document";
  const fileUri = typeof file === "string" ? "" : file.uri || "";
  const fileCategory =
    typeof file === "object" && file !== null && "category" in file
      ? (file as { category?: string }).category
      : undefined;
  const fileSize =
    typeof file === "object" && file !== null && "size" in file
      ? (file as { size?: string }).size
      : undefined;

  const fileNameLower = (fileName || "").toLowerCase();
  const uriLower = (fileUri || "").toLowerCase();

  const isPdf =
    fileNameLower.endsWith(".pdf") ||
    uriLower.endsWith(".pdf") ||
    uriLower.includes("application/pdf") ||
    (typeof file === "object" && file !== null && "type" in file && (file as { type?: string }).type === "PDF");

  const isImage =
    !isPdf &&
    (fileNameLower.endsWith(".png") ||
      fileNameLower.endsWith(".jpg") ||
      fileNameLower.endsWith(".jpeg") ||
      fileNameLower.endsWith(".webp") ||
      fileNameLower.endsWith(".gif") ||
      fileNameLower.endsWith(".svg") ||
      uriLower.startsWith("data:image") ||
      (typeof file === "object" && file !== null && "type" in file && (file as { type?: string }).type === "IMAGE") ||
      (uriLower.startsWith("blob:") && !isPdf));

  const handleOpenExternal = async () => {
    if (!fileUri) return;
    try {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.open(fileUri, "_blank");
      } else {
        const supported = await Linking.canOpenURL(fileUri);
        if (supported) {
          await Linking.openURL(fileUri);
        } else {
          window.open(fileUri, "_blank");
        }
      }
    } catch (err) {
      console.warn("Failed to open document URI:", err);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, isPdf && Platform.OS === 'web' ? { maxWidth: 840 } : null]}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Icon
                  name={isPdf ? "file-text" : isImage ? "image" : "paperclip"}
                  size={18}
                  color="#0F2C59"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {fileName}
                </Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {label || (fileCategory ? `${fileCategory.replace('_', ' ')} ${fileSize ? `· ${fileSize}` : ''}` : isPdf ? 'PDF Document' : isImage ? 'Image Attachment' : 'Attached Document')}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Icon name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Modal Content Body */}
          <ScrollView contentContainerStyle={styles.bodyContent}>
            {isPdf && fileUri && Platform.OS === 'web' ? (
              <View style={styles.pdfWrapper}>
                <iframe
                  src={fileUri}
                  title={fileName}
                  style={{
                    width: '100%',
                    height: 520,
                    border: 'none',
                    borderRadius: 10,
                  }}
                />
              </View>
            ) : isImage && fileUri ? (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: fileUri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={styles.documentCard}>
                <View style={styles.docIconBox}>
                  <Icon name={isPdf ? "file-text" : "paperclip"} size={48} color="#0F2C59" />
                </View>
                <Text style={styles.docNameText} numberOfLines={2}>
                  {fileName}
                </Text>
                {fileCategory ? (
                  <View style={styles.categoryBadge}>
                    <Icon name="check-circle" size={13} color="#166534" />
                    <Text style={styles.categoryBadgeText}>
                      {fileCategory.replace('_', ' ')} {fileSize ? `(${fileSize})` : ''}
                    </Text>
                  </View>
                ) : null}
                <Text style={styles.docHintText}>
                  {fileUri
                    ? "Click below to view or open the complete document in a separate browser tab."
                    : "Official requirement document record attached and verified with the application."}
                </Text>

                {fileUri ? (
                  <TouchableOpacity
                    onPress={handleOpenExternal}
                    style={styles.openExternalBtn}
                    activeOpacity={0.8}
                  >
                    <Icon name="external-link" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.openExternalBtnText}>Open Document in New Tab</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            {fileUri ? (
              <TouchableOpacity
                onPress={handleOpenExternal}
                style={styles.footerActionBtn}
                activeOpacity={0.8}
              >
                <Icon name="external-link" size={15} color="#0F2C59" style={{ marginRight: 6 }} />
                <Text style={styles.footerActionText}>Open Fullscreen / Download</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity onPress={onClose} style={styles.footerCloseBtn} activeOpacity={0.8}>
              <Text style={styles.footerCloseText}>Close Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    width: "100%",
    maxWidth: 640,
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0F2C59",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F2C59",
  },
  headerSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#EDF2F7",
  },
  bodyContent: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrapper: {
    width: "100%",
    height: 380,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  pdfWrapper: {
    width: "100%",
    minHeight: 520,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  categoryBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  documentCard: {
    width: "100%",
    padding: 28,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  docIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  docNameText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F2C59",
    textAlign: "center",
    marginBottom: 8,
  },
  docHintText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  openExternalBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F2C59",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  openExternalBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  footerActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  footerActionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "700",
    color: "#0F2C59",
  },
  footerCloseBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  footerCloseText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
});
