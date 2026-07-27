import React from "react";
import { View, Text } from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";
import { NTCService } from "../../data/servicesData";

interface GeneralInfoStepProps {
  service: NTCService;
}

export function GeneralInfoStep({ service }: GeneralInfoStepProps) {
  return (
    <View>
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: COLORS.neutral[600], lineHeight: 22, marginBottom: 20 }}>
        {service.description}
      </Text>
      <View style={{ backgroundColor: COLORS.neutral.white, borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: COLORS.brand[600] }}>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: COLORS.neutral[800], marginBottom: 6 }}>
          Processing Fee Detail
        </Text>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600] }}>
          Standard Cost: {service.fee}
        </Text>
      </View>
    </View>
  );
}
