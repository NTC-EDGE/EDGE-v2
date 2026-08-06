import React from "react";
import { View, Text } from "react-native";
import { Select } from "../../../../../../shared/components/Select";
import { ValidatedInput } from "../../../../../../shared/components/ValidatedInput";
import { PHILIPPINE_REGIONS_WITH_OFFICES } from "../../../../accreditation/customer-premises/data/mockRegionData";
import { ExamApplicantData } from "../../types/examTypes";
import { styles } from "../ExamFilingWizard.styles";

interface ExamStep4AddressInfoProps {
  activeApplicant: ExamApplicantData;
  updateActiveApplicant: (fields: Partial<ExamApplicantData>) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleFieldChange: (field: keyof ExamApplicantData, value: string) => void;
  sectionOffsets: React.MutableRefObject<Record<string, number>>;
}

export function ExamStep4AddressInfo({
  activeApplicant,
  updateActiveApplicant,
  errors,
  touched,
  handleFieldChange,
  sectionOffsets,
}: ExamStep4AddressInfoProps) {
  return (
    <View
      onLayout={(e) => { sectionOffsets.current["ADDRESS"] = e.nativeEvent.layout.y; }}
      style={styles.formSection}
    >
      <Text style={styles.formSectionHeading}>Address</Text>
      <Text style={styles.selectLabel}>Region*</Text>
      <Select
        value={activeApplicant.regionName}
        onValueChange={(val: string) => updateActiveApplicant({ regionName: val })}
        options={PHILIPPINE_REGIONS_WITH_OFFICES.map((r: { name: string }) => ({ label: r.name, value: r.name }))}
      />
      <ValidatedInput
        label="Province"
        placeholder="Province"
        value={activeApplicant.province}
        onChangeText={(val: string) => handleFieldChange("province", val)}
        error={errors.province}
        touched={touched.province}
        required
      />
      <ValidatedInput
        label="City"
        placeholder="City"
        value={activeApplicant.city}
        onChangeText={(val: string) => handleFieldChange("city", val)}
        error={errors.city}
        touched={touched.city}
        required
      />
      <ValidatedInput
        label="Barangay"
        placeholder="Barangay"
        value={activeApplicant.barangay}
        onChangeText={(val: string) => handleFieldChange("barangay", val)}
        error={errors.barangay}
        touched={touched.barangay}
        required
      />
      <ValidatedInput
        label="Street"
        placeholder="Street Address"
        value={activeApplicant.street}
        onChangeText={(val: string) => handleFieldChange("street", val)}
        error={errors.street}
        touched={touched.street}
        required
      />
      <ValidatedInput
        label="Zip Code"
        placeholder="Zip Code"
        value={activeApplicant.zipCode}
        onChangeText={(val: string) => handleFieldChange("zipCode", val)}
        error={errors.zipCode}
        touched={touched.zipCode}
        required
      />
    </View>
  );
}
