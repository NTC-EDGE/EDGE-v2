import React from "react";
import { View, Text } from "react-native";
import { FormGrid } from "../../FormGrid";
import { FieldDto, FormSectionDto } from "../dynamicFormTypes";
import { dynamicFormStyles as styles } from "../DynamicFormRenderer.styles";

interface VanityEquipmentSectionProps {
  section: FormSectionDto;
  sectionDisplayNum: number;
  renderFieldInstance: (field: FieldDto, fIdx: number, section: FormSectionDto, instanceSuffix?: string) => React.ReactNode;
}

export const VanityEquipmentSection: React.FC<VanityEquipmentSectionProps> = ({
  section,
  sectionDisplayNum,
  renderFieldInstance,
}) => {
  const vanityEquipmentField: FieldDto = {
    fieldId: "equipmentDetails",
    id: "equipmentDetails",
    label: "Particulars of Proposed Equipment",
    fieldType: "repeater",
    isRequired: true,
  };

  const renderedVanityEq = renderFieldInstance(vanityEquipmentField, 0, section);

  return (
    <View key={section.id || section.key || `section-${sectionDisplayNum}`} style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconCircleText}>{sectionDisplayNum}</Text>
          </View>
          <Text style={styles.sectionTitle}>Particulars</Text>
        </View>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>SECTION {sectionDisplayNum}</Text>
        </View>
      </View>
      <FormGrid>{renderedVanityEq}</FormGrid>
    </View>
  );
};
