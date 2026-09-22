import React from "react";
import { View, Text } from "react-native";
import { FormGrid } from "../../FormGrid";
import { FieldDto, FormSectionDto } from "../dynamicFormTypes";
import { dynamicFormStyles as styles } from "../DynamicFormRenderer.styles";

interface VanitySpecialApplicantSectionProps {
  section: FormSectionDto;
  sectionDisplayNum: number;
  renderFieldInstance: (field: FieldDto, fIdx: number, section: FormSectionDto, instanceSuffix?: string) => React.ReactNode;
}

export const VanitySpecialApplicantSection: React.FC<VanitySpecialApplicantSectionProps> = ({
  section,
  sectionDisplayNum,
  renderFieldInstance,
}) => {
  const vanityApplicantFields: FieldDto[] = [
    { fieldId: "fullName", id: "fullName", label: "Full Name", fieldType: "text", isRequired: true },
    { fieldId: "dateOfBirth", id: "dateOfBirth", label: "Date of Birth", fieldType: "date", isRequired: true },
    { fieldId: "sex", id: "sex", label: "Sex", fieldType: "dropdown", isRequired: true, options: ["Male", "Female", "Other"] },
    { fieldId: "nationality", id: "nationality", label: "Nationality", fieldType: "text", isRequired: true, placeholder: "e.g. Filipino" },
    { fieldId: "region", id: "region", label: "Region", fieldType: "dropdown", isRequired: true },
    { fieldId: "province", id: "province", label: "Province", fieldType: "dropdown", isRequired: true },
    { fieldId: "city", id: "city", label: "City / Municipality", fieldType: "dropdown", isRequired: true },
    { fieldId: "barangay", id: "barangay", label: "Barangay", fieldType: "dropdown", isRequired: true },
    { fieldId: "street", id: "street", label: "Street / Building Address", fieldType: "text", isRequired: true },
    { fieldId: "zipCode", id: "zipCode", label: "Zip Code", fieldType: "text", isRequired: true },
    { fieldId: "contactNo", id: "contactNo", label: "Contact Number", fieldType: "tel", isRequired: true },
    { fieldId: "email", id: "email", label: "Email Address", fieldType: "email", isRequired: true },
  ];

  const renderedVanityApplicant = vanityApplicantFields
    .map((f, idx) => renderFieldInstance(f, idx, section))
    .filter(Boolean);

  return (
    <View key={section.id || section.key || `section-${sectionDisplayNum}`} style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconCircleText}>{sectionDisplayNum}</Text>
          </View>
          <Text style={styles.sectionTitle}>Applicant Details</Text>
        </View>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>SECTION {sectionDisplayNum}</Text>
        </View>
      </View>
      <FormGrid>{renderedVanityApplicant}</FormGrid>
    </View>
  );
};
