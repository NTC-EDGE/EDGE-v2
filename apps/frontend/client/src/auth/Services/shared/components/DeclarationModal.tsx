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
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: "700", color: COLORS.neutral[800] }}>
              Declaration of Intent & Consent
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="x" size={20} color={COLORS.neutral[500]} />
            </TouchableOpacity>
          </View>
          <View style={{ borderWidth: 1, borderColor: COLORS.neutral[200], borderRadius: 12, padding: 16, backgroundColor: COLORS.neutral[50], marginBottom: 20 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], lineHeight: 20, textAlign: "justify" }}>
              I hereby declare that all the above entries are true and correct. Under the Revised Penal Code, I shall be held liable for any willful false statement(s) or misrepresentation(s) made in this application form that may serve as a valid ground for the denial of this application and/or cancellation/revocation of thepermit issued/granted. Further, I am freely giving full consent for the collection and processing of personal information in accordance with Republic Act No. 10713, Data Privacy Act of 2012.
            </Text>
          </View>
          <TouchableOpacity onPress={onToggleAgree} style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
            <Icon name={isAgreed ? "check-circle" : "circle"} size={22} color={isAgreed ? COLORS.brand[700] : COLORS.neutral[300]} style={{ marginRight: 10 }} />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800] }}>
              I agree to the Terms and Conditions
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                borderWidth: 1,
                borderColor: COLORS.neutral[300],
                borderRadius: 24,
                paddingVertical: 12,
                paddingHorizontal: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[700] }}>
                Close
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={{
                backgroundColor: isAgreed ? COLORS.brand[700] : COLORS.neutral[300],
                borderRadius: 24,
                paddingVertical: 12,
                paddingHorizontal: 24,
                alignItems: "center",
                justifyContent: "center",
              }}
              disabled={!isAgreed}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: COLORS.neutral.white }}>
                Confirm Submission
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
