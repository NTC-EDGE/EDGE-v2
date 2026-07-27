import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";

interface ExamDeleteApplicantModalProps {
  visible: boolean;
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ExamDeleteApplicantModal({
  visible,
  name,
  onCancel,
  onConfirm,
}: ExamDeleteApplicantModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 }}>
        <View style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 24, width: "100%", maxWidth: 400 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: "700", color: COLORS.neutral[900], marginBottom: 8 }}>
            Remove Applicant
          </Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13.5, color: COLORS.neutral[600], marginBottom: 24, lineHeight: 20 }}>
            Are you sure you want to remove <Text style={{ fontWeight: "700" }}>{name}</Text> from the bulk list? This action cannot be undone.
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
            <TouchableOpacity
              onPress={onCancel}
              style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: COLORS.neutral[300] }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: COLORS.neutral[700] }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: COLORS.semantic.error }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: "#ffffff" }}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
