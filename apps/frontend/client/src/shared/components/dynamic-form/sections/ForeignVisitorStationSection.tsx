import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { FormGrid } from "../../FormGrid";
import { FieldDto, FormSectionDto } from "../dynamicFormTypes";
import { dynamicFormStyles as styles } from "../DynamicFormRenderer.styles";

interface ForeignVisitorStationSectionProps {
  section: FormSectionDto;
  sectionDisplayNum: number;
  stationParticularsCount: number;
  canonicalPermitStationFields: FieldDto[];
  onAddStationParticular: () => void;
  onRemoveStationParticular: (idx: number) => void;
  renderFieldInstance: (field: FieldDto, fIdx: number, section: FormSectionDto, instanceSuffix?: string) => React.ReactNode;
}

export const ForeignVisitorStationSection: React.FC<ForeignVisitorStationSectionProps> = ({
  section,
  sectionDisplayNum,
  stationParticularsCount,
  canonicalPermitStationFields,
  onAddStationParticular,
  onRemoveStationParticular,
  renderFieldInstance,
}) => {
  const foreignTopLevelFields: FieldDto[] = [
    canonicalPermitStationFields[1], // Points of Comm / Service Area
    canonicalPermitStationFields[2], // Frequency
    canonicalPermitStationFields[3], // Bandwidth
    canonicalPermitStationFields[4], // Unit
    canonicalPermitStationFields[5], // Emission
    canonicalPermitStationFields[6], // Power Output
    canonicalPermitStationFields[7], // Hours of Operation
  ];

  const foreignStationFields: FieldDto[] = [
    canonicalPermitStationFields[8],  // Class of Station
    canonicalPermitStationFields[9],  // Exact Location
    canonicalPermitStationFields[10], // Longitude
    canonicalPermitStationFields[11], // Latitude
    canonicalPermitStationFields[12], // Configuration
    canonicalPermitStationFields[13], // Data Rate
    canonicalPermitStationFields[14], // Remarks
    canonicalPermitStationFields[15], // Particulars of Proposed Equipment
  ];

  const renderedForeignTop = foreignTopLevelFields
    .map((field, fIdx) => renderFieldInstance(field, fIdx, section))
    .filter(Boolean);

  return (
    <View key={section.id || section.key || `section-${sectionDisplayNum}`} style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconCircleText}>{sectionDisplayNum}</Text>
          </View>
          <Text style={styles.sectionTitle}>Particulars of Equipment</Text>
        </View>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>SECTION {sectionDisplayNum}</Text>
        </View>
      </View>

      {/* 1. Top-Level General Operating Fields */}
      {renderedForeignTop.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <FormGrid>{renderedForeignTop}</FormGrid>
        </View>
      )}

      {/* 2. Station Particulars Repeater */}
      {Array.from({ length: stationParticularsCount }).map((_, stationIdx) => {
        const instanceSuffix = stationIdx === 0 ? "" : `station_${stationIdx}`;
        const renderedStationFields = foreignStationFields
          .map((field, fIdx) => renderFieldInstance(field, fIdx, section, instanceSuffix))
          .filter(Boolean);

        return (
          <View
            key={`station-particular-${stationIdx}`}
            style={styles.stationParticularCard}
          >
            <View style={styles.stationParticularHeader}>
              <View style={styles.stationParticularPill}>
                <Text style={styles.stationParticularPillText}>
                  Station Particular #{stationIdx + 1}
                </Text>
              </View>
              {stationIdx > 0 && (
                <TouchableOpacity
                  onPress={() => onRemoveStationParticular(stationIdx)}
                  style={styles.removeStationBtn}
                  activeOpacity={0.7}
                >
                  <Icon name="trash-2" size={13} color="#DC2626" />
                  <Text style={styles.removeStationBtnText}>Remove Station</Text>
                </TouchableOpacity>
              )}
            </View>
            <FormGrid>{renderedStationFields}</FormGrid>
          </View>
        );
      })}

      <TouchableOpacity
        onPress={onAddStationParticular}
        style={styles.addStationBtn}
        activeOpacity={0.8}
      >
        <Icon name="plus" size={15} color="#1D4ED8" />
        <Text style={styles.addStationBtnText}>Add Another Station Particular</Text>
      </TouchableOpacity>
    </View>
  );
};
