import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";

interface GeneralDeleteApplicantModalProps {
  visible: boolean;
  name?: string;
  count?: number;
  isAll?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function GeneralDeleteApplicantModal({
  visible,
  name,
  count = 1,
  isAll = false,
  onCancel,
  onConfirm,
}: GeneralDeleteApplicantModalProps) {
  const isMulti = count > 1 || isAll;
  const title = isAll
    ? "Delete All Applicants?"
    : count > 1
    ? `Delete ${count} Selected Applicants?`
    : "Delete Draft Applicant?";

  const message = isAll
    ? `Are you sure you want to remove all ${count > 0 ? count : ""} applicants from this cohort? This will clear the applicant list.`
    : count > 1
    ? `Are you sure you want to remove the ${count} selected applicants from this cohort? This action cannot be undone.`
    : `Are you sure you want to remove "${name || "this applicant"}" from this cohort?`;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 20 }}>
        <View style={{ backgroundColor: COLORS.neutral.white, width: "100%", maxWidth: 380, padding: 24, borderRadius: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" }}>
              <Icon name="trash-2" size={18} color={COLORS.semantic.error} />
            </View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: COLORS.neutral[900], flex: 1 }}>
              {title}
            </Text>
          </View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginBottom: 24, lineHeight: 19 }}>
            {message}
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
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: COLORS.neutral.white }}>
                {isMulti ? "Delete All" : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
