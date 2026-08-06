import React from "react";
import { View, Text } from "react-native";
import { ValidatedInput } from "../../../../../../shared/components/ValidatedInput";
import { ExamApplicantData } from "../../types/examTypes";
import { styles } from "../ExamFilingWizard.styles";

interface ExamStep4ContactInfoProps {
  activeApplicant: ExamApplicantData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleFieldChange: (field: keyof ExamApplicantData, value: string) => void;
  sectionOffsets: React.MutableRefObject<Record<string, number>>;
}

export function ExamStep4ContactInfo({
  activeApplicant,
  errors,
  touched,
  handleFieldChange,
  sectionOffsets,
}: ExamStep4ContactInfoProps) {
  return (
    <View
      onLayout={(e) => { sectionOffsets.current["CONTACT"] = e.nativeEvent.layout.y; }}
      style={styles.formSection}
    >
      <Text style={styles.formSectionHeading}>Contact Details</Text>
      <ValidatedInput
        label="Email Address"
        placeholder="email@example.com"
        value={activeApplicant.email}
        onChangeText={(val: string) => handleFieldChange("email", val)}
        error={errors.email}
        touched={touched.email}
        required
      />
      <ValidatedInput
        label="Contact Number"
        placeholder="09XXXXXXXXX"
        value={activeApplicant.contactNo}
        onChangeText={(val: string) => handleFieldChange("contactNo", val)}
        error={errors.contactNo}
        touched={touched.contactNo}
        required
      />
    </View>
  );
}
