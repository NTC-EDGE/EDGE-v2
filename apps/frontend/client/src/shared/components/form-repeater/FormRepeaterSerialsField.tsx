import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { ValidatedInput } from "../ValidatedInput";
import { FormCol } from "../FormGrid";
import { FormRepeaterColumn } from "./formRepeaterTypes";
import { parseSerialEntries } from "./formRepeaterUtils";
import { styles } from "./formRepeaterStyles";

interface FormRepeaterSerialsFieldProps {
  rowIndex: number;
  col: FormRepeaterColumn;
  rawSerialsValue?: string;
  onSerialEntryChange: (rowIndex: number, colKey: string, serialIndex: number, text: string) => void;
  onAddSerialEntry: (rowIndex: number, colKey: string) => void;
  onRemoveSerialEntry: (rowIndex: number, colKey: string, serialIndex: number) => void;
}

export const FormRepeaterSerialsField: React.FC<FormRepeaterSerialsFieldProps> = ({
  rowIndex,
  col,
  rawSerialsValue,
  onSerialEntryChange,
  onAddSerialEntry,
  onRemoveSerialEntry,
}) => {
  const serialsList = parseSerialEntries(rawSerialsValue);

  return (
    <FormCol span={12}>
      <View style={styles.serialsWrapper}>
        <View style={styles.serialsHeader}>
          <Text style={styles.serialsLabel}>
            {col.label}
            {col.required && <Text style={styles.requiredAsterisk}>*</Text>}
          </Text>
          <Text style={styles.serialsBadge}>
            {serialsList.length} {serialsList.length === 1 ? "serial" : "serials"}
          </Text>
        </View>
        <Text style={styles.serialsInstruction}>
          Specify each unit serial number registered under this equipment device group.
        </Text>

        <View style={styles.serialsList}>
          {serialsList.map((serialItem, sIdx) => (
            <View key={serialItem.id || `s-${sIdx}`} style={styles.serialRow}>
              <View style={styles.serialInputWrapper}>
                <ValidatedInput
                  placeholder={`Serial No. ${sIdx + 1} (e.g. SN-00${sIdx + 1})`}
                  value={serialItem.serialNumber}
                  onChangeText={(text) => onSerialEntryChange(rowIndex, col.key, sIdx, text)}
                  style={{ marginBottom: 0 }}
                />
              </View>
              {serialsList.length > 1 && (
                <TouchableOpacity
                  onPress={() => onRemoveSerialEntry(rowIndex, col.key, sIdx)}
                  style={styles.serialDeleteBtn}
                  activeOpacity={0.7}
                  accessibilityLabel={`Remove serial ${sIdx + 1}`}
                >
                  <Icon name="trash-2" size={14} color="#DC2626" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => onAddSerialEntry(rowIndex, col.key)}
          style={styles.addSerialBtn}
          activeOpacity={0.7}
        >
          <Icon name="plus" size={13} color="#1D4ED8" />
          <Text style={styles.addSerialBtnText}>Add Serial Number</Text>
        </TouchableOpacity>
      </View>
    </FormCol>
  );
};
