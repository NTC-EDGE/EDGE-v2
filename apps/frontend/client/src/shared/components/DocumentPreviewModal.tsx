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
  ActivityIndicator,
  useWindowDimensions,
  Linking,
} from "react-native";
import { Icon, TYPOGRAPHY, ImageCropRotateModal, EditedImageResult } from "@edge/ui";
import { storageService } from "@edge/api";

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
  onSaveEditedImage?: (result: EditedImageResult) => void;
  allowEditImage?: boolean;
}

function isDocumentPreviewFile(file: unknown): file is DocumentPreviewFile {
  return typeof file === "object" && file !== null && "name" in file;
}

export function canClientEditAttachmentImage(params?: {
  allowEditImage?: boolean;
  isSubmitted?: boolean;
  applicationStatus?: string | null;
}): boolean {
  if (!params) return false;
  if (params.isSubmitted === true) return false;
  if (typeof params.applicationStatus === "string" && params.applicationStatus.trim() !== "") {
    const normalizedStatus = params.applicationStatus.trim().toLowerCase();
    if (normalizedStatus !== "draft") {
      return false;
    }
  }
  return params.allowEditImage === true;
}

export function DocumentPreviewModal({
  visible,
  onClose,
  file,
  label,
  onDownload,
  onSaveEditedImage,
  allowEditImage = false,
}: DocumentPreviewModalProps) {
  const { width } = useWindowDimensions();
  const isMobileScreen = width < 768;
  const [imageError, setImageError] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const isObj = isDocumentPreviewFile(file);
  const fileName = typeof file === "string" ? file : isObj ? file.name : "Attachment Document";
  const fileUri = isObj && typeof file.uri === "string" ? file.uri : "";
  const fileType = isObj && typeof file.type === "string" ? file.type : undefined;

  const [activeImageUri, setActiveImageUri] = useState<string>(fileUri);
  const [resolvedMimeType, setResolvedMimeType] = useState<string>("");
  const [isLoadingRemoteBlob, setIsLoadingRemoteBlob] = useState<boolean>(false);
  const [remoteLoadError, setRemoteLoadError] = useState<string | null>(null);

  const trimmedSourceUri = fileUri.trim();
  const isProtectedSourceUri =
    trimmedSourceUri.startsWith("/api/") ||
    trimmedSourceUri.includes("/api/v2/") ||
    trimmedSourceUri.includes("/form/print") ||
    trimmedSourceUri.includes("/issued-document/print") ||
    trimmedSourceUri.includes("/soa/print") ||
    trimmedSourceUri.includes("/op/print") ||
    trimmedSourceUri.includes("/receipts/") ||
    trimmedSourceUri.includes("/storage/files/");

  useEffect(() => {
    setResolvedMimeType("");
    setImageError(false);
    setRemoteLoadError(null);

    if (!visible || !trimmedSourceUri) {
      setActiveImageUri(trimmedSourceUri);
      setIsLoadingRemoteBlob(false);
      return;
    }

    if (!isProtectedSourceUri) {
      setActiveImageUri(trimmedSourceUri);
      setIsLoadingRemoteBlob(false);
      return;
    }

    // Never expose a raw protected API URL directly to <iframe> (violates CSP frame-src and lacks Bearer auth)
    setActiveImageUri("");
    let active = true;
    let createdBlobUrl: string | null = null;
    setIsLoadingRemoteBlob(true);

    (async () => {
      try {
        const [blobData, blobErr] = await storageService.downloadFileByUrl(trimmedSourceUri);
        if (!active) return;
        if (blobErr === null && blobData instanceof Blob && blobData.size > 0) {
          let mime = blobData.type || "";
          if (!mime || mime === "application/octet-stream") {
            const lowerN = (fileName || "").toLowerCase();
            const lowerT = (fileType || "").toLowerCase();
            if (lowerN.endsWith(".pdf") || lowerT.includes("pdf") || trimmedSourceUri.includes("/print")) mime = "application/pdf";
            else if (lowerN.endsWith(".png") || lowerT.includes("png")) mime = "image/png";
            else if (lowerN.endsWith(".jpg") || lowerN.endsWith(".jpeg") || lowerT.includes("jpeg") || lowerT.includes("jpg")) mime = "image/jpeg";
            else if (lowerN.endsWith(".webp") || lowerT.includes("webp")) mime = "image/webp";
            else if (lowerT.startsWith("image")) mime = "image/png";
          }
          const typedBlob = mime ? new Blob([blobData], { type: mime }) : blobData;
          if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
            createdBlobUrl = URL.createObjectURL(typedBlob);
            setActiveImageUri(createdBlobUrl);
            if (mime) setResolvedMimeType(mime);
            setImageError(false);
            setRemoteLoadError(null);
          }
        } else {
          setRemoteLoadError(
            typeof blobErr === "string" && blobErr.trim().length > 0
              ? blobErr
              : "Unable to load document preview from server."
          );
        }
      } catch (err: unknown) {
        if (!active) return;
        setRemoteLoadError(
          err instanceof Error && err.message.trim().length > 0
            ? err.message
            : "Unable to load document preview from server."
        );
      } finally {
        if (active) setIsLoadingRemoteBlob(false);
      }
    })();

    return () => {
      active = false;
      if (createdBlobUrl !== null && typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
        URL.revokeObjectURL(createdBlobUrl);
      }
    };
  }, [trimmedSourceUri, isProtectedSourceUri, file, visible, fileName, fileType]);

  useEffect(() => {
    if (!visible) {
      setScale(1);
      setRotation(0);
    }
  }, [visible]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleResetZoom = () => {
    setScale(1);
    setRotation(0);
  };

  const handleApplyCropRotate = (result: EditedImageResult) => {
    setActiveImageUri(result.uri);
    setIsCropModalOpen(false);
    setScale(1);
    setRotation(0);
    if (onSaveEditedImage !== undefined) {
      onSaveEditedImage(result);
    }
  };

  if (!file) return null;

  const fileNameLower = (fileName || "").toLowerCase();
  const uriLower = (activeImageUri || fileUri || "").toLowerCase();
  const typeLower = (resolvedMimeType || fileType || "").toLowerCase();

  const isPdf =
    fileNameLower.endsWith(".pdf") ||
    uriLower.endsWith(".pdf") ||
    uriLower.includes("application/pdf") ||
    typeLower === "pdf" ||
    typeLower.includes("application/pdf");

  const isImage =
    !isPdf &&
    (fileNameLower.endsWith(".png") ||
      fileNameLower.endsWith(".jpg") ||
      fileNameLower.endsWith(".jpeg") ||
      fileNameLower.endsWith(".webp") ||
      fileNameLower.endsWith(".gif") ||
      fileNameLower.endsWith(".svg") ||
      uriLower.startsWith("data:image") ||
      typeLower === "image" ||
      typeLower.startsWith("image/") ||
      (uriLower.startsWith("blob:") && !isPdf));

  const handleDownloadAction = () => {
    if (onDownload !== undefined) {
      onDownload(file);
      return;
    }

    const downloadTargetUri = (activeImageUri || fileUri || "").trim();
    if (downloadTargetUri && Platform.OS === "web" && typeof window !== "undefined" && typeof document !== "undefined") {
      try {
        const anchor = document.createElement("a");
        anchor.setAttribute("href", downloadTargetUri);
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

  const handleOpenInNewTab = () => {
    const targetUri = (activeImageUri || fileUri || "").trim();
    if (!targetUri) return;
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.open(targetUri, "_blank");
    } else {
      void Linking.openURL(targetUri);
    }
  };

  const effectiveUri = isProtectedSourceUri
    ? activeImageUri.trim()
    : (activeImageUri || fileUri || "").trim();
  const hasValidRenderUri =
    typeof effectiveUri === "string" &&
    effectiveUri.trim() !== "" &&
    effectiveUri.toLowerCase() !== "null" &&
    effectiveUri.toLowerCase() !== "undefined" &&
    (!isProtectedSourceUri || effectiveUri.startsWith("blob:") || effectiveUri.startsWith("data:"));

  return (
    <>
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

            {isImage ? (
              <View style={styles.imageControlsRow}>
                <TouchableOpacity
                  onPress={handleZoomOut}
                  style={styles.controlIconBtn}
                  activeOpacity={0.7}
                  accessibilityLabel="Zoom Out"
                >
                  <Icon name="zoom-out" size={16} color="#1D4ED8" />
                </TouchableOpacity>
                <Text style={styles.zoomText}>{Math.round(scale * 100)}%</Text>
                <TouchableOpacity
                  onPress={handleZoomIn}
                  style={styles.controlIconBtn}
                  activeOpacity={0.7}
                  accessibilityLabel="Zoom In"
                >
                  <Icon name="zoom-in" size={16} color="#1D4ED8" />
                </TouchableOpacity>
                {allowEditImage && (
                  <>
                    <TouchableOpacity
                      onPress={handleRotate}
                      style={styles.controlIconBtn}
                      activeOpacity={0.7}
                      accessibilityLabel="Rotate 90 degrees"
                    >
                      <Icon name="rotate-cw" size={16} color="#1D4ED8" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIsCropModalOpen(true)}
                      style={styles.cropActionBtn}
                      activeOpacity={0.7}
                      accessibilityLabel="Crop & Rotate Image"
                    >
                      <Icon name="crop" size={14} color="#1D4ED8" />
                      <Text style={styles.cropActionBtnText}>Crop & Rotate</Text>
                    </TouchableOpacity>
                  </>
                )}
                {scale !== 1 || (allowEditImage && rotation !== 0) ? (
                  <TouchableOpacity
                    onPress={handleResetZoom}
                    style={styles.resetBtn}
                    activeOpacity={0.7}
                    accessibilityLabel="Reset Zoom and Rotation"
                  >
                    <Text style={styles.resetBtnText}>Reset</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7} accessibilityLabel="Close">
              <Icon name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          <ScrollView contentContainerStyle={styles.bodyContent}>
            {isLoadingRemoteBlob ? (
              <View style={styles.noPreviewCard}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={[styles.noPreviewText, { marginTop: 12 }]}>
                  Loading document preview...
                </Text>
              </View>
            ) : isImage && hasValidRenderUri && !imageError ? (
              /* Simple Pure Image Preview */
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: effectiveUri }}
                  style={[
                    styles.previewImage,
                    {
                      transform: [
                        { scale },
                        { rotate: `${rotation}deg` },
                      ],
                    },
                  ]}
                  resizeMode="contain"
                  onError={() => setImageError(true)}
                />
              </View>
            ) : isPdf && hasValidRenderUri && Platform.OS === "web" ? (
              /* Simple Pure PDF Preview */
              <View style={styles.pdfWrapper}>
                {isMobileScreen ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: "#EFF6FF",
                      borderBottomWidth: 1,
                      borderBottomColor: "#BFDBFE",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 12,
                        color: "#1E3A8A",
                        flex: 1,
                        minWidth: 160,
                      }}
                    >
                      Viewing on a smaller screen? Open or download the PDF directly:
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <TouchableOpacity
                        onPress={handleOpenInNewTab}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 5,
                          backgroundColor: "#FFFFFF",
                          borderWidth: 1,
                          borderColor: "#93C5FD",
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 6,
                        }}
                        activeOpacity={0.8}
                      >
                        <Icon name="external-link" size={13} color="#1D4ED8" />
                        <Text
                          style={{
                            fontFamily: TYPOGRAPHY.fonts.primary,
                            fontSize: 11.5,
                            fontWeight: "700",
                            color: "#1D4ED8",
                          }}
                        >
                          Open PDF in New Tab
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleDownloadAction}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 5,
                          backgroundColor: "#1D4ED8",
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 6,
                        }}
                        activeOpacity={0.8}
                      >
                        <Icon name="download" size={13} color="#FFFFFF" />
                        <Text
                          style={{
                            fontFamily: TYPOGRAPHY.fonts.primary,
                            fontSize: 11.5,
                            fontWeight: "700",
                            color: "#FFFFFF",
                          }}
                        >
                          Download PDF
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
                <iframe
                  src={effectiveUri}
                  title={fileName}
                  style={{
                    width: "100%",
                    height: isMobileScreen ? 440 : 560,
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
                  {remoteLoadError !== null
                    ? remoteLoadError
                    : "A direct inline preview is not available for this document format. You can download the file directly to view it on your device."}
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
          </View>
        </View>
      </View>
    </Modal>

    {allowEditImage && isImage && Boolean(effectiveUri) && (
      <ImageCropRotateModal
        visible={isCropModalOpen}
        imageUri={effectiveUri}
        fileName={fileName}
        title="Crop & Rotate Document"
        onClose={() => setIsCropModalOpen(false)}
        onApply={handleApplyCropRotate}
        allowDownload={true}
      />
    )}
    </>
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
  imageControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 10,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  controlIconBtn: {
    padding: 4,
    borderRadius: 4,
  },
  zoomText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "600",
    color: "#1D4ED8",
    minWidth: 36,
    textAlign: "center",
  },
  resetBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginLeft: 2,
  },
  resetBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
  },
  cropActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 4,
  },
  cropActionBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: "#1D4ED8",
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
