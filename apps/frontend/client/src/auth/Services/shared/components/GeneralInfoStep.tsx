import React from "react";
import { View, Text } from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";
import { NTCService } from "../../data/servicesData";

interface GeneralInfoStepProps {
  service: NTCService;
}

export function GeneralInfoStep({ service }: GeneralInfoStepProps) {
  return (
    <View style={{ gap: 20 }}>
      {/* Service Information Card */}
      <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 20, borderWidth: 1, borderColor: "#E2E8F0" }}>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: "#0F2C59", marginBottom: 8 }}>
          Service Information
        </Text>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: "#475569", lineHeight: 22, marginBottom: 16 }}>
          {service.description}
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          <View style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flex: 1, minWidth: 140 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#1E40AF", marginBottom: 2 }}>
              PROCESSING FEE
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: "#0F2C59" }}>
              {service.fee || "Standard Rates Apply"}
            </Text>
          </View>

          <View style={{ backgroundColor: "#FEF3C7", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flex: 1, minWidth: 140 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#92400E", marginBottom: 2 }}>
              PROCESSING TIME
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: "#78350F" }}>
              {service.time || "3-5 Business Days"}
            </Text>
          </View>
        </View>
      </View>

      {/* Guidelines Notice */}
      <View style={{ backgroundColor: "#FAFAFC", borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: "#0F2C59", borderWidth: 1, borderColor: "#E2E8F0" }}>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#0F2C59", marginBottom: 6 }}>
          Filing Instructions & Next Steps
        </Text>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: "#475569", lineHeight: 20 }}>
          1. Proceed to Step 2 to select your intended NTC Regional Office and Field Office.{"\n"}
          2. In Step 3, choose your specific Application Variant / Transaction Type (NEW, RENEWAL, MODIFICATION, or LIFETIME) and Filing Mode.
        </Text>
      </View>
    </View>
  );
}
