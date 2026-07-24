import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import { Icon } from "@edge/ui";
import { COLORS, TYPOGRAPHY } from "../theme/tokens";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { UploadChoiceDialog } from "../../auth/Services/shared/components/UploadChoiceDialog";

export interface DocumentRequirement {
  key: string;       // Unique lookup key in uploads object
  label: string;     // Display label
  required?: boolean;
}

interface SharedDocumentUploadProps {
  requirements: DocumentRequirement[];
  uploads: Record<string, any>;
  onUpload: (key: string, file: { name: string; uri: string }) => void;
  onRemove: (key: string) => void;
  isWeb: boolean;
}

export function SharedDocumentUpload({
  requirements,
  uploads,
  onUpload,
  onRemove,
  isWeb,
}: SharedDocumentUploadProps) {
  const [selectedReqIndex, setSelectedReqIndex] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeSlotKey, setActiveSlotKey] = useState<string | null>(null);

  // Safely clamp selected index in case requirements list changes dynamically
  const activeIndex = Math.max(0, Math.min(selectedReqIndex, requirements.length - 1));
  const activeReq = requirements[activeIndex];

  const triggerUpload = (key: string) => {
    setActiveSlotKey(key);
    setIsSheetOpen(true);
  };

  const handleDocumentPick = async () => {
    if (!activeSlotKey) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        onUpload(activeSlotKey, { name: file.name, uri: file.uri });
        setIsSheetOpen(false);
      }
    } catch (err) {
      console.error("Document picking error:", err);
      Alert.alert("Error", "Failed to select document.");
    }
  };

  const handleCameraLaunch = async () => {
    if (!activeSlotKey) return;
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
        const file = result.assets[0];
        const fileName = file.fileName || `scanned_doc_${Date.now()}.jpg`;
        onUpload(activeSlotKey, { name: fileName, uri: file.uri });
        setIsSheetOpen(false);
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
              const uploadData = uploads[req.key];
              const isUploaded = !!uploadData;
              const isSelected = i === activeIndex;

              return (
                <TouchableOpacity
                  key={req.key}
                  onPress={() => setSelectedReqIndex(i)}
                  style={[
                    styles.reqTab,
                    isSelected && styles.reqTabSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.reqTabText,
                      isSelected && styles.reqTabTextSelected,
                    ]}
                    numberOfLines={2}
                  >
                    {i + 1}. {req.label}
                    {req.required && <Text style={styles.asterisk}>*</Text>}
                  </Text>
                  <Icon
                    name={isUploaded ? "check-circle" : "circle"}
                    size={18}
                    color={isUploaded ? COLORS.semantic.success : COLORS.neutral[300]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Right panel: Large drag-drop style dropzone & previews */}
          <View style={styles.rightPanel}>
            {activeReq && (() => {
              const uploadData = uploads[activeReq.key];
              const fileName = typeof uploadData === "string" ? uploadData : uploadData?.name;
              const fileUri = typeof uploadData === "string" ? "" : uploadData?.uri;
              const isImage = fileUri && (
                fileUri.toLowerCase().endsWith(".png") ||
                fileUri.toLowerCase().endsWith(".jpg") ||
                fileUri.toLowerCase().endsWith(".jpeg") ||
                fileUri.startsWith("data:image")
              );

              return (
                <View style={styles.dropzoneContainer}>
                  <Text style={styles.activeReqTitle}>
                    {activeReq.label}
                  </Text>

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
                      <TouchableOpacity
                        onPress={() => onRemove(activeReq.key)}
                        style={styles.removeBtn}
                      >
                        <Icon name="trash-2" size={16} color={COLORS.semantic.error} style={{ marginRight: 6 }} />
                        <Text style={styles.removeBtnText}>Remove Upload</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => triggerUpload(activeReq.key)}
                      style={styles.dashedDropzone}
                    >
                      <Icon name="upload-cloud" size={48} color={COLORS.brand[700]} style={{ marginBottom: 12 }} />
                      <Text style={styles.uploadTitleText}>
                        Drag & drop or Click to upload
                      </Text>
                      <Text style={styles.uploadSubtext}>
                        Supports scanned PDFs, JPEGs, or PNGs
                      </Text>
                    </TouchableOpacity>
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
            const uploadData = uploads[req.key];
            const fileName = typeof uploadData === "string" ? uploadData : uploadData?.name;
            const fileUri = typeof uploadData === "string" ? "" : uploadData?.uri;
            const isImage = fileUri && (
              fileUri.toLowerCase().endsWith(".png") ||
              fileUri.toLowerCase().endsWith(".jpg") ||
              fileUri.toLowerCase().endsWith(".jpeg") ||
              fileUri.startsWith("data:image")
            );

            return (
              <View key={req.key} style={styles.mobileCard}>
                <Text style={styles.mobileCardTitle}>
                  {i + 1}. {req.label}
                  {req.required && <Text style={styles.asterisk}>*</Text>}
                </Text>

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
                    <TouchableOpacity onPress={() => onRemove(req.key)} style={styles.mobileTrashBtn}>
                      <Icon name="trash-2" size={16} color={COLORS.semantic.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => triggerUpload(req.key)}
                    style={styles.mobileDashedBtn}
                  >
                    <Icon name="upload-cloud" size={18} color={COLORS.brand[700]} style={{ marginRight: 8 }} />
                    <Text style={styles.mobileDashedBtnText}>
                      Upload scanned document
                    </Text>
                  </TouchableOpacity>
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
    alignItems: "center",
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
    alignItems: "center",
  },
  activeReqTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
    marginBottom: 20,
    textAlign: "center",
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
});
