import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";

interface UploadChoiceDialogProps {
  visible: boolean;
  onClose: () => void;
  onDocumentPick: () => void;
  onCameraLaunch: () => void;
}

export function UploadChoiceDialog({
  visible,
  onClose,
  onDocumentPick,
  onCameraLaunch,
}: UploadChoiceDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.4)", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <View style={{
          backgroundColor: COLORS.neutral.white,
          borderRadius: 20,
          width: "100%",
          maxWidth: 380,
          padding: 24,
          borderWidth: 1,
          borderColor: "rgba(226, 232, 240, 0.8)",
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        }}>
          {/* Top Icon Banner */}
          <View style={{ alignSelf: "center", width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.brand[500] + "22", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
            <Icon name="upload-cloud" size={28} color={COLORS.brand[700]} />
          </View>

          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: COLORS.neutral[900], textAlign: "center", marginBottom: 6 }}>
            Attach Document or Photo
          </Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[500], textAlign: "center", marginBottom: 24, paddingHorizontal: 12 }}>
            Choose a method to attach your required file:
          </Text>

          {/* Option 1: File Browser / Upload */}
          <TouchableOpacity
            onPress={onDocumentPick}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.neutral[50],
              borderWidth: 1,
              borderColor: COLORS.neutral[200],
              borderRadius: 12,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.brand[700], justifyContent: "center", alignItems: "center", marginRight: 12 }}>
              <Icon name="file-text" size={18} color={COLORS.neutral.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: COLORS.neutral[800] }}>
                Upload a Photo or File
              </Text>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: COLORS.neutral[400] }}>
                Select PDF, JPEG or PNG file from device
              </Text>
            </View>
          </TouchableOpacity>

          {/* Option 2: Live Camera Snapshot */}
          <TouchableOpacity
            onPress={onCameraLaunch}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.neutral[50],
              borderWidth: 1,
              borderColor: COLORS.neutral[200],
              borderRadius: 12,
              padding: 14,
              marginBottom: 20,
            }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "#0284c7", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
              <Icon name="camera" size={18} color={COLORS.neutral.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: COLORS.neutral[800] }}>
                Take a Photo with Camera
              </Text>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: COLORS.neutral[400] }}>
                Open live camera to capture document or ID
              </Text>
            </View>
          </TouchableOpacity>

          {/* Cancel Action */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              paddingVertical: 10,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: COLORS.semantic.error, textDecorationLine: "underline" }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
