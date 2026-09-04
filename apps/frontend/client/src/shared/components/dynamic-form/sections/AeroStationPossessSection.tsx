import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { FormGrid } from "../../FormGrid";
import { FieldDto, FormSectionDto } from "../dynamicFormTypes";
import { dynamicFormStyles as styles } from "../DynamicFormRenderer.styles";
import {
  FIELD_ID_SERVICE_AREA,
  FIELD_ID_FREQUENCY,
  FIELD_ID_BANDWIDTH,
  FIELD_ID_BANDWIDTH_UNIT,
  FIELD_ID_EMISSION,
  FIELD_ID_POWER_OUTPUT,
  FIELD_ID_HOURS_OP,
  FIELD_ID_STATION_CLASS,
  FIELD_ID_REMARKS,
} from "../../../constants/fieldIds";

interface AeroStationPossessSectionProps {
  section: FormSectionDto;
  sectionDisplayNum: number;
  stationParticularsCount: number;
  onAddStationParticular: () => void;
  onRemoveStationParticular: (idx: number) => void;
  renderFieldInstance: (field: FieldDto, fIdx: number, section: FormSectionDto, instanceSuffix?: string) => React.ReactNode;
}

export const AeroStationPossessSection: React.FC<AeroStationPossessSectionProps> = ({
  section,
  sectionDisplayNum,
  stationParticularsCount,
  onAddStationParticular,
  onRemoveStationParticular,
  renderFieldInstance,
}) => {
  const aeroPossessTopFields: FieldDto[] = [
    {
      fieldId: FIELD_ID_SERVICE_AREA,
      id: "serviceArea",
      label: "Points of Comm/Service Area (optional)",
      fieldType: "text",
      isRequired: false,
      placeholder: "Enter Points of Comm / Service Area...",
    },
    {
      fieldId: FIELD_ID_FREQUENCY,
      id: "frequency",
      label: "Frequency: Within Authorized Aeronautical Band",
      fieldType: "text",
      isRequired: true,
      placeholder: "Within Authorized Aeronautical Band",
    },
    {
      fieldId: "frequencyUnit",
      id: "frequencyUnit",
      label: "Frequency Unit",
      fieldType: "dropdown",
      isRequired: true,
      options: ["KHz", "MHz", "GHz"],
    },
    {
      fieldId: FIELD_ID_BANDWIDTH,
      id: "bandwidth",
      label: "Bandwidth",
      fieldType: "text",
      isRequired: true,
      placeholder: "e.g. 25",
    },
    {
      fieldId: FIELD_ID_BANDWIDTH_UNIT,
      id: "bandwidthUnit",
      label: "Bandwidth Unit",
      fieldType: "dropdown",
      isRequired: true,
      options: ["KHz", "MHz", "GHz"],
    },
    {
      fieldId: FIELD_ID_EMISSION,
      id: "emission",
      label: "Emission",
      fieldType: "text",
      isRequired: true,
      placeholder: "e.g. 6K00A3E",
    },
    {
      fieldId: FIELD_ID_POWER_OUTPUT,
      id: "powerOutput",
      label: "Power Output (watts)",
      fieldType: "text",
      isRequired: true,
      placeholder: "e.g. 50",
    },
    {
      fieldId: FIELD_ID_HOURS_OP,
      id: "hoursOfOperation",
      label: "Hours of Operation",
      fieldType: "text",
      isRequired: true,
      placeholder: "e.g. 24/7 or H24",
    },
  ];

  const aeroClassField: FieldDto = {
    fieldId: FIELD_ID_STATION_CLASS,
    id: "stationClass",
    label: "Class of Station",
    fieldType: "dropdown",
    isRequired: true,
    options: ["FA", "MA"],
  };

  const aeroProposedStationFields: FieldDto[] = [
    {
      fieldId: "exactLocation",
      id: "exactLocation",
      label: "Exact Location",
      fieldType: "text",
      isRequired: true,
      placeholder: "Enter exact station location...",
    },
    {
      fieldId: "longitude",
      id: "longitude",
      label: "Longitude (deg-min-sec)",
      fieldType: "text",
      isRequired: false,
      placeholder: "e.g. 120° 58' 42\" E",
    },
    {
      fieldId: "latitude",
      id: "latitude",
      label: "Latitude (deg-min-sec)",
      fieldType: "text",
      isRequired: false,
      placeholder: "e.g. 14° 35' 38\" N",
    },
    {
      fieldId: "configuration",
      id: "configuration",
      label: "Configuration",
      fieldType: "text",
      isRequired: false,
      placeholder: "Enter configuration...",
    },
    {
      fieldId: "dataRate",
      id: "dataRate",
      label: "Data Rate",
      fieldType: "text",
      isRequired: false,
      placeholder: "Enter data rate...",
    },
    {
      fieldId: FIELD_ID_REMARKS,
      id: "remarks",
      label: "Remarks",
      fieldType: "text",
      isRequired: false,
      placeholder: "Enter remarks...",
    },
  ];

  const aeroEquipmentField: FieldDto = {
    fieldId: "equipmentDetails",
    id: "equipmentDetails",
    label: "Particulars of Proposed Equipment",
    fieldType: "repeater",
    isRequired: true,
  };

  const renderedTopLevel = aeroPossessTopFields
    .map((f, idx) => renderFieldInstance(f, idx, section))
    .filter(Boolean);

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

      {/* 1. Top-Level General Operating Fields */}
      <FormGrid>{renderedTopLevel}</FormGrid>

      {/* 2. Station Particulars Repeater */}
      {Array.from({ length: stationParticularsCount }).map((_, stationIdx) => {
        const instanceSuffix = stationIdx === 0 ? "" : `station_${stationIdx}`;
        const renderedClassField = renderFieldInstance(aeroClassField, 0, section, instanceSuffix);
        const renderedProposedStationFields = aeroProposedStationFields
          .map((field, fIdx) => renderFieldInstance(field, fIdx, section, instanceSuffix))
          .filter(Boolean);
        const renderedEquipment = renderFieldInstance(aeroEquipmentField, 0, section, instanceSuffix);

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

            {/* Class of Station (One Row) */}
            <FormGrid>{renderedClassField}</FormGrid>

            {/* Particulars of Proposed Station */}
            <View style={styles.subSectionBox}>
              <Text style={styles.subSectionTitle}>Particulars of Proposed Station</Text>
              <FormGrid>{renderedProposedStationFields}</FormGrid>
            </View>

            {/* Particulars of Proposed Equipment */}
            <View style={{ width: "100%", marginTop: 12 }}>
              {renderedEquipment}
            </View>
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
