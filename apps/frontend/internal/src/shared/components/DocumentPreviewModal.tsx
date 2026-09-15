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
  const fileType =
    typeof file === "object" && file !== null && "type" in file
      ? (file as { type?: string }).type
      : undefined;
  const refNumber =
    typeof file === "object" && file !== null && "referenceNumber" in file
      ? (file as { referenceNumber?: string }).referenceNumber
      : undefined;
  const serviceName =
    typeof file === "object" && file !== null && "serviceName" in file
      ? (file as { serviceName?: string }).serviceName
      : undefined;
  const applicantName =
    typeof file === "object" && file !== null && "applicantName" in file
      ? (file as { applicantName?: string }).applicantName
      : undefined;
  const uploadedDate =
    typeof file === "object" && file !== null && "uploadedAt" in file
      ? (file as { uploadedAt?: string }).uploadedAt
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
        <View style={[styles.container, isPdf && Platform.OS === 'web' && fileUri ? { maxWidth: 840 } : null]}>
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
              <View style={styles.officialDocSheet}>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetGovText}>REPUBLIC OF THE PHILIPPINES</Text>
                  <Text style={styles.sheetAgencyText}>NATIONAL TELECOMMUNICATIONS COMMISSION</Text>
                  <Text style={styles.sheetSubAgency}>NTC Building, BIR Road, East Triangle, Diliman, Quezon City</Text>
                </View>

                <View style={styles.sheetDivider} />

                <View style={styles.sheetTitleBox}>
                  <Icon name={isPdf ? "file-text" : "paperclip"} size={22} color="#0F2C59" />
                  <Text style={styles.sheetTitleText}>{fileName}</Text>
                  {refNumber ? (
                    <Text style={styles.sheetRefText}>REF NO: #{refNumber}</Text>
                  ) : null}
                </View>

                <View style={styles.sheetDataGrid}>
                  {serviceName ? (
                    <View style={styles.sheetDataRow}>
                      <Text style={styles.sheetLabel}>Service Name:</Text>
                      <Text style={styles.sheetValue}>{serviceName}</Text>
                    </View>
                  ) : null}

                  {applicantName ? (
                    <View style={styles.sheetDataRow}>
                      <Text style={styles.sheetLabel}>Applicant / Company:</Text>
                      <Text style={styles.sheetValue}>{applicantName}</Text>
                    </View>
                  ) : null}

                  {fileCategory ? (
                    <View style={styles.sheetDataRow}>
                      <Text style={styles.sheetLabel}>Document Category:</Text>
                      <Text style={styles.sheetValue}>{fileCategory.replace('_', ' ')}</Text>
                    </View>
                  ) : null}

                  <View style={styles.sheetDataRow}>
                    <Text style={styles.sheetLabel}>Format & Size:</Text>
                    <Text style={styles.sheetValue}>{fileType || (isPdf ? 'PDF Document' : isImage ? 'Image File' : 'Attachment')} · {fileSize || '1.2 MB'}</Text>
                  </View>

                  {uploadedDate ? (
                    <View style={styles.sheetDataRow}>
                      <Text style={styles.sheetLabel}>Uploaded Date:</Text>
                      <Text style={styles.sheetValue}>{uploadedDate}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.sheetStampRow}>
                  <View style={styles.officialStampBadge}>
                    <Icon name="check-circle" size={16} color="#16A34A" />
                    <Text style={styles.officialStampText}>OFFICIALLY VERIFIED & VALID ATTACHMENT</Text>
                  </View>
                </View>

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
  officialDocSheet: {
    width: "100%",
    padding: 24,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  sheetHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  sheetGovText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "800",
    color: "#0F2C59",
    letterSpacing: 1,
  },
  sheetAgencyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "800",
    color: "#0F2C59",
    marginTop: 2,
  },
  sheetSubAgency: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
    textAlign: "center",
  },
  sheetDivider: {
    width: "100%",
    height: 2,
    backgroundColor: "#0F2C59",
    marginVertical: 12,
    borderRadius: 1,
  },
  sheetTitleBox: {
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  sheetTitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: "800",
    color: "#0F2C59",
    textAlign: "center",
  },
  sheetRefText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: "#1D4ED8",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sheetDataGrid: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  sheetDataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
    paddingBottom: 6,
  },
  sheetLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  sheetValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "700",
    color: "#0F2C59",
    maxWidth: "60%",
    textAlign: "right",
  },
  sheetStampRow: {
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  officialStampBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#86EFAC",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  officialStampText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
    letterSpacing: 0.5,
  },
  openExternalBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F2C59",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginTop: 6,
  },
  openExternalBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
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
