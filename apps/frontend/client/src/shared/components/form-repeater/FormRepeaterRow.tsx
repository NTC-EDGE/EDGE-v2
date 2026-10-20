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
import { FormRepeaterFileField } from "./FormRepeaterFileField";
import { styles } from "./formRepeaterStyles";

interface FormRepeaterRowProps {
  rowItem: Record<string, string>;
  rowIndex: number;
  minRows: number;
  totalRows: number;
  isDeviceTable: boolean;
  isEquipmentsTable: boolean;
  resolvedColumns: FormRepeaterColumn[];
  showCallSign?: boolean;
  onRemoveRow: (rowIndex: number) => void;
  onCellChange: (rowIndex: number, columnKey: string, cellValue: string) => void;
  onEquipmentUnitChange: (
    rowIndex: number,
    colKey: string,
    unitIndex: number,
    field: "serialNumber" | "frequency" | "callSign",
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
  showCallSign = false,
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
  const isStationParticularsTable = resolvedColumns.some(
    (c) => c.key === "stationClass" && resolvedColumns.some((col) => col.key === "exactLocation" || col.type === "equipments")
  );
  const isPurchaseClassOnly =
    resolvedColumns.length === 1 &&
    (resolvedColumns[0].key === "classOfStation" || resolvedColumns[0].key === "stationClass");

  return (
    <View style={[styles.rowCard, !isStationParticularsTable && isEquipmentsTable && totalRows === 1 && styles.rowCardMinimal]}>
      {(totalRows > 1 || !isEquipmentsTable || isStationParticularsTable || isPurchaseClassOnly) && (
        <View style={styles.rowCardHeader}>
          <View style={styles.rowNumberPill}>
            <Text style={styles.rowNumberText}>
              {isStationParticularsTable
                ? `Station Profile #${rowIndex + 1}`
                : isPurchaseClassOnly
                ? `Station Class #${rowIndex + 1}`
                : isDeviceTable
                ? `Device Group #${rowIndex + 1}`
                : isEquipmentsTable
                ? `Equipment Item #${rowIndex + 1}`
                : `#${rowIndex + 1}`}
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
                {isStationParticularsTable
                  ? "Remove Station"
                  : isPurchaseClassOnly
                  ? "Remove Station Class"
                  : isDeviceTable
                  ? "Remove Group"
                  : isEquipmentsTable
                  ? "Remove Equipment"
                  : "Remove"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FormGrid>
        {resolvedColumns.map((col) => {
          const rawVal = rowItem[col.key];
          const cellVal =
            rawVal !== undefined && rawVal !== null
              ? String(rawVal)
              : col.key === "stationClass" && rowItem.classOfStation !== undefined && rowItem.classOfStation !== null
              ? String(rowItem.classOfStation)
              : col.key === "classOfStation" && rowItem.stationClass !== undefined && rowItem.stationClass !== null
              ? String(rowItem.stationClass)
              : "";
          const isEquipments = col.type === "equipments";
          const isSerials = col.type === "serials";
          const isSelect = col.type === "select";
          const isDate = col.type === "date";
          const isNumber = col.type === "number";
          const isFile = col.type === "file" || col.key === "attachment_file" || col.key === "attachment" || col.key === "file_name";

          if (isEquipments) {
            return (
              <FormRepeaterEquipmentsField
                key={`${rowId}-${col.key}`}
                rowIndex={rowIndex}
                col={col}
                rawEquipmentsValue={rowItem[col.key] || rowItem.equipments}
                showCallSign={showCallSign}
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

          const isFullWidth =
            isEquipments ||
            col.key === "exactLocation" ||
            col.key === "remarks" ||
            col.key === "makeTypeModel" ||
            (!isStationParticularsTable && isEquipmentsTable) ||
            resolvedColumns.length === 1;

          return (
            <FormCol key={`${rowId}-${col.key}`} span={isFullWidth ? 12 : 6}>
              {isFile ? (
                <FormRepeaterFileField
                  col={col}
                  value={cellVal}
                  onChange={(v) => onCellChange(rowIndex, col.key, v)}
                />
              ) : isSelect ? (
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
