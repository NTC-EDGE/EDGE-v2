import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";

interface DeclarationModalProps {
  visible: boolean;
  onClose: () => void;
  isAgreed: boolean;
  onToggleAgree: () => void;
  onConfirm: () => void;
}

export function DeclarationModal({
  visible,
  onClose,
  isAgreed,
  onToggleAgree,
  onConfirm,
}: DeclarationModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
        <View style={{ backgroundColor: COLORS.neutral.white, width: "90%", maxWidth: 540, borderRadius: 16, padding: 24 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: "700", color: COLORS.neutral[800], marginBottom: 16 }}>
            Declaration of Intent & Consent
          </Text>
          <View style={{ borderWidth: 1, borderColor: COLORS.neutral[200], borderRadius: 12, padding: 16, backgroundColor: COLORS.neutral[50], marginBottom: 20 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], lineHeight: 20, textAlign: "justify" }}>
              I hereby declare that all the entries are true and correct to the best of my knowledge and belief. I understand that any false declaration will lead to immediate rejection of my application.
            </Text>
          </View>
          <TouchableOpacity onPress={onToggleAgree} style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
            <Icon name={isAgreed ? "check-circle" : "circle"} size={22} color={isAgreed ? COLORS.brand[700] : COLORS.neutral[300]} style={{ marginRight: 10 }} />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800] }}>
              I agree to the Terms and Conditions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            style={{ backgroundColor: isAgreed ? COLORS.brand[700] : COLORS.neutral[300], borderRadius: 24, paddingVertical: 12, alignItems: "center" }}
            disabled={!isAgreed}
          >
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: COLORS.neutral.white }}>
              Confirm Submission
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
