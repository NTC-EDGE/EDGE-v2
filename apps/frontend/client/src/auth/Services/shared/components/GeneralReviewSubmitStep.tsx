import React from "react";
import { View, Text } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { TenantInfo, OfficeInfo } from "../hooks/useGeneralServiceWizard";

interface GeneralReviewSubmitStepProps {
  service: NTCService;
  tenants: TenantInfo[];
  offices: OfficeInfo[];
  selectedRegionId: string | null;
  selectedOfficeId: string | null;
}

export function GeneralReviewSubmitStep({
  service,
  tenants,
  offices,
  selectedRegionId,
  selectedOfficeId,
}: GeneralReviewSubmitStepProps) {
  const regionName = tenants.find((t) => t.id === selectedRegionId)?.name || selectedRegionId || "NTC Central / Regional Jurisdiction";
  const officeName = offices.find((o) => o.id === selectedOfficeId)?.name || selectedOfficeId || "Main Processing Office";

  return (
    <View style={{ gap: 16 }}>
      {/* Header Indicator Card */}
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
              <Icon name="check-circle" size={15} color="#0F2C59" />
            </View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: "#0F2C59" }}>
              Final Application Review & Summary
            </Text>
          </View>
          <View style={{ backgroundColor: "#ECFDF5", borderColor: "#10B981", borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, alignSelf: "flex-start" }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "800", color: "#047857" }}>
              STEP 6 • READY TO SUBMIT
            </Text>
          </View>
        </View>

        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: "#64748B", lineHeight: 20, marginBottom: 16 }}>
          Please verify your selected service parameters below. Upon submission, NTC regional officers will review your documents.
        </Text>

        <View style={{ gap: 12 }}>
          <View style={{ backgroundColor: "#F8FAFC", padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0" }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 2 }}>
              SERVICE NAME
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: "#0F2C59" }}>
              {service.title}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: "#F8FAFC", padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0" }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 2 }}>
                TARGET REGION
              </Text>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: "#1E293B" }}>
                {regionName}
              </Text>
            </View>

            <View style={{ flex: 1, backgroundColor: "#F8FAFC", padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0" }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 2 }}>
                FIELD OFFICE
              </Text>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: "#1E293B" }}>
                {officeName}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
