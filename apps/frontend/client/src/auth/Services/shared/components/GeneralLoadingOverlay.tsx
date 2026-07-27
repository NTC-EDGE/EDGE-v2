import React from "react";
import { View, Text } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";

interface GeneralLoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function GeneralLoadingOverlay({
  visible,
  message = "Submitting general application...",
}: GeneralLoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.85)", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
      <Icon name="loader" size={48} color={COLORS.brand[700]} />
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, fontWeight: "700", color: COLORS.neutral[800], marginTop: 12 }}>
        {message}
      </Text>
    </View>
  );
}
