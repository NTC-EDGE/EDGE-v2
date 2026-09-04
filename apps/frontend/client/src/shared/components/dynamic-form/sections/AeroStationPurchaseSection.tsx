import React from "react";
import { View, Text } from "react-native";
import { FormGrid } from "../../FormGrid";
import { FieldDto, FormSectionDto } from "../dynamicFormTypes";
import { dynamicFormStyles as styles } from "../DynamicFormRenderer.styles";
import { FIELD_ID_POWER_OUTPUT } from "../../../constants/fieldIds";

interface AeroStationPurchaseSectionProps {
  section: FormSectionDto;
  sectionDisplayNum: number;
  renderFieldInstance: (field: FieldDto, fIdx: number, section: FormSectionDto, instanceSuffix?: string) => React.ReactNode;
}

export const AeroStationPurchaseSection: React.FC<AeroStationPurchaseSectionProps> = ({
  section,
  sectionDisplayNum,
  renderFieldInstance,
}) => {
  const aeroPowerOutputField: FieldDto = {
    fieldId: FIELD_ID_POWER_OUTPUT,
    id: "powerOutput",
    label: "Power Output (watts)",
    fieldType: "text",
    isRequired: true,
    placeholder: "e.g. 50",
  };

  const aeroParticularsField: FieldDto = {
    fieldId: "aeroStationParticulars",
    id: "aeroStationParticulars",
    label: "Class of Station",
    fieldType: "repeater",
    isRequired: true,
  };

  const renderedPowerOutput = renderFieldInstance(aeroPowerOutputField, 0, section);
  const renderedAeroParticulars = renderFieldInstance(aeroParticularsField, 1, section);

  return (
    <View key={section.id || section.key || `section-${sectionDisplayNum}`} style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconCircleText}>{sectionDisplayNum}</Text>
          </View>
          <Text style={styles.sectionTitle}>Particulars of Proposed Station / Equipment</Text>
        </View>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>SECTION {sectionDisplayNum}</Text>
        </View>
      </View>

      <FormGrid>
        {renderedPowerOutput}
        {renderedAeroParticulars}
      </FormGrid>
    </View>
  );
};
