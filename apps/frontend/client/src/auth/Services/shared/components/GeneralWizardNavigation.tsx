import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";

interface GeneralWizardNavigationProps {
  step: number;
  onBack: () => void;
  onNext: () => void;
}

export function GeneralWizardNavigation({
  step,
  onBack,
  onNext,
}: GeneralWizardNavigationProps) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 32, gap: 12 }}>
      {step > 1 && (
        <TouchableOpacity onPress={onBack} style={{ flex: 1, borderWidth: 1.5, borderColor: COLORS.brand[700], borderRadius: 24, paddingVertical: 12, alignItems: "center" }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: COLORS.brand[700] }}>
            Back
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onNext} style={{ flex: 1, backgroundColor: COLORS.brand[700], borderRadius: 24, paddingVertical: 12, alignItems: "center" }}>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: COLORS.neutral.white }}>
          {step === 6 ? "Submit" : "Next"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
