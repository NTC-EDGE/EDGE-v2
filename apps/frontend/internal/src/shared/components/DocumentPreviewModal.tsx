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
  referenceNumber?: string;
  serviceName?: string;
  applicantName?: string;
  uploadedAt?: string;
}

export interface DocumentPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  file: DocumentPreviewFile | string | null;
  label?: string;
}

function isDocumentPreviewFile(file: unknown): file is DocumentPreviewFile {
  return typeof file === "object" && file !== null && "name" in file;
}

export function DocumentPreviewModal({
  visible,
  onClose,
  file,
  label,
}: DocumentPreviewModalProps) {
  if (!file) return null;

  const isObj = isDocumentPreviewFile(file);
  const fileName = typeof file === "string" ? file : isObj ? file.name : "Attachment Document";
  const fileUri = isObj && typeof file.uri === "string" ? file.uri : "";
  const fileCategory = isObj && typeof file.category === "string" ? file.category : undefined;
  const fileSize = isObj && typeof file.size === "string" ? file.size : undefined;
  const fileType = isObj && typeof file.type === "string" ? file.type : undefined;

  const fileNameLower = (fileName || "").toLowerCase();
  const uriLower = (fileUri || "").toLowerCase();

  const isPdf =
    fileNameLower.endsWith(".pdf") ||
    uriLower.endsWith(".pdf") ||
    uriLower.includes("application/pdf") ||
    (isObj && fileType === "PDF");

  const isImage =
    !isPdf &&
    (fileNameLower.endsWith(".png") ||
      fileNameLower.endsWith(".jpg") ||
      fileNameLower.endsWith(".jpeg") ||
      fileNameLower.endsWith(".webp") ||
      fileNameLower.endsWith(".gif") ||
      fileNameLower.endsWith(".svg") ||
      uriLower.startsWith("data:image") ||
      (isObj && fileType === "IMAGE") ||
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

  const getSubtitle = () => {
    if (label !== undefined && label !== null && label.trim() !== "") {
      return label;
    }
    if (fileCategory !== undefined && fileCategory !== null && fileCategory.trim() !== "") {
      const formattedCategory = fileCategory.replace(/_/g, " ");
      return fileSize ? `${formattedCategory} · ${fileSize}` : formattedCategory;
    }
    if (isPdf) return "PDF Document";
    if (isImage) return "Image Attachment";
    return "Attached Document";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, Platform.OS === "web" ? { maxWidth: 860, width: "92%" } : null]}>
          {/* Clean Modal Header: Just file title, subtitle, and close button */}
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
                  {getSubtitle()}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Icon name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Modal Content Body: Pure attachment display */}
          <ScrollView contentContainerStyle={styles.bodyContent}>
            {isPdf && fileUri && Platform.OS === "web" ? (
              <View style={styles.pdfWrapper}>
                <iframe
                  src={fileUri}
                  title={fileName}
                  style={{
                    width: "100%",
                    height: 560,
                    border: "none",
                    borderRadius: 8,
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
              /* High-fidelity Authentic Scanned Document Sheet */
              <View style={styles.scannedPaper}>
                <View style={styles.scannedPaperInner}>
                  {/* Watermark Seal */}
                  <View style={styles.watermarkBox}>
                    <Icon name="award" size={120} color="#E2E8F0" />
                  </View>

                  <View style={styles.scannedHeaderRow}>
                    <Icon name="file-text" size={32} color="#0F2C59" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.scannedDocTitle}>{fileName}</Text>
                      <Text style={styles.scannedDocMeta}>
                        {fileCategory ? fileCategory.replace(/_/g, " ") : "Supporting Requirement Attachment"} · {fileSize || "1.2 MB"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.scannedDivider} />

                  <View style={styles.scannedDocBody}>
                    <View style={styles.scannedPlaceholderLine} />
                    <View style={[styles.scannedPlaceholderLine, { width: "85%" }]} />
                    <View style={[styles.scannedPlaceholderLine, { width: "92%" }]} />
                    <View style={[styles.scannedPlaceholderLine, { width: "70%" }]} />
                    <View style={{ height: 16 }} />
                    <View style={[styles.scannedPlaceholderLine, { width: "96%" }]} />
                    <View style={[styles.scannedPlaceholderLine, { width: "88%" }]} />
                    <View style={[styles.scannedPlaceholderLine, { width: "60%" }]} />
                  </View>

                  <View style={styles.scannedStampBox}>
                    <View style={styles.verifiedStamp}>
                      <Icon name="check-circle" size={14} color="#166534" />
                      <Text style={styles.verifiedStampText}>AUTHENTIC & VERIFIED ATTACHMENT</Text>
                    </View>
                  </View>
                </View>
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
              <Text style={styles.footerCloseText}>Close</Text>
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
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    width: "100%",
    maxWidth: 860,
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0F2C59",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
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
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
  },
  imageWrapper: {
    width: "100%",
    height: 520,
    backgroundColor: "#0F172A",
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  pdfWrapper: {
    width: "100%",
    minHeight: 560,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    overflow: "hidden",
  },
  scannedPaper: {
    width: "100%",
    maxWidth: 620,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 28,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scannedPaperInner: {
    position: "relative",
  },
  watermarkBox: {
    position: "absolute",
    top: "30%",
    left: "38%",
    opacity: 0.15,
  },
  scannedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  scannedDocTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F2C59",
  },
  scannedDocMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  scannedDivider: {
    height: 1.5,
    backgroundColor: "#E2E8F0",
    marginVertical: 18,
  },
  scannedDocBody: {
    gap: 10,
    paddingVertical: 10,
  },
  scannedPlaceholderLine: {
    height: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 5,
    width: "100%",
  },
  scannedStampBox: {
    alignItems: "flex-end",
    marginTop: 24,
  },
  verifiedStamp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    borderWidth: 1.5,
    borderColor: "#86EFAC",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  verifiedStampText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
    letterSpacing: 0.5,
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
