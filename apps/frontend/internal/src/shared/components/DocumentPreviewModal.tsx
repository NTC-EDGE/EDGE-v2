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

export interface DocumentPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  file: { name: string; uri?: string } | string | null;
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

  const isImage = Boolean(
    fileUri &&
      (fileUri.toLowerCase().endsWith(".png") ||
        fileUri.toLowerCase().endsWith(".jpg") ||
        fileUri.toLowerCase().endsWith(".jpeg") ||
        fileUri.toLowerCase().endsWith(".webp") ||
        fileUri.startsWith("data:image") ||
        fileUri.startsWith("blob:"))
  );

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
        <View style={styles.container}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Icon name={isImage ? "image" : "file-text"} size={18} color="#0F2C59" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {fileName}
                </Text>
                {label ? (
                  <Text style={styles.headerSubtitle} numberOfLines={1}>
                    {label}
                  </Text>
                ) : null}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Icon name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Modal Content Body */}
          <ScrollView contentContainerStyle={styles.bodyContent}>
            {isImage && fileUri ? (
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
                  <Icon name="file-text" size={48} color="#0F2C59" />
                </View>
                <Text style={styles.docNameText} numberOfLines={2}>
                  {fileName}
                </Text>
                <Text style={styles.docHintText}>
                  {fileUri
                    ? "Click below to view or open the full document in a separate preview tab."
                    : "Uploaded document record confirmed and attached for review."}
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
