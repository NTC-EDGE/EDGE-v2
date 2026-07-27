import React from "react";
import { View, Text } from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";
import { Select } from "../../../../shared/components/Select";

interface GeneralFilingModeStepProps {
  appMode: "SINGLE" | "BULK" | "";
  onAppModeChange: (mode: "SINGLE" | "BULK") => void;
}

export function GeneralFilingModeStep({
  appMode,
  onAppModeChange,
}: GeneralFilingModeStepProps) {
  return (
    <View>
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: COLORS.neutral[700], marginBottom: 8 }}>Filing Mode</Text>
      <Select
        placeholder="Filing Mode"
        value={appMode}
        onValueChange={(val) => {
          if (val === "SINGLE" || val === "BULK") {
            onAppModeChange(val);
          }
        }}
        options={[
          { label: "Single Application", value: "SINGLE" },
          { label: "Bulk Application", value: "BULK" },
        ]}
      />
    </View>
  );
}
