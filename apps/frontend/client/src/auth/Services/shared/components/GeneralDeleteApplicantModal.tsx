import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";

interface GeneralDeleteApplicantModalProps {
  visible: boolean;
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function GeneralDeleteApplicantModal({
  visible,
  name,
  onCancel,
  onConfirm,
}: GeneralDeleteApplicantModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
        <View style={{ backgroundColor: COLORS.neutral.white, width: 320, padding: 24, borderRadius: 16 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: COLORS.neutral[900], marginBottom: 12 }}>
            Delete Draft Applicant?
          </Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginBottom: 24 }}>
            Are you sure you want to remove "{name}" from this cohort?
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onCancel}
              style={{ flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.neutral[300], borderRadius: 24, alignItems: "center" }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: COLORS.neutral[600] }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={{ flex: 1, paddingVertical: 10, backgroundColor: COLORS.semantic.error, borderRadius: 24, alignItems: "center" }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: COLORS.neutral.white }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
