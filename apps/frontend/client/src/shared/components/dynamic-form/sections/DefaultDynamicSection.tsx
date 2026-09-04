import React from "react";
import { View, Text } from "react-native";
import { FormGrid } from "../../FormGrid";
import { FieldDto, FormSectionDto, FormVariantFlags } from "../dynamicFormTypes";
import { dynamicFormStyles as styles } from "../DynamicFormRenderer.styles";
import { getSectionTitle } from "../dynamicFormUtils";

interface DefaultDynamicSectionProps {
  section: FormSectionDto;
  sectionDisplayNum: number;
  sectionFields: FieldDto[];
  flags: FormVariantFlags;
  renderFieldInstance: (field: FieldDto, fIdx: number, section: FormSectionDto, instanceSuffix?: string) => React.ReactNode;
}

export const DefaultDynamicSection: React.FC<DefaultDynamicSectionProps> = ({
  section,
  sectionDisplayNum,
  sectionFields,
  flags,
  renderFieldInstance,
}) => {
  const renderedFields = sectionFields
    .map((field, fIdx) => renderFieldInstance(field, fIdx, section))
    .filter(Boolean);

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
      <FormGrid>{renderedFields}</FormGrid>
    </View>
  );
};
