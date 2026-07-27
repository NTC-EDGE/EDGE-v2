import React from "react";
import { View, Text } from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";
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
  return (
    <View>
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: COLORS.neutral[600], marginBottom: 20 }}>
        Verify your application parameters. Once submitted, NTC agents will evaluate your uploads.
      </Text>
      <View style={{ backgroundColor: COLORS.neutral.white, borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: COLORS.brand[900] }}>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginBottom: 6 }}>
          Service Name: {service.title}
        </Text>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginBottom: 6 }}>
          Region: {tenants.find(t => t.id === selectedRegionId)?.name || selectedRegionId}
        </Text>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600] }}>
          Office: {offices.find(o => o.id === selectedOfficeId)?.name || selectedOfficeId}
        </Text>
      </View>
    </View>
  );
}
