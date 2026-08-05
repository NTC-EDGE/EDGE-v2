import React from "react";
import { View, Text } from "react-native";
import { Select } from "../../../../../../shared/components/Select";
import { ValidatedInput } from "../../../../../../shared/components/ValidatedInput";
import { ExamApplicantData } from "../../types/examTypes";
import { styles } from "../ExamFilingWizard.styles";

interface ExamStep4BasicInfoProps {
  activeApplicant: ExamApplicantData;
  updateActiveApplicant: (fields: Partial<ExamApplicantData>) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleFieldChange: (field: keyof ExamApplicantData, value: string) => void;
  sectionOffsets: React.MutableRefObject<Record<string, number>>;
}

export function ExamStep4BasicInfo({
  activeApplicant,
  updateActiveApplicant,
  errors,
  touched,
  handleFieldChange,
  sectionOffsets,
}: ExamStep4BasicInfoProps) {
  return (
    <View
      onLayout={(e) => { sectionOffsets.current["BASIC"] = e.nativeEvent.layout.y; }}
      style={styles.formSection}
    >
      <Text style={styles.formSectionHeading}>Basic Info</Text>
      <ValidatedInput
        label="Last Name"
        placeholder="Last Name"
        value={activeApplicant.lastName}
        onChangeText={(val: string) => handleFieldChange("lastName", val)}
        error={errors.lastName}
        touched={touched.lastName}
        required
      />
      <ValidatedInput
        label="First Name"
        placeholder="First Name"
        value={activeApplicant.firstName}
        onChangeText={(val: string) => handleFieldChange("firstName", val)}
        error={errors.firstName}
        touched={touched.firstName}
        required
      />
      <ValidatedInput
        label="Middle Name"
        placeholder="Middle Name"
        value={activeApplicant.middleName}
        onChangeText={(val) => updateActiveApplicant({ middleName: val })}
      />
      <ValidatedInput
        label="Suffix"
        placeholder="Suffix (e.g. Jr., III)"
        value={activeApplicant.suffix}
        onChangeText={(val) => updateActiveApplicant({ suffix: val })}
      />

      <Text style={styles.selectLabel}>Date of Birth</Text>
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
        <View style={{ flex: 2 }}>
          <Select
            value={activeApplicant.birthMonth}
            onValueChange={(val: string) => updateActiveApplicant({ birthMonth: val })}
            options={["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => ({ label: m, value: m }))}
          />
        </View>
        <View style={{ flex: 1.2 }}>
          <Select
            value={activeApplicant.birthDay}
            onValueChange={(val: string) => updateActiveApplicant({ birthDay: val })}
            options={Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: String(i + 1) }))}
          />
        </View>
        <View style={{ flex: 1.5 }}>
          <Select
            value={activeApplicant.birthYear}
            onValueChange={(val: string) => updateActiveApplicant({ birthYear: val })}
            options={Array.from({ length: 80 }, (_, i) => ({ label: String(2026 - i), value: String(2026 - i) }))}
          />
        </View>
      </View>

      <Text style={styles.selectLabel}>Sex*</Text>
      <Select
        value={activeApplicant.sex}
        onValueChange={(val: string) => updateActiveApplicant({ sex: val })}
        options={[{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }]}
      />

      <Text style={styles.selectLabel}>Nationality*</Text>
      <Select
        value={activeApplicant.nationality}
        onValueChange={(val: string) => updateActiveApplicant({ nationality: val })}
        options={[{ label: "Filipino", value: "Filipino" }, { label: "Others", value: "Others" }]}
      />
    </View>
  );
}
