import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, Platform } from "react-native";
import { Icon } from "@edge/ui";
import { COLORS, TYPOGRAPHY } from "../theme/tokens";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { UploadChoiceDialog } from "../../auth/Services/shared/components/UploadChoiceDialog";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import { CameraCaptureModal, CapturedPhoto } from "./CameraCaptureModal";

export interface DocumentRequirement {
  key: string;       // Unique lookup key in uploads object
  label: string;     // Display label
  required?: boolean;
  hint?: string;
  description?: string;
}

export interface UploadedFile {
  name: string;
  uri?: string;
  type?: string;
  file?: File | Blob;
}

interface SharedDocumentUploadProps {
  requirements: DocumentRequirement[];
  uploads: Record<string, UploadedFile | string | undefined>;
  onUpload: (key: string, file: { name: string; uri: string; type?: string; file?: File | Blob }) => void;
  onRemove: (key: string) => void;
  isWeb: boolean;
  errors?: Record<string, string>;
}

export function SharedDocumentUpload({
  requirements,
  uploads = {},
  onUpload,
  onRemove,
  isWeb,
  errors = {},
}: SharedDocumentUploadProps) {
  const safeUploads = uploads ?? {};
  const [selectedReqIndex, setSelectedReqIndex] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [activeSlotKey, setActiveSlotKey] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const [previewFile, setPreviewFile] = useState<{ name: string; uri?: string; type?: string } | string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Safely clamp selected index in case requirements list changes dynamically
  const activeIndex = Math.max(0, Math.min(selectedReqIndex, requirements.length - 1));
  const activeReq = requirements[activeIndex];
  const isActiveReqUploaded = Boolean(activeReq && safeUploads[activeReq.key]);
  const dropzoneRef = useRef<any>(null);

  const handleRemoveSlot = useCallback(
    (key: string) => {
      setIsPreviewOpen(false);
      setPreviewFile(null);
      onRemove(key);
    },
    [onRemove]
  );

  // Prevent default browser behavior on web (opening dropped files in a new tab)
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const preventDefaultWindowDrop = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener("dragover", preventDefaultWindowDrop);
    window.addEventListener("drop", preventDefaultWindowDrop);

    return () => {
      window.removeEventListener("dragover", preventDefaultWindowDrop);
      window.removeEventListener("drop", preventDefaultWindowDrop);
    };
  }, []);

  const handleFileDrop = useCallback(
    (files: FileList | File[] | null | undefined, targetKey?: string) => {
      const slotKey = targetKey || activeReq?.key;
      if (!slotKey || !files || files.length === 0) return;

      const file = files[0];
      if (!file) return;

      const fileName = file.name || "uploaded_document";
      const ext = fileName.toLowerCase().split(".").pop() || "";
      const validExts = ["pdf", "png", "jpg", "jpeg", "webp"];
      const isImageOrPdf =
        (file.type && (file.type.startsWith("image/") || file.type === "application/pdf")) ||
        validExts.includes(ext);

      if (!isImageOrPdf) {
        Alert.alert(
          "Unsupported Format",
          "Please upload a clear scanned PDF document or image file (PNG, JPEG, WEBP)."
        );
        return;
      }

      const fileUri =
        typeof URL !== "undefined" && typeof URL.createObjectURL === "function"
          ? URL.createObjectURL(file)
          : "";

      onUpload(slotKey, {
        name: fileName,
        uri: fileUri,
        type: file.type || undefined,
        file,
      });
    },
    [activeReq?.key, onUpload]
  );

  // Attach native drag and drop listeners to dropzone DOM element on Web
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const el = dropzoneRef.current;
    if (!el) return;

    const targetNode: HTMLElement | null = el.tagName ? el : el.children?.[0] || null;
    const target = targetNode || el;
    if (!target || typeof target.addEventListener !== "function") return;

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
      setIsDraggingOver(true);
    };

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(true);
    };

    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
    };

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
      if (e.dataTransfer && e.dataTransfer.files) {
        handleFileDrop(e.dataTransfer.files, activeReq?.key);
      }
    };

    target.addEventListener("dragover", onDragOver);
    target.addEventListener("dragenter", onDragEnter);
    target.addEventListener("dragleave", onDragLeave);
    target.addEventListener("drop", onDrop);

    return () => {
      target.removeEventListener("dragover", onDragOver);
      target.removeEventListener("dragenter", onDragEnter);
      target.removeEventListener("dragleave", onDragLeave);
      target.removeEventListener("drop", onDrop);
    };
  }, [activeReq?.key, isActiveReqUploaded, handleFileDrop]);

  const triggerUpload = (key: string) => {
    setActiveSlotKey(key);
    setIsSheetOpen(true);
  };

  const handleDocumentPick = async () => {
    if (!activeSlotKey) return;
    setIsSheetOpen(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (!asset) return;
        const rawWebFile = "file" in asset && asset.file instanceof Blob ? asset.file : undefined;
        onUpload(activeSlotKey, {
          name: asset.name,
          uri: asset.uri,
          type: asset.mimeType || undefined,
          file: rawWebFile,
        });
      }
    } catch (err) {
      console.error("Document picking error:", err);
      Alert.alert("Error", "Failed to select document.");
    }
  };

  const handleCameraCapture = (captured: CapturedPhoto) => {
    if (!activeSlotKey) return;
    onUpload(activeSlotKey, {
      name: captured.name,
      uri: captured.uri,
      type: captured.type,
      file: captured.file,
    });
  };

  const handleCameraLaunch = async () => {
    if (!activeSlotKey) return;
    setIsSheetOpen(false);

    if (
      Platform.OS === "web" &&
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function"
    ) {
      setIsCameraModalOpen(true);
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Camera access is required to take photos of documents.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (!asset) return;
        const fileName = asset.fileName || `scanned_doc_${Date.now()}.jpg`;
        const rawWebFile = "file" in asset && asset.file instanceof Blob ? asset.file : undefined;
        onUpload(activeSlotKey, {
          name: fileName,
          uri: asset.uri,
          type: asset.mimeType || "image/jpeg",
          file: rawWebFile,
        });
      }
    } catch (err) {
      console.error("Camera error:", err);
      Alert.alert("Error", "Failed to launch camera.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Please upload clear scanned documents (PDF or JPEG/PNG) for each of the listed requirements below:
      </Text>

      {isWeb ? (
        /* WEB View: Side-by-Side Split Grid View */
        <View style={styles.webGrid}>
          {/* Left panel: List of requirements */}
          <View style={styles.leftPanel}>
            {requirements.map((req, i) => {
              const uploadData = safeUploads[req.key];
              const isUploaded = !!uploadData;
              const isSelected = i === activeIndex;
              const hasReqError = Boolean(
                !isUploaded &&
                  errors &&
                  (errors[req.key] ||
                    errors[req.label] ||
                    errors[`req-${i}`] ||
                    errors[req.label.replace(/\*$/, "").trim()])
              );

              return (
                <TouchableOpacity
                  key={req.key}
                  onPress={() => setSelectedReqIndex(i)}
                  style={[
                    styles.reqTab,
                    isSelected && styles.reqTabSelected,
                    hasReqError && styles.reqTabError,
                  ]}
                >
                  <Text
                    style={[
                      styles.reqTabText,
                      isSelected && styles.reqTabTextSelected,
                      hasReqError && styles.reqTabTextError,
                    ]}
                  >
                    {i + 1}. {req.label}
                    {req.required && <Text style={styles.asterisk}>*</Text>}
                  </Text>
                  <Icon
                    name={isUploaded ? "check-circle" : hasReqError ? "alert-circle" : "circle"}
                    size={18}
                    color={isUploaded ? COLORS.semantic.success : hasReqError ? COLORS.semantic.error : COLORS.neutral[300]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Right panel: Large drag-drop style dropzone & previews */}
          <View style={styles.rightPanel}>
            {activeReq && (() => {
              const uploadData = safeUploads[activeReq.key];
              const fileName = typeof uploadData === "string" ? uploadData : uploadData?.name;
              const fileUri = typeof uploadData === "string" ? "" : uploadData?.uri;
              const fileType = typeof uploadData === "object" && uploadData !== null ? uploadData.type : undefined;
              const nameOrUriLower = (fileName || fileUri || "").toLowerCase();
              const isImage = Boolean(
                fileUri &&
                  (nameOrUriLower.endsWith(".png") ||
                    nameOrUriLower.endsWith(".jpg") ||
                    nameOrUriLower.endsWith(".jpeg") ||
                    nameOrUriLower.endsWith(".webp") ||
                    nameOrUriLower.endsWith(".gif") ||
                    fileUri.startsWith("data:image") ||
                    (fileType && fileType.startsWith("image/")))
              );

              const extraHint = (activeReq.hint || activeReq.description || "").trim();
              const isDuplicateHint =
                !extraHint ||
                extraHint.toLowerCase() === activeReq.label.toLowerCase() ||
                activeReq.label.toLowerCase().includes(extraHint.toLowerCase()) ||
                extraHint.toLowerCase().includes(activeReq.label.toLowerCase());

              const hasActiveReqError = Boolean(
                activeReq &&
                  !uploadData &&
                  errors &&
                  (errors[activeReq.key] ||
                    errors[activeReq.label] ||
                    errors[`req-${activeIndex}`] ||
                    errors[activeReq.label.replace(/\*$/, "").trim()])
              );
              const activeErrorMessage =
                hasActiveReqError && errors
                  ? errors[activeReq.key] ||
                    errors[activeReq.label] ||
                    errors[`req-${activeIndex}`] ||
                    errors[activeReq.label.replace(/\*$/, "").trim()] ||
                    "This document is required."
                  : "";

              return (
                <View style={styles.dropzoneContainer}>
                  <Text style={styles.activeReqTitle}>
                    {activeReq.label}
                    {activeReq.required && <Text style={styles.asterisk}>*</Text>}
                  </Text>
                  {!isDuplicateHint && (
                    <View style={styles.hintContainer}>
                      <Icon name="info" size={14} color="#1D4ED8" style={{ marginTop: 2, marginRight: 6 }} />
                      <Text style={styles.hintText}>
                        {extraHint}
                      </Text>
                    </View>
                  )}

                  {uploadData ? (
                    <View style={styles.previewBox}>
                      {isImage ? (
                        <Image
                          source={{ uri: fileUri }}
                          style={styles.imagePreview}
                        />
                      ) : (
                        <View style={styles.pdfPreviewPlaceholder}>
                          <Icon name="file-text" size={48} color={COLORS.neutral[400]} />
                          <Text style={styles.pdfPlaceholderText}>Scanned PDF Document</Text>
                        </View>
                      )}
                      <Text style={styles.fileNameText} numberOfLines={1}>
                        {fileName}
                      </Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 8 }}>
                        <TouchableOpacity
                          onPress={() => {
                            setPreviewFile(uploadData);
                            setPreviewLabel(activeReq.label);
                            setIsPreviewOpen(true);
                          }}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#EFF6FF",
                            borderWidth: 1,
                            borderColor: "#BFDBFE",
                            paddingVertical: 8,
                            paddingHorizontal: 14,
                            borderRadius: 20,
                          }}
                          activeOpacity={0.7}
                        >
                          <Icon name="eye" size={15} color="#1D4ED8" style={{ marginRight: 6 }} />
                          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#1D4ED8" }}>
                            View Document
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => triggerUpload(activeReq.key)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#F8FAFC",
                            borderWidth: 1,
                            borderColor: "#CBD5E1",
                            paddingVertical: 8,
                            paddingHorizontal: 14,
                            borderRadius: 20,
                          }}
                          activeOpacity={0.7}
                        >
                          <Icon name="refresh-cw" size={15} color="#334155" style={{ marginRight: 6 }} />
                          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#334155" }}>
                            Replace
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleRemoveSlot(activeReq.key)}
                          style={styles.removeBtn}
                        >
                          <Icon name="trash-2" size={16} color={COLORS.semantic.error} style={{ marginRight: 6 }} />
                          <Text style={styles.removeBtnText}>Remove Upload</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <TouchableOpacity
                        ref={dropzoneRef}
                        onPress={() => triggerUpload(activeReq.key)}
                        style={[
                          styles.dashedDropzone,
                          isDraggingOver && styles.dashedDropzoneDragOver,
                          hasActiveReqError && styles.dashedDropzoneError,
                        ]}
                        activeOpacity={0.85}
                        {...({
                          onDragOver: (e: any) => {
                            if (e?.preventDefault) e.preventDefault();
                            if (e?.stopPropagation) e.stopPropagation();
                            if (e?.dataTransfer) e.dataTransfer.dropEffect = "copy";
                            setIsDraggingOver(true);
                          },
                          onDragEnter: (e: any) => {
                            if (e?.preventDefault) e.preventDefault();
                            if (e?.stopPropagation) e.stopPropagation();
                            setIsDraggingOver(true);
                          },
                          onDragLeave: (e: any) => {
                            if (e?.preventDefault) e.preventDefault();
                            if (e?.stopPropagation) e.stopPropagation();
                            setIsDraggingOver(false);
                          },
                          onDrop: (e: any) => {
                            if (e?.preventDefault) e.preventDefault();
                            if (e?.stopPropagation) e.stopPropagation();
                            setIsDraggingOver(false);
                            if (e?.dataTransfer?.files) {
                              handleFileDrop(e.dataTransfer.files, activeReq.key);
                            }
                          },
                        } as any)}
                      >
                        <Icon
                          name={isDraggingOver ? "download-cloud" : "upload-cloud"}
                          size={48}
                          color={hasActiveReqError ? COLORS.semantic.error : isDraggingOver ? "#2563EB" : COLORS.brand[700]}
                          style={{ marginBottom: 12 }}
                        />
                        <Text
                          style={[
                            styles.uploadTitleText,
                            isDraggingOver && { color: "#1D4ED8" },
                            hasActiveReqError && { color: COLORS.semantic.error },
                          ]}
                        >
                          {isDraggingOver ? "Release to drop file here" : "Drag & drop or Click to upload"}
                        </Text>
                        <Text
                          style={[
                            styles.uploadSubtext,
                            hasActiveReqError && { color: COLORS.semantic.error },
                          ]}
                        >
                          Supports scanned PDFs, JPEGs, PNGs, or WEBP
                        </Text>
                      </TouchableOpacity>
                      {hasActiveReqError && activeErrorMessage !== "" && (
                        <View style={styles.errorBanner}>
                          <Icon name="alert-circle" size={14} color={COLORS.semantic.error} style={{ marginRight: 6 }} />
                          <Text style={styles.errorText}>
                            {activeErrorMessage}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              );
            })()}
          </View>
        </View>
      ) : (
        /* MOBILE View: Clean vertical list with mini previews */
        <View style={styles.mobileList}>
          {requirements.map((req, i) => {
            const uploadData = safeUploads[req.key];
            const fileName = typeof uploadData === "string" ? uploadData : uploadData?.name;
            const fileUri = typeof uploadData === "string" ? "" : uploadData?.uri;
            const fileType = typeof uploadData === "object" && uploadData !== null ? uploadData.type : undefined;
            const nameOrUriLower = (fileName || fileUri || "").toLowerCase();
            const isImage = Boolean(
              fileUri &&
                (nameOrUriLower.endsWith(".png") ||
                  nameOrUriLower.endsWith(".jpg") ||
                  nameOrUriLower.endsWith(".jpeg") ||
                  nameOrUriLower.endsWith(".webp") ||
                  nameOrUriLower.endsWith(".gif") ||
                  fileUri.startsWith("data:image") ||
                  (fileType && fileType.startsWith("image/")))
            );

            const extraHint = (req.hint || req.description || "").trim();
            const isDuplicateHint =
              !extraHint ||
              extraHint.toLowerCase() === req.label.toLowerCase() ||
              req.label.toLowerCase().includes(extraHint.toLowerCase()) ||
              extraHint.toLowerCase().includes(req.label.toLowerCase());

            const isUploaded = !!uploadData;
            const hasMobileReqError = Boolean(
              !isUploaded &&
                errors &&
                (errors[req.key] ||
                  errors[req.label] ||
                  errors[`req-${i}`] ||
                  errors[req.label.replace(/\*$/, "").trim()])
            );
            const mobileErrorMessage =
              hasMobileReqError && errors
                ? errors[req.key] ||
                  errors[req.label] ||
                  errors[`req-${i}`] ||
                  errors[req.label.replace(/\*$/, "").trim()] ||
                  "This document is required."
                : "";

            return (
              <View
                key={req.key}
                style={[
                  styles.mobileCard,
                  hasMobileReqError && styles.mobileCardError,
                ]}
              >
                <Text
                  style={[
                    styles.mobileCardTitle,
                    hasMobileReqError && { color: COLORS.semantic.error },
                  ]}
                >
                  {i + 1}. {req.label}
                  {req.required && <Text style={styles.asterisk}>*</Text>}
                </Text>
                {!isDuplicateHint && (
                  <View style={styles.mobileHintContainer}>
                    <Text style={styles.mobileHintText}>
                      {extraHint}
                    </Text>
                  </View>
                )}

                {uploadData ? (
                  <View style={styles.mobileSuccessRow}>
                    {isImage ? (
                      <Image
                        source={{ uri: fileUri }}
                        style={styles.mobileThumbnail}
                      />
                    ) : (
                      <View style={styles.mobileIconPlaceholder}>
                        <Icon name="file-text" size={20} color={COLORS.neutral[500]} />
                      </View>
                    )}
                    <View style={styles.mobileFileDetails}>
                      <Text style={styles.mobileFileName} numberOfLines={1}>
                        {fileName}
                      </Text>
                      <Text style={styles.mobileUploadedCheck}>
                        Uploaded ✓
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        setPreviewFile(uploadData);
                        setPreviewLabel(req.label);
                        setIsPreviewOpen(true);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#EFF6FF",
                        borderWidth: 1,
                        borderColor: "#BFDBFE",
                        paddingVertical: 5,
                        paddingHorizontal: 10,
                        borderRadius: 8,
                        marginRight: 6,
                      }}
                      activeOpacity={0.7}
                    >
                      <Icon name="eye" size={13} color="#1D4ED8" style={{ marginRight: 4 }} />
                      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>
                        View
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => triggerUpload(req.key)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#F8FAFC",
                        borderWidth: 1,
                        borderColor: "#CBD5E1",
                        paddingVertical: 5,
                        paddingHorizontal: 8,
                        borderRadius: 8,
                        marginRight: 4,
                      }}
                      activeOpacity={0.7}
                    >
                      <Icon name="refresh-cw" size={13} color="#334155" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleRemoveSlot(req.key)} style={styles.mobileTrashBtn}>
                      <Icon name="trash-2" size={16} color={COLORS.semantic.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => triggerUpload(req.key)}
                      style={[
                        styles.mobileDashedBtn,
                        hasMobileReqError && styles.mobileDashedBtnError,
                      ]}
                    >
                      <Icon
                        name="upload-cloud"
                        size={18}
                        color={hasMobileReqError ? COLORS.semantic.error : COLORS.brand[700]}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={[
                          styles.mobileDashedBtnText,
                          hasMobileReqError && styles.mobileDashedBtnTextError,
                        ]}
                      >
                        Upload scanned document
                      </Text>
                    </TouchableOpacity>
                    {hasMobileReqError && mobileErrorMessage !== "" && (
                      <View style={styles.mobileErrorRow}>
                        <Icon name="alert-circle" size={13} color={COLORS.semantic.error} style={{ marginRight: 4 }} />
                        <Text style={styles.mobileErrorText}>
                          {mobileErrorMessage}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Upload Choice Bottom Sheet dialog */}
      <UploadChoiceDialog
        visible={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onDocumentPick={handleDocumentPick}
        onCameraLaunch={handleCameraLaunch}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        visible={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={previewFile}
        label={previewLabel}
      />

      {/* Live Camera Viewfinder Modal */}
      <CameraCaptureModal
        visible={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        onFallbackToFilePick={handleDocumentPick}
        title={`Scan / Take Photo - ${activeReq?.label || "Document"}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  description: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
    marginBottom: 16,
  },
  asterisk: {
    color: COLORS.semantic.error,
  },
  /* Web View Styles */
  webGrid: {
    flexDirection: "row",
    gap: 24,
    minHeight: 400,
  },
  leftPanel: {
    flex: 1.2,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  reqTab: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 8,
  },
  reqTabSelected: {
    backgroundColor: COLORS.brand[100] || '#e6edff',
    borderColor: COLORS.brand[700],
  },
  reqTabText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.neutral[700],
    marginRight: 8,
  },
  reqTabTextSelected: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[900],
  },
  rightPanel: {
    flex: 1.5,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    justifyContent: "center",
  },
  dropzoneContainer: {
    alignItems: "flex-start",
    width: "100%",
  },
  activeReqTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
    marginBottom: 16,
    textAlign: "left",
    width: "100%",
  },
  previewBox: {
    width: "100%",
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "contain",
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    marginBottom: 16,
  },
  pdfPreviewPlaceholder: {
    width: "100%",
    height: 140,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  pdfPlaceholderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 8,
  },
  fileNameText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[800],
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 16,
    textAlign: "center",
  },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.semantic.errorBg,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  removeBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.semantic.error,
  },
  dashedDropzone: {
    width: "100%",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.brand[500],
    borderRadius: 12,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.neutral[50],
  },
  dashedDropzoneDragOver: {
    borderColor: "#2563EB",
    borderWidth: 2,
    borderStyle: "solid",
    backgroundColor: "#EFF6FF",
  },
  uploadTitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[700],
    marginBottom: 4,
  },
  uploadSubtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
  },
  /* Mobile View Styles */
  mobileList: {
    flexDirection: "column",
  },
  mobileCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  mobileCardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[800],
    marginBottom: 12,
    lineHeight: 18,
  },
  mobileSuccessRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.semantic.successBg,
    padding: 8,
    borderRadius: 8,
  },
  mobileThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 6,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.semantic.successBorder,
  },
  mobileIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: COLORS.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  mobileFileDetails: {
    flex: 1,
    marginRight: 8,
  },
  mobileFileName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[800],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  mobileUploadedCheck: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.semantic.success,
    marginTop: 2,
  },
  mobileTrashBtn: {
    padding: 6,
  },
  mobileDashedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.brand[500],
    padding: 10,
    borderRadius: 8,
  },
  mobileDashedBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    width: "100%",
  },
  hintText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 17,
    flex: 1,
  },
  mobileHintContainer: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  mobileHintText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    color: "#475569",
    lineHeight: 16,
  },
  reqTabError: {
    borderColor: COLORS.semantic.error,
    borderWidth: 1.5,
    backgroundColor: "#FEF2F2",
  },
  reqTabTextError: {
    color: COLORS.semantic.error,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dashedDropzoneError: {
    borderColor: COLORS.semantic.error,
    borderWidth: 2,
    backgroundColor: "#FEF2F2",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    width: "100%",
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.semantic.error,
    flex: 1,
  },
  mobileCardError: {
    borderColor: COLORS.semantic.error,
    borderWidth: 1.5,
    backgroundColor: "#FFF5F5",
  },
  mobileDashedBtnError: {
    borderColor: COLORS.semantic.error,
    backgroundColor: "#FEF2F2",
  },
  mobileDashedBtnTextError: {
    color: COLORS.semantic.error,
  },
  mobileErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  mobileErrorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.semantic.error,
    flex: 1,
  },
});
