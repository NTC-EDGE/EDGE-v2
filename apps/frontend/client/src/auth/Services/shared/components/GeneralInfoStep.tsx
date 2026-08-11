import React from "react";
import { View, Text } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { NTCService } from "../../data/servicesData";

interface GeneralInfoStepProps {
  service: NTCService;
}

export function GeneralInfoStep({ service }: GeneralInfoStepProps) {
  return (
    <View style={{ gap: 20 }}>
      {/* Card 1: Service Overview Card */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 14,
          padding: 20,
          borderWidth: 1,
          borderColor: "#CBD5E1",
          borderLeftWidth: 5,
          borderLeftColor: "#0F2C59",
          shadowColor: "#0F2C59",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1, minWidth: 200 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" }}>
              <Icon name="info" size={15} color="#0F2C59" />
            </View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: "#0F2C59" }}>
              Service Overview & Specifications
            </Text>
          </View>
          <View style={{ backgroundColor: "#EFF6FF", borderColor: "#3B82F6", borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, alignSelf: "flex-start" }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "800", color: "#1E40AF" }}>
              SECTION 1 • OVERVIEW
            </Text>
          </View>
        </View>

        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: "#334155", lineHeight: 22, marginBottom: 16 }}>
          {service.description}
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          <View style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE", borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, flex: 1, minWidth: 140 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "800", color: "#1E40AF", marginBottom: 2 }}>
              PROCESSING FEE
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: "#0F2C59" }}>
              {service.fee || "Standard Rates Apply"}
            </Text>
          </View>

          <View style={{ backgroundColor: "#FEF3C7", borderColor: "#FDE68A", borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, flex: 1, minWidth: 140 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "800", color: "#92400E", marginBottom: 2 }}>
              ESTIMATED TURNAROUND
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: "#78350F" }}>
              {service.time || "3-5 Business Days"}
            </Text>
          </View>
        </View>
      </View>

      {/* Card 2: Guidelines Notice Card */}
      <View
        style={{
          backgroundColor: "#FAFAFC",
          borderRadius: 14,
          padding: 20,
          borderWidth: 1,
          borderColor: "#CBD5E1",
          borderLeftWidth: 5,
          borderLeftColor: "#F59E0B",
          shadowColor: "#F59E0B",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1, minWidth: 200 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#FEF3C7", justifyContent: "center", alignItems: "center" }}>
              <Icon name="file-text" size={15} color="#92400E" />
            </View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, fontWeight: "700", color: "#0F2C59" }}>
              Filing Instructions & Next Steps
            </Text>
          </View>
          <View style={{ backgroundColor: "#FEF3C7", borderColor: "#F59E0B", borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, alignSelf: "flex-start" }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "800", color: "#92400E" }}>
              SECTION 2 • GUIDELINES
            </Text>
          </View>
        </View>

        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: "#475569", lineHeight: 22 }}>
          1. Click <Text style={{ fontWeight: "700", color: "#0F2C59" }}>Next</Text> to proceed to Step 2 for NTC Regional & Field Office Jurisdiction selection.{"\n"}
          2. In Step 3, choose your exact <Text style={{ fontWeight: "700", color: "#0F2C59" }}>Application Variant</Text> (NEW, RENEWAL, MODIFICATION, or LIFETIME), station class option, and filing mode.{"\n"}
          3. Complete Step 4 details, upload mandatory requirements in Step 5, and submit for official review.
        </Text>
      </View>
    </View>
  );
}
