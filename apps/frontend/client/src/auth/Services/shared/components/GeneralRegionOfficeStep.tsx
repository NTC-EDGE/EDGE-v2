import React from "react";
import { View, Text } from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";
import { Select } from "../../../../shared/components/Select";
import { TenantInfo, OfficeInfo } from "../hooks/useGeneralServiceWizard";

interface GeneralRegionOfficeStepProps {
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedOfficeId: string;
  setSelectedOfficeId: (id: string) => void;
  tenants: TenantInfo[];
  offices: OfficeInfo[];
}

export function GeneralRegionOfficeStep({
  selectedRegionId,
  setSelectedRegionId,
  selectedOfficeId,
  setSelectedOfficeId,
  tenants,
  offices,
}: GeneralRegionOfficeStepProps) {
  return (
    <View>
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: COLORS.neutral[700], marginBottom: 8 }}>Select Field Office</Text>
      <View style={{ marginBottom: 12 }}>
        <Select
          placeholder="Region"
          value={selectedRegionId}
          onValueChange={setSelectedRegionId}
          options={tenants.map((t) => ({ label: t.name, value: t.id }))}
        />
      </View>
      <Select
        placeholder="Office"
        value={selectedOfficeId}
        onValueChange={setSelectedOfficeId}
        options={offices.map((o) => ({ label: o.name, value: o.id }))}
      />
    </View>
  );
}
