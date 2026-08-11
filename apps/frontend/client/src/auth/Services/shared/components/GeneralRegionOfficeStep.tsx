import React from "react";
import { View, Text } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
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
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" }}>
            <Icon name="map-pin" size={15} color="#0F2C59" />
          </View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: "#0F2C59" }}>
            Region & Field Office Selection
          </Text>
        </View>
        <View style={{ backgroundColor: "#EFF6FF", borderColor: "#3B82F6", borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "800", color: "#1E40AF" }}>
            STEP 2 • JURISDICTION
          </Text>
        </View>
      </View>

      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: "#64748B", marginBottom: 16 }}>
        Select your target NTC Regional Jurisdiction and processing Field Office from the menus below:
      </Text>

      {/* Card Section 1: Region Selection */}
      <View
        style={{
          marginBottom: 16,
          backgroundColor: "#F8FAFC",
          padding: 14,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#E2E8F0",
          borderLeftWidth: 3,
          borderLeftColor: "#3B82F6",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#334155" }}>
            Select NTC Region*
          </Text>
          <View style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "700", color: "#1D4ED8" }}>
              REGION JURISDICTION
            </Text>
          </View>
        </View>
        <Select
          placeholder="Select NTC Region..."
          value={selectedRegionId}
          onValueChange={setSelectedRegionId}
          options={tenants.map((t) => ({ label: t.name, value: t.id }))}
          iconName="map-pin"
        />
      </View>

      {/* Card Section 2: Field Office Selection */}
      <View
        style={{
          backgroundColor: "#F8FAFC",
          padding: 14,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#E2E8F0",
          borderLeftWidth: 3,
          borderLeftColor: "#F59E0B",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#334155" }}>
            Select NTC Field Office*
          </Text>
          <View style={{ backgroundColor: "#FEF3C7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "700", color: "#B45309" }}>
              PROCESSING OFFICE
            </Text>
          </View>
        </View>
        <Select
          placeholder={selectedRegionId ? "Select NTC Field Office..." : "Select Region first..."}
          value={selectedOfficeId}
          onValueChange={setSelectedOfficeId}
          options={offices.map((o) => ({ label: o.name, value: o.id }))}
          iconName="home"
        />
      </View>
    </View>
  );
}
