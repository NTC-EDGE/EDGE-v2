import React from "react";
import { View, Text } from "react-native";
import { FormGrid } from "../../FormGrid";
import { FieldDto, FormSectionDto, FormVariantFlags } from "../dynamicFormTypes";
import { dynamicFormStyles as styles } from "../DynamicFormRenderer.styles";
import { FIELD_ID_CALL_SIGN, FIELD_ID_FREQUENCY } from "../../../constants/fieldIds";
import { getSectionTitle } from "../dynamicFormUtils";

interface AmateurPurchaseSectionProps {
  section: FormSectionDto;
  sectionDisplayNum: number;
  flags: FormVariantFlags;
  renderFieldInstance: (field: FieldDto, fIdx: number, section: FormSectionDto, instanceSuffix?: string) => React.ReactNode;
}

export const AmateurPurchaseSection: React.FC<AmateurPurchaseSectionProps> = ({
  section,
  sectionDisplayNum,
  flags,
  renderFieldInstance,
}) => {
  const purchaseCallSignField: FieldDto = {
    fieldId: FIELD_ID_CALL_SIGN,
    id: "callSign",
    label: "Call Sign",
    fieldType: "text",
    isRequired: false,
    placeholder: "Enter Call Sign...",
  };

  const purchaseFrequenciesField: FieldDto = {
    fieldId: FIELD_ID_FREQUENCY,
    id: "frequency",
    label: "Frequency(ies)",
    fieldType: "text",
    isRequired: true,
    placeholder: "e.g. 144.0-146.0 MHz, 430.0-440.0 MHz",
  };

  const purchaseParticularsField: FieldDto = {
    fieldId: "particulars",
    id: "particulars",
    label: "Particulars",
    fieldType: "repeater",
    isRequired: true,
  };

  const renderedCallSign = renderFieldInstance(purchaseCallSignField, 0, section);
  const renderedFrequencies = renderFieldInstance(purchaseFrequenciesField, 1, section);
  const renderedParticulars = renderFieldInstance(purchaseParticularsField, 2, section);

  const title = getSectionTitle(section, flags);

  return (
    <View key={section.id || section.key || `section-${sectionDisplayNum}`} style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconCircleText}>{sectionDisplayNum}</Text>
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>SECTION {sectionDisplayNum}</Text>
        </View>
      </View>

      <FormGrid>
        {renderedCallSign}
        {renderedFrequencies}
        {renderedParticulars}
      </FormGrid>
    </View>
  );
};
