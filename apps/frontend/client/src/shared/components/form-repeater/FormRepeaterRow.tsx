import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { ValidatedInput } from "../ValidatedInput";
import { Select } from "../Select";
import { DatePickerInput } from "../DatePickerInput";
import { FormGrid, FormCol } from "../FormGrid";
import { FormRepeaterColumn } from "./formRepeaterTypes";
import { FormRepeaterEquipmentsField } from "./FormRepeaterEquipmentsField";
import { FormRepeaterSerialsField } from "./FormRepeaterSerialsField";
import { styles } from "./formRepeaterStyles";

interface FormRepeaterRowProps {
  rowItem: Record<string, string>;
  rowIndex: number;
  minRows: number;
  totalRows: number;
  isDeviceTable: boolean;
  isEquipmentsTable: boolean;
  resolvedColumns: FormRepeaterColumn[];
  onRemoveRow: (rowIndex: number) => void;
  onCellChange: (rowIndex: number, columnKey: string, cellValue: string) => void;
  onEquipmentUnitChange: (
    rowIndex: number,
    colKey: string,
    unitIndex: number,
    field: "serialNumber" | "frequency",
    text: string
  ) => void;
  onAddEquipmentUnit: (rowIndex: number, colKey: string) => void;
  onRemoveEquipmentUnit: (rowIndex: number, colKey: string, unitIndex: number) => void;
  onSerialEntryChange: (rowIndex: number, colKey: string, serialIndex: number, text: string) => void;
  onAddSerialEntry: (rowIndex: number, colKey: string) => void;
  onRemoveSerialEntry: (rowIndex: number, colKey: string, serialIndex: number) => void;
}

export const FormRepeaterRow: React.FC<FormRepeaterRowProps> = ({
  rowItem,
  rowIndex,
  minRows,
  totalRows,
  isDeviceTable,
  isEquipmentsTable,
  resolvedColumns,
  onRemoveRow,
  onCellChange,
  onEquipmentUnitChange,
  onAddEquipmentUnit,
  onRemoveEquipmentUnit,
  onSerialEntryChange,
  onAddSerialEntry,
  onRemoveSerialEntry,
}) => {
  const rowId = rowItem._id || `row-${rowIndex}`;

  return (
    <View style={[styles.rowCard, isEquipmentsTable && styles.rowCardMinimal]}>
      {!isEquipmentsTable && (
        <View style={styles.rowCardHeader}>
          <View style={styles.rowNumberPill}>
            <Text style={styles.rowNumberText}>
              {isDeviceTable ? `Device Group #${rowIndex + 1}` : `#${rowIndex + 1}`}
            </Text>
          </View>
          {totalRows > minRows && (
            <TouchableOpacity
              onPress={() => onRemoveRow(rowIndex)}
              style={styles.deleteButton}
              activeOpacity={0.7}
            >
              <Icon name="trash-2" size={13} color="#DC2626" />
              <Text style={styles.deleteButtonText}>
                {isDeviceTable ? "Remove Group" : "Remove"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FormGrid>
        {resolvedColumns.map((col) => {
          const cellVal = rowItem[col.key] ?? "";
          const isEquipments = col.type === "equipments";
          const isSerials = col.type === "serials";
          const isSelect = col.type === "select";
          const isDate = col.type === "date";
          const isNumber = col.type === "number";

          if (isEquipments) {
            return (
              <FormRepeaterEquipmentsField
                key={`${rowId}-${col.key}`}
                rowIndex={rowIndex}
                col={col}
                rawEquipmentsValue={rowItem[col.key] || rowItem.equipments}
                onEquipmentUnitChange={onEquipmentUnitChange}
                onAddEquipmentUnit={onAddEquipmentUnit}
                onRemoveEquipmentUnit={onRemoveEquipmentUnit}
              />
            );
          }

          if (isSerials) {
            return (
              <FormRepeaterSerialsField
                key={`${rowId}-${col.key}`}
                rowIndex={rowIndex}
                col={col}
                rawSerialsValue={rowItem[col.key] || rowItem.equipmentSerials || rowItem.serialNumbers || rowItem.serialNumber}
                onSerialEntryChange={onSerialEntryChange}
                onAddSerialEntry={onAddSerialEntry}
                onRemoveSerialEntry={onRemoveSerialEntry}
              />
            );
          }

          return (
            <FormCol key={`${rowId}-${col.key}`} span={isEquipmentsTable || resolvedColumns.length === 1 ? 12 : 6}>
              {isSelect ? (
                <Select
                  label={col.label}
                  required={col.required}
                  value={cellVal}
                  options={col.options || []}
                  placeholder={col.placeholder || `Select ${col.label}...`}
                  onValueChange={(v) => onCellChange(rowIndex, col.key, v)}
                />
              ) : isDate ? (
                <DatePickerInput
                  label={col.label}
                  required={col.required}
                  value={cellVal}
                  onChangeText={(v) => onCellChange(rowIndex, col.key, v)}
                />
              ) : (
                <ValidatedInput
                  label={col.label}
                  required={col.required}
                  placeholder={col.placeholder || `Enter ${col.label}...`}
                  value={cellVal}
                  keyboardType={isNumber ? "numeric" : "default"}
                  onChangeText={(v) => onCellChange(rowIndex, col.key, v)}
                />
              )}
            </FormCol>
          );
        })}
      </FormGrid>
    </View>
  );
};
