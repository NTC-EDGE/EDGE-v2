import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";

interface ExamDeleteApplicantModalProps {
  visible: boolean;
  name?: string;
  count?: number;
  isAll?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ExamDeleteApplicantModal({
  visible,
  name,
  count = 1,
  isAll = false,
  onCancel,
  onConfirm,
}: ExamDeleteApplicantModalProps) {
  const isMulti = count > 1 || isAll;
  const title = isAll
    ? "Remove All Applicants?"
    : count > 1
    ? `Remove ${count} Selected Applicants?`
    : "Remove Applicant";

  const message = isAll
    ? `Are you sure you want to remove all ${count > 0 ? count : ""} applicants from the bulk list? This will reset the list.`
    : count > 1
    ? `Are you sure you want to remove the ${count} selected applicants from the bulk list? This action cannot be undone.`
    : `Are you sure you want to remove "${name || "this applicant"}" from the bulk list? This action cannot be undone.`;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 }}>
        <View style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 24, width: "100%", maxWidth: 400 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" }}>
              <Icon name="trash-2" size={18} color={COLORS.semantic.error} />
            </View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: "700", color: COLORS.neutral[900], flex: 1 }}>
              {title}
            </Text>
          </View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13.5, color: COLORS.neutral[600], marginBottom: 24, lineHeight: 20 }}>
            {message}
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
                {isMulti ? "Remove All" : "Remove"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
