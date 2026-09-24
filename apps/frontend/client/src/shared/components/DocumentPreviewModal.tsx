import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
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
  onDownload?: (file: DocumentPreviewFile | string) => void;
}

function isDocumentPreviewFile(file: unknown): file is DocumentPreviewFile {
  return typeof file === "object" && file !== null && "name" in file;
}

export function DocumentPreviewModal({
  visible,
  onClose,
  file,
  label,
  onDownload,
}: DocumentPreviewModalProps) {
  const [imageError, setImageError] = useState(false);

  const isObj = isDocumentPreviewFile(file);
  const fileName = typeof file === "string" ? file : isObj ? file.name : "Attachment Document";
  const fileUri = isObj && typeof file.uri === "string" ? file.uri : "";
  const fileType = isObj && typeof file.type === "string" ? file.type : undefined;

  useEffect(() => {
    setImageError(false);
  }, [fileUri, file]);

  useEffect(() => {
    return () => {
      if (
        fileUri &&
        fileUri.startsWith("blob:") &&
        typeof URL !== "undefined" &&
        typeof URL.revokeObjectURL === "function"
      ) {
        try {
          URL.revokeObjectURL(fileUri);
        } catch {
          // Ignore revocation error
        }
      }
    };
  }, [fileUri]);

  if (!file) return null;

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

  const handleDownloadAction = () => {
    if (onDownload !== undefined) {
      onDownload(file);
      return;
    }

    if (fileUri && Platform.OS === "web" && typeof window !== "undefined" && typeof document !== "undefined") {
      try {
        const anchor = document.createElement("a");
        anchor.setAttribute("href", fileUri);
        anchor.setAttribute("download", fileName);
        anchor.style.visibility = "hidden";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      } catch (err) {
        console.warn("Direct download failed:", err);
      }
    }
  };

  const hasValidRenderUri =
    typeof fileUri === "string" &&
    fileUri.trim() !== "" &&
    fileUri.toLowerCase() !== "null" &&
    fileUri.toLowerCase() !== "undefined";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, Platform.OS === "web" ? { maxWidth: 860, width: "92%" } : null]}>
          {/* Simple Clean Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Icon
                  name={isPdf ? "file-text" : isImage ? "image" : "paperclip"}
                  size={18}
                  color="#1D4ED8"
                />
              </View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {fileName}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Icon name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          <ScrollView contentContainerStyle={styles.bodyContent}>
            {isImage && hasValidRenderUri && !imageError ? (
              /* Simple Pure Image Preview */
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: fileUri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                  onError={() => setImageError(true)}
                />
              </View>
            ) : isPdf && hasValidRenderUri && Platform.OS === "web" ? (
              /* Simple Pure PDF Preview */
              <View style={styles.pdfWrapper}>
                <iframe
                  src={fileUri}
                  title={fileName}
                  style={{
                    width: "100%",
                    height: 560,
                    border: "none",
                    borderRadius: 8,
                    backgroundColor: "#FFFFFF",
                  }}
                />
              </View>
            ) : (
              /* Simple Download Card when document cannot be previewed */
              <View style={styles.noPreviewCard}>
                <View style={styles.noPreviewIconCircle}>
                  <Icon name={isPdf ? "file-text" : "download-cloud"} size={36} color="#2563EB" />
                </View>
                <Text style={styles.noPreviewTitle}>{fileName}</Text>
                <Text style={styles.noPreviewText}>
                  A direct inline preview is not available for this document format. You can download the file directly to view it on your device.
                </Text>
                <TouchableOpacity
                  onPress={handleDownloadAction}
                  style={styles.cardDownloadBtn}
                  activeOpacity={0.8}
                >
                  <Icon name="download" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.cardDownloadBtnText}>Download Document</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Simple Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleDownloadAction}
              style={styles.footerDownloadBtn}
              activeOpacity={0.8}
            >
              <Icon name="download" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.footerDownloadText}>Download</Text>
            </TouchableOpacity>

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
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    width: "100%",
    maxWidth: 860,
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#EDF2F7",
  },
  bodyContent: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 380,
  },
  imageWrapper: {
    width: "100%",
    height: 520,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  noPreviewCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    maxWidth: 460,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  noPreviewIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noPreviewTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  noPreviewText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  cardDownloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1D4ED8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cardDownloadBtnText: {
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  footerDownloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1D4ED8",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  footerDownloadText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footerCloseBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  footerCloseText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
});
