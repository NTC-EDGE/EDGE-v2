import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
  useTheme,
} from "@edge/ui";
import { apiClient } from "@edge/api";

export interface RequirementDocumentPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  fileName?: string;
  fileUrl?: string;
  contentType?: string;
}

export function RequirementDocumentPreviewModal({
  visible,
  onClose,
  title,
  fileName,
  fileUrl,
  contentType,
}: RequirementDocumentPreviewModalProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { isDark, colors } = useTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);
  const blobUrlRef = useRef<string | null>(null);

  const resolvedFileName = fileName || "Document Attachment";
  const lowerFileName = resolvedFileName.toLowerCase();

  const isPdf =
    lowerFileName.endsWith(".pdf") ||
    mimeType.toLowerCase().includes("pdf") ||
    (contentType?.toLowerCase().includes("pdf") ?? false);

  const isImage =
    mimeType.toLowerCase().startsWith("image/") ||
    (contentType?.toLowerCase().startsWith("image/") ?? false) ||
    lowerFileName.endsWith(".png") ||
    lowerFileName.endsWith(".jpg") ||
    lowerFileName.endsWith(".jpeg") ||
    lowerFileName.endsWith(".webp") ||
    lowerFileName.endsWith(".gif") ||
    lowerFileName.endsWith(".bmp") ||
    lowerFileName.endsWith(".tiff") ||
    lowerFileName.endsWith(".tif");

  const dynamicModalWidth = Math.min(windowWidth - 32, isPdf ? 880 : 760);
  const dynamicBodyHeight = Math.min(windowHeight - 200, 560);
  const imageRenderWidth = Math.max(280, Math.min(dynamicModalWidth - 64, 640));
  const imageRenderHeight = Math.max(280, dynamicBodyHeight - 64);

  useEffect(() => {
    if (!visible || !fileUrl || fileUrl.trim() === "") {
      if (blobUrlRef.current !== null && Platform.OS === "web" && typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setBlobUrl(null);
      setLoading(true);
      setError(null);
      return;
    }

    let isMounted = true;
    let currentBlobUrl: string | null = null;

    setLoading(true);
    setError(null);
    setZoomLevel(1);
    setRotation(0);

    const loadDocument = async () => {
      try {
        const response = await apiClient.get(fileUrl, {
          responseType: "blob",
        });

        if (!isMounted) return;

        const responseData: unknown = response.data;
        let detectedMime = contentType || "";

        if (typeof Blob !== "undefined" && responseData instanceof Blob) {
          if (responseData.type && responseData.type.trim() !== "") {
            detectedMime = responseData.type;
          }

          if (!detectedMime || detectedMime === "application/octet-stream") {
            if (lowerFileName.endsWith(".png")) detectedMime = "image/png";
            else if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) detectedMime = "image/jpeg";
            else if (lowerFileName.endsWith(".webp")) detectedMime = "image/webp";
            else if (lowerFileName.endsWith(".gif")) detectedMime = "image/gif";
            else if (lowerFileName.endsWith(".pdf")) detectedMime = "application/pdf";
          }

          setMimeType(detectedMime);

          if (Platform.OS === "web" && typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
            // Re-wrap with detected mime if needed for browser image decoder
            const finalBlob = responseData.type === detectedMime
              ? responseData
              : new Blob([responseData], { type: detectedMime });
            currentBlobUrl = URL.createObjectURL(finalBlob);
            blobUrlRef.current = currentBlobUrl;
            setBlobUrl(currentBlobUrl);
          } else {
            setBlobUrl(fileUrl);
          }
        } else {
          setBlobUrl(fileUrl);
          setMimeType(detectedMime);
        }
        setLoading(false);
      } catch (err: unknown) {
        if (!isMounted) return;
        const errorMessage =
          typeof err === "object" && err !== null && "message" in err && typeof (err as { message: unknown }).message === "string"
            ? (err as { message: string }).message
            : "Failed to download and decrypt requirement document.";
        setError(errorMessage);
        setLoading(false);
      }
    };

    loadDocument();

    return () => {
      isMounted = false;
      if (currentBlobUrl !== null && Platform.OS === "web" && typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
        URL.revokeObjectURL(currentBlobUrl);
        if (blobUrlRef.current === currentBlobUrl) {
          blobUrlRef.current = null;
        }
      }
    };
  }, [visible, fileUrl, contentType, retryTrigger, lowerFileName]);

  const handleClose = () => {
    if (blobUrlRef.current !== null && Platform.OS === "web" && typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setBlobUrl(null);
    onClose();
  };

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (!blobUrl) return;

    if (Platform.OS === "web" && typeof document !== "undefined") {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "requirement_document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              width: dynamicModalWidth,
              backgroundColor: isDark ? colors.neutral[900] : colors.neutral.white,
              borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200],
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
              },
            ]}
          >
            <View style={styles.headerTitleGroup}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isPdf
                      ? isDark
                        ? "rgba(239, 68, 68, 0.15)"
                        : "#FEF2F2"
                      : isDark
                      ? "rgba(59, 130, 246, 0.15)"
                      : "#EFF6FF",
                  },
                ]}
              >
                <Lucide
                  name={isPdf ? "file-text" : isImage ? "image" : "paperclip"}
                  size={18}
                  color={
                    isPdf
                      ? COLORS.semantic.error
                      : isDark
                      ? colors.brand[400]
                      : colors.brand[700]
                  }
                />
              </View>
              <View style={styles.headerTextWrapper}>
                <Text
                  style={[
                    styles.headerTitle,
                    {
                      color: isDark ? colors.neutral[100] : colors.neutral[900],
                    },
                  ]}
                  numberOfLines={1}
                >
                  {title || "Requirement Document"}
                </Text>
                <Text
                  style={[
                    styles.headerSubtitle,
                    {
                      color: isDark ? colors.neutral[400] : colors.neutral[500],
                    },
                  ]}
                  numberOfLines={1}
                >
                  {resolvedFileName}
                </Text>
              </View>
            </View>

            {/* Quick Actions (Zoom, Rotate, Close) */}
            <View style={styles.headerActions}>
              {isImage && !loading && !error && (
                <>
                  <Pressable
                    style={[
                      styles.headerToolBtn,
                      {
                        backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                      },
                    ]}
                    onPress={handleZoomOut}
                    accessibilityLabel="Zoom Out"
                  >
                    <Lucide
                      name="zoom-out"
                      size={15}
                      color={isDark ? colors.neutral[300] : colors.neutral[700]}
                    />
                  </Pressable>

                  <Pressable
                    style={[
                      styles.headerToolBtn,
                      {
                        backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                      },
                    ]}
                    onPress={handleZoomIn}
                    accessibilityLabel="Zoom In"
                  >
                    <Lucide
                      name="zoom-in"
                      size={15}
                      color={isDark ? colors.neutral[300] : colors.neutral[700]}
                    />
                  </Pressable>

                  <Pressable
                    style={[
                      styles.headerToolBtn,
                      {
                        backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                      },
                    ]}
                    onPress={handleRotate}
                    accessibilityLabel="Rotate 90 degrees"
                  >
                    <Lucide
                      name="rotate-cw"
                      size={15}
                      color={isDark ? colors.neutral[300] : colors.neutral[700]}
                    />
                  </Pressable>

                  {(zoomLevel !== 1 || rotation !== 0) && (
                    <Pressable
                      style={[
                        styles.headerToolBtn,
                        {
                          backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                        },
                      ]}
                      onPress={handleResetView}
                      accessibilityLabel="Reset View"
                    >
                      <Lucide
                        name="maximize-2"
                        size={15}
                        color={isDark ? colors.neutral[300] : colors.neutral[700]}
                      />
                    </Pressable>
                  )}
                </>
              )}

              <Pressable
                style={[
                  styles.closeBtn,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[200],
                  },
                ]}
                onPress={handleClose}
                accessibilityLabel="Close Preview Dialog"
              >
                <Lucide
                  name="x"
                  size={18}
                  color={isDark ? colors.neutral[300] : colors.neutral[700]}
                />
              </Pressable>
            </View>
          </View>

          {/* Content Body */}
          <View
            style={[
              styles.body,
              {
                height: dynamicBodyHeight,
                backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100],
              },
            ]}
          >
            {loading ? (
              <View style={styles.centerState}>
                <ActivityIndicator
                  size="large"
                  color={isDark ? colors.brand[400] : colors.brand[700]}
                />
                <Text
                  style={[
                    styles.loadingText,
                    {
                      color: isDark ? colors.neutral[300] : colors.neutral[600],
                    },
                  ]}
                >
                  Retrieving and decrypting document...
                </Text>
              </View>
            ) : error !== null ? (
              <View style={styles.centerState}>
                <View
                  style={[
                    styles.errorIconCircle,
                    {
                      backgroundColor: isDark
                        ? "rgba(239, 68, 68, 0.2)"
                        : "#FEE2E2",
                    },
                  ]}
                >
                  <Lucide
                    name="alert-triangle"
                    size={28}
                    color={COLORS.semantic.error}
                  />
                </View>
                <Text
                  style={[
                    styles.errorTitle,
                    {
                      color: isDark ? colors.neutral[100] : colors.neutral[900],
                    },
                  ]}
                >
                  Unable to Display Document
                </Text>
                <Text
                  style={[
                    styles.errorSubtitle,
                    {
                      color: isDark ? colors.neutral[400] : colors.neutral[500],
                    },
                  ]}
                >
                  {error}
                </Text>
                <Pressable
                  style={[
                    styles.retryBtn,
                    {
                      backgroundColor: isDark
                        ? colors.brand[800]
                        : colors.brand[700],
                    },
                  ]}
                  onPress={handleRetry}
                >
                  <Lucide name="refresh-cw" size={14} color={COLORS.neutral.white} />
                  <Text style={styles.retryBtnText}>Retry</Text>
                </Pressable>
              </View>
            ) : isImage && blobUrl !== null ? (
              <ScrollView
                style={styles.imageScrollView}
                contentContainerStyle={styles.imageScrollContainer}
                maximumZoomScale={3}
                minimumZoomScale={0.5}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              >
                <View
                  style={[
                    styles.imageTransformWrapper,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                      transform: [
                        { scale: zoomLevel },
                        { rotate: `${rotation}deg` },
                      ],
                    },
                  ]}
                >
                  <Image
                    source={{ uri: blobUrl }}
                    style={{
                      width: imageRenderWidth,
                      height: imageRenderHeight,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </ScrollView>
            ) : isPdf && blobUrl !== null && Platform.OS === "web" ? (
              <View style={styles.pdfIframeWrapper}>
                <iframe
                  src={blobUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: RADIUS.sm,
                  }}
                  title={title}
                />
              </View>
            ) : (
              <View style={styles.centerState}>
                <View
                  style={[
                    styles.fileIconBig,
                    {
                      backgroundColor: isDark
                        ? colors.neutral[800]
                        : colors.neutral[200],
                    },
                  ]}
                >
                  <Lucide
                    name="file-text"
                    size={48}
                    color={isDark ? colors.brand[400] : colors.brand[700]}
                  />
                </View>
                <Text
                  style={[
                    styles.unsupportedDocTitle,
                    {
                      color: isDark ? colors.neutral[100] : colors.neutral[900],
                    },
                  ]}
                >
                  {resolvedFileName}
                </Text>
                <Text
                  style={[
                    styles.unsupportedDocHint,
                    {
                      color: isDark ? colors.neutral[400] : colors.neutral[500],
                    },
                  ]}
                >
                  Document decrypted successfully. You can download the file below to view it with your local reader.
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              {
                borderTopColor: isDark ? colors.neutral[800] : colors.neutral[200],
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
              },
            ]}
          >
            <View style={styles.footerLeft}>
              {zoomLevel !== 1 && isImage && (
                <Text
                  style={[
                    styles.zoomInfoText,
                    {
                      color: isDark ? colors.neutral[400] : colors.neutral[500],
                    },
                  ]}
                >
                  Zoom: {Math.round(zoomLevel * 100)}%
                </Text>
              )}
            </View>

            <View style={styles.footerActions}>
              {blobUrl !== null && (
                <Pressable
                  style={[
                    styles.downloadBtn,
                    {
                      backgroundColor: isDark
                        ? colors.neutral[800]
                        : colors.neutral[200],
                      borderColor: isDark
                        ? colors.neutral[700]
                        : colors.neutral[300],
                    },
                  ]}
                  onPress={handleDownload}
                >
                  <Lucide
                    name="download"
                    size={14}
                    color={isDark ? colors.neutral[200] : colors.neutral[800]}
                  />
                  <Text
                    style={[
                      styles.downloadBtnText,
                      {
                        color: isDark ? colors.neutral[200] : colors.neutral[800],
                      },
                    ]}
                  >
                    Download File
                  </Text>
                </Pressable>
              )}

              <Pressable
                style={[
                  styles.closeActionBtn,
                  {
                    backgroundColor: isDark
                      ? colors.brand[700]
                      : colors.brand[800],
                  },
                ]}
                onPress={handleClose}
              >
                <Text style={styles.closeActionBtnText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING[16],
  },
  container: {
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    overflow: "hidden",
    alignSelf: "center",
    ...SHADOWS.modal,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[12],
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[12],
    flex: 1,
    marginRight: SPACING[12],
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrapper: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
  },
  headerToolBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SPACING[4],
  },
  body: {
    width: "100%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING[32],
  },
  loadingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: SPACING[12],
  },
  errorIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING[12],
  },
  errorTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING[4],
  },
  errorSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 360,
    lineHeight: 18,
    marginBottom: SPACING[16],
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
  },
  retryBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  imageScrollView: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  imageScrollContainer: {
    flexGrow: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING[16],
  },
  imageTransformWrapper: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.card,
    overflow: "hidden",
    borderWidth: 1,
    padding: SPACING[4],
  },
  pdfIframeWrapper: {
    width: "100%",
    height: "100%",
    padding: SPACING[8],
  },
  fileIconBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING[16],
  },
  unsupportedDocTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: "center",
    marginBottom: SPACING[6],
  },
  unsupportedDocHint: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 400,
    lineHeight: 19,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[12],
    borderTopWidth: 1,
  },
  footerLeft: {
    flex: 1,
  },
  zoomInfoText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[10],
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  downloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  closeActionBtn: {
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
  },
  closeActionBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
});
