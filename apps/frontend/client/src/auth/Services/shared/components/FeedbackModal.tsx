import React from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";

interface FeedbackModalProps {
  visible: boolean;
  rating: number;
  setRating: (rating: number) => void;
  comment: string;
  setComment: (comment: string) => void;
  onSubmit: () => void;
}

export function FeedbackModal({
  visible,
  rating,
  setRating,
  comment,
  setComment,
  onSubmit,
}: FeedbackModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
        <View style={{ backgroundColor: COLORS.neutral.white, width: "90%", maxWidth: 440, borderRadius: 16, padding: 24, alignItems: "center" }}>
          <Icon name="check-circle" size={56} color={COLORS.semantic.success} style={{ marginBottom: 16 }} />
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 20, fontWeight: "700", color: COLORS.neutral[800], marginBottom: 8, textAlign: "center" }}>
            Application Filed!
          </Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[500], textAlign: "center", marginBottom: 24, lineHeight: 18 }}>
            Your general certificate application was registered. Please share your filing experience below:
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Icon name="star" size={32} color={star <= rating ? "#EAB308" : COLORS.neutral[200]} />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={{ width: "100%", borderWidth: 1, borderColor: COLORS.neutral[300], borderRadius: 8, padding: 12, minHeight: 64, marginBottom: 24, textAlignVertical: "top", fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13 }}
            placeholder="Any comments or feature suggestions?"
            multiline
            value={comment}
            onChangeText={setComment}
          />
          <View style={{ width: "100%", gap: 8 }}>
            <TouchableOpacity
              onPress={onSubmit}
              style={{
                backgroundColor: COLORS.brand[900],
                borderRadius: 12,
                paddingVertical: 12,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: COLORS.neutral.white }}>
                Submit Feedback
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSubmit}
              style={{
                paddingVertical: 8,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[500] }}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
