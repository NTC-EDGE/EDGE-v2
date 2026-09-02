import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { ValidatedInput } from "../ValidatedInput";
import { FormGrid, FormCol } from "../FormGrid";
import { FormRepeaterColumn } from "./formRepeaterTypes";
import { parseEquipmentEntries } from "./formRepeaterUtils";
import { styles } from "./formRepeaterStyles";

interface FormRepeaterEquipmentsFieldProps {
  rowIndex: number;
  col: FormRepeaterColumn;
  rawEquipmentsValue?: string;
  showCallSign?: boolean;
  onEquipmentUnitChange: (
    rowIndex: number,
    colKey: string,
    unitIndex: number,
    field: "serialNumber" | "frequency" | "callSign",
    text: string
  ) => void;
  onAddEquipmentUnit: (rowIndex: number, colKey: string) => void;
  onRemoveEquipmentUnit: (rowIndex: number, colKey: string, unitIndex: number) => void;
}

export const FormRepeaterEquipmentsField: React.FC<FormRepeaterEquipmentsFieldProps> = ({
  rowIndex,
  col,
  rawEquipmentsValue,
  showCallSign = false,
  onEquipmentUnitChange,
  onAddEquipmentUnit,
  onRemoveEquipmentUnit,
}) => {
  const unitsList = parseEquipmentEntries(rawEquipmentsValue);

  return (
    <FormCol span={12}>
      <View style={styles.serialsWrapper}>
        <View style={styles.serialsHeader}>
          <Text style={styles.serialsLabel}>
            {col.label}
            {col.required && <Text style={styles.requiredAsterisk}>*</Text>}
          </Text>
          <Text style={styles.serialsBadge}>
            {unitsList.length} {unitsList.length === 1 ? "unit" : "units"}
          </Text>
        </View>
        <Text style={styles.serialsInstruction}>
          Specify each unit's Serial Number and Operating Frequency / Range under this Make / Type / Model.
        </Text>

        <View style={styles.serialsList}>
          {unitsList.map((unitItem, uIdx) => (
            <View key={unitItem.id || `u-${uIdx}`} style={styles.unitSubCard}>
              <View style={styles.unitSubHeader}>
                <Text style={styles.unitSubTitle}>Unit #{uIdx + 1}</Text>
                {unitsList.length > 1 && (
                  <TouchableOpacity
                    onPress={() => onRemoveEquipmentUnit(rowIndex, col.key, uIdx)}
                    style={styles.unitDeleteBtn}
                    activeOpacity={0.7}
                    accessibilityLabel={`Remove unit ${uIdx + 1}`}
                  >
                    <Icon name="trash-2" size={13} color="#DC2626" />
                    <Text style={styles.unitDeleteBtnText}>Remove Unit</Text>
                  </TouchableOpacity>
                )}
              </View>

              <FormGrid>
                <FormCol span={showCallSign ? 4 : 6}>
                  <ValidatedInput
                    label="Serial Number"
                    required
                    placeholder="e.g. SN-9821034"
                    value={unitItem.serialNumber}
                    onChangeText={(text) => onEquipmentUnitChange(rowIndex, col.key, uIdx, "serialNumber", text)}
                    style={{ marginBottom: 0 }}
                  />
                </FormCol>
                <FormCol span={showCallSign ? 4 : 6}>
                  <ValidatedInput
                    label={showCallSign ? "Frequency Range" : "Frequency / Frequency Range"}
                    required
                    placeholder="e.g. 118.0 - 136.975 MHz"
                    value={unitItem.frequency}
                    onChangeText={(text) => onEquipmentUnitChange(rowIndex, col.key, uIdx, "frequency", text)}
                    style={{ marginBottom: 0 }}
                  />
                </FormCol>
                {showCallSign && (
                  <FormCol span={4}>
                    <ValidatedInput
                      label="Call Sign"
                      required
                      placeholder="e.g. 4F1XXX / W1AW"
                      value={unitItem.callSign || ""}
                      onChangeText={(text) => onEquipmentUnitChange(rowIndex, col.key, uIdx, "callSign", text)}
                      style={{ marginBottom: 0 }}
                    />
                  </FormCol>
                )}
              </FormGrid>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => onAddEquipmentUnit(rowIndex, col.key)}
          style={styles.addSerialBtn}
          activeOpacity={0.7}
        >
          <Icon name="plus" size={13} color="#1D4ED8" />
          <Text style={styles.addSerialBtnText}>Add Equipment Unit</Text>
        </TouchableOpacity>
      </View>
    </FormCol>
  );
};
