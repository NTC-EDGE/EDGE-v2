import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { FormGrid } from "../../FormGrid";
import { FieldDto, FormSectionDto, FormVariantFlags } from "../dynamicFormTypes";
import { dynamicFormStyles as styles } from "../DynamicFormRenderer.styles";
import { getSectionTitle } from "../dynamicFormUtils";

interface PermitStationEquipmentSectionProps {
  section: FormSectionDto;
  sectionDisplayNum: number;
  stationParticularsCount: number;
  sectionFields: FieldDto[];
  canonicalPermitStationFields: FieldDto[];
  flags: FormVariantFlags;
  onAddStationParticular: () => void;
  onRemoveStationParticular: (idx: number) => void;
  renderFieldInstance: (field: FieldDto, fIdx: number, section: FormSectionDto, instanceSuffix?: string) => React.ReactNode;
}

export const PermitStationEquipmentSection: React.FC<PermitStationEquipmentSectionProps> = ({
  section,
  sectionDisplayNum,
  stationParticularsCount,
  sectionFields,
  canonicalPermitStationFields,
  flags,
  onAddStationParticular,
  onRemoveStationParticular,
  renderFieldInstance,
}) => {
  const topLevelFields: FieldDto[] = flags.isPermitService
    ? [
        canonicalPermitStationFields[0], // Call Sign
        canonicalPermitStationFields[1], // Points of Comm / Service Area
        canonicalPermitStationFields[2], // Frequency
        canonicalPermitStationFields[3], // Bandwidth
        canonicalPermitStationFields[4], // Unit
        canonicalPermitStationFields[5], // Emission
        canonicalPermitStationFields[6], // Power Output
        canonicalPermitStationFields[7], // Hours of Operation
      ]
    : sectionFields.filter((f) => {
        const rawId = (f.fieldId || f.id || "").toLowerCase();
        const lbl = (f.label || "").toLowerCase();
        return (
          rawId.includes("callsign") ||
          lbl.includes("call sign") ||
          rawId.includes("servicearea") ||
          lbl.includes("service area") ||
          lbl.includes("points of comm") ||
          rawId.includes("frequency") ||
          lbl.includes("frequency") ||
          rawId.includes("bandwidth") ||
          lbl.includes("bandwidth") ||
          rawId.includes("emission") ||
          lbl.includes("emission") ||
          rawId.includes("poweroutput") ||
          lbl.includes("power output") ||
          rawId.includes("hoursofoperation") ||
          lbl.includes("hours of operation")
        );
      });

  const stationParticularFields: FieldDto[] = flags.isPermitService
    ? [
        canonicalPermitStationFields[8],  // Class of Station
        canonicalPermitStationFields[9],  // Exact Location
        canonicalPermitStationFields[10], // Longitude
        canonicalPermitStationFields[11], // Latitude
        canonicalPermitStationFields[12], // Configuration
        canonicalPermitStationFields[13], // Data Rate
        canonicalPermitStationFields[14], // Remarks
        canonicalPermitStationFields[15], // Particulars of Proposed Equipment
      ]
    : sectionFields.filter((f) => !topLevelFields.some((tl) => (tl.fieldId || tl.id) === (f.fieldId || f.id)));

  const findSeededField = (idMatch: string, fallback: FieldDto): FieldDto => {
    const match = sectionFields.find((f) => {
      const fId = (f.fieldId || f.id || "").toLowerCase();
      return fId === idMatch.toLowerCase() || (f.label || "").toLowerCase().includes(idMatch.toLowerCase());
    });
    return match
      ? {
          ...fallback,
          fieldId: match.fieldId || match.id || fallback.fieldId,
          id: match.id || match.fieldId || fallback.id,
          isRequired: match.isRequired ?? fallback.isRequired,
        }
      : fallback;
  };

  const antennaParticularFields: FieldDto[] = [
    findSeededField("antennaType", {
      fieldId: "antennaType",
      id: "antennaType",
      label: "Type",
      fieldType: "text",
      isRequired: false,
      placeholder: "e.g. Yagi, Omni, Dipole",
    }),
    findSeededField("height", {
      fieldId: "height",
      id: "height",
      label: "Height",
      fieldType: "text",
      isRequired: false,
      placeholder: "e.g. 1500 cm / 15m",
    }),
    findSeededField("gain", {
      fieldId: "gain",
      id: "gain",
      label: "Gain",
      fieldType: "text",
      isRequired: false,
      placeholder: "e.g. 12 dB / 9 dBi",
    }),
    findSeededField("directivity", {
      fieldId: "directivity",
      id: "directivity",
      label: "Directivity",
      fieldType: "text",
      isRequired: false,
      placeholder: "e.g. Directional, Omni",
    }),
    findSeededField("diameter", {
      fieldId: "diameter",
      id: "diameter",
      label: "Diameter",
      fieldType: "text",
      isRequired: false,
      placeholder: "e.g. 1.2m, N/A",
    }),
    findSeededField("polarization", {
      fieldId: "polarization",
      id: "polarization",
      label: "Polarization",
      fieldType: "text",
      isRequired: false,
      placeholder: "e.g. Vertical, Horizontal",
    }),
    findSeededField("beamwidth", {
      fieldId: "beamwidth",
      id: "beamwidth",
      label: "Beamwidth",
      fieldType: "text",
      isRequired: false,
      placeholder: "e.g. 60 deg",
    }),
    findSeededField("antennaRemarks", {
      fieldId: "antennaRemarks",
      id: "antennaRemarks",
      label: "Remarks",
      fieldType: "text",
      isRequired: false,
      placeholder: "e.g. Mast mounted",
    }),
  ];

  const renderedTopLevel = topLevelFields
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

      {/* 1. Top-Level General Operating Fields (Entered Once) */}
      {renderedTopLevel.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <FormGrid>{renderedTopLevel}</FormGrid>
        </View>
      )}

      {/* 2. Station Particulars Repeater */}
      {Array.from({ length: stationParticularsCount }).map((_, stationIdx) => {
        const instanceSuffix = stationIdx === 0 ? "" : `station_${stationIdx}`;
        const renderedStationFields = stationParticularFields
          .map((field, fIdx) => renderFieldInstance(field, fIdx, section, instanceSuffix))
          .filter(Boolean);

        const renderedAntennaFields = antennaParticularFields
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
            {flags.isAmateurSellTransfer && (
              <View style={styles.subSectionBox}>
                <Text style={styles.subSectionTitle}>Particulars of Antenna</Text>
                <FormGrid>{renderedAntennaFields}</FormGrid>
              </View>
            )}
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
