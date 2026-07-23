import React from "react";
import { View, Text, TextInput } from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";
import { ValidatedInput } from "../../../../shared/components/ValidatedInput";
import { Select } from "../../../../shared/components/Select";

interface GeneralFilingDetailsStepProps {
  activeApplicant: GeneralApplicantData;
  updateActiveApplicant: (fields: Partial<GeneralApplicantData>) => void;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
const years = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));

export function GeneralFilingDetailsStep({
  activeApplicant,
  updateActiveApplicant,
}: GeneralFilingDetailsStepProps) {
  return (
    <View>
      <ValidatedInput
        label="First Name"
        value={activeApplicant.firstName}
        onChangeText={(text) => updateActiveApplicant({ firstName: text })}
        required
      />
      <ValidatedInput
        label="Last Name"
        value={activeApplicant.lastName}
        onChangeText={(text) => updateActiveApplicant({ lastName: text })}
        required
      />
      <ValidatedInput
        label="Email Address"
        value={activeApplicant.email}
        onChangeText={(text) => updateActiveApplicant({ email: text })}
        keyboardType="email-address"
        required
      />
      <ValidatedInput
        label="Contact Number"
        value={activeApplicant.contactNo}
        onChangeText={(text) => updateActiveApplicant({ contactNo: text })}
        keyboardType="phone-pad"
        required
      />
      <ValidatedInput
        label="Physical Address"
        value={activeApplicant.address}
        onChangeText={(text) => updateActiveApplicant({ address: text })}
      />

      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: COLORS.neutral[700], marginTop: 16, marginBottom: 8 }}>Birth Date</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 2 }}>
          <Select
            placeholder="Month"
            value={activeApplicant.birthMonth}
            onValueChange={(val) => updateActiveApplicant({ birthMonth: val })}
            options={months.map((m) => ({ label: m, value: m }))}
          />
        </View>
        <View style={{ flex: 1.2 }}>
          <Select
            placeholder="Day"
            value={activeApplicant.birthDay}
            onValueChange={(val) => updateActiveApplicant({ birthDay: val })}
            options={days.map((d) => ({ label: d, value: d }))}
          />
        </View>
        <View style={{ flex: 1.5 }}>
          <Select
            placeholder="Year"
            value={activeApplicant.birthYear}
            onValueChange={(val) => updateActiveApplicant({ birthYear: val })}
            options={years.map((y) => ({ label: y, value: y }))}
          />
        </View>
      </View>

      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: COLORS.neutral[700], marginTop: 20, marginBottom: 8 }}>Filing Notes / Special Concerns</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: COLORS.neutral[300],
          borderRadius: 8,
          padding: 12,
          fontFamily: TYPOGRAPHY.fonts.primary,
          fontSize: 14,
          backgroundColor: COLORS.neutral.white,
          minHeight: 80,
          textAlignVertical: "top",
        }}
        placeholder="Provide specifications or support queries here..."
        multiline
        value={activeApplicant.notes}
        onChangeText={(text) => updateActiveApplicant({ notes: text })}
      />
    </View>
  );
}
