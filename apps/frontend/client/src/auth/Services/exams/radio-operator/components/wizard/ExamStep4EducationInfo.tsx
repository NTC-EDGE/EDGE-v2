import React from "react";
import { View, Text } from "react-native";
import { ValidatedInput } from "../../../../../../shared/components/ValidatedInput";
import { ExamApplicantData } from "../../types/examTypes";
import { styles } from "../ExamFilingWizard.styles";

interface ExamStep4EducationInfoProps {
  activeApplicant: ExamApplicantData;
  updateActiveApplicant: (fields: Partial<ExamApplicantData>) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleFieldChange: (field: keyof ExamApplicantData, value: string) => void;
  sectionOffsets: React.MutableRefObject<Record<string, number>>;
}

export function ExamStep4EducationInfo({
  activeApplicant,
  updateActiveApplicant,
  errors,
  touched,
  handleFieldChange,
  sectionOffsets,
}: ExamStep4EducationInfoProps) {
  return (
    <View
      onLayout={(e) => { sectionOffsets.current["EDUCATION"] = e.nativeEvent.layout.y; }}
      style={styles.formSection}
    >
      <Text style={styles.formSectionHeading}>Education</Text>
      <ValidatedInput
        label="School Name"
        placeholder="School / University Name"
        value={activeApplicant.schoolName}
        onChangeText={(val: string) => handleFieldChange("schoolName", val)}
        error={errors.schoolName}
        touched={touched.schoolName}
        required
      />
      <ValidatedInput
        label="Course / Degree"
        placeholder="Course / Degree"
        value={activeApplicant.courseDegree}
        onChangeText={(val: string) => handleFieldChange("courseDegree", val)}
        error={errors.courseDegree}
        touched={touched.courseDegree}
        required
      />
      <ValidatedInput
        label="Year Graduated"
        placeholder="YYYY"
        value={activeApplicant.yearGraduated}
        onChangeText={(val: string) => handleFieldChange("yearGraduated", val)}
        error={errors.yearGraduated}
        touched={touched.yearGraduated}
        required
      />
      <ValidatedInput
        label="Special Order (SO) Number"
        placeholder="SO Number (if applicable)"
        value={activeApplicant.specialOrderNo}
        onChangeText={(val: string) => updateActiveApplicant({ specialOrderNo: val })}
      />
    </View>
  );
}
