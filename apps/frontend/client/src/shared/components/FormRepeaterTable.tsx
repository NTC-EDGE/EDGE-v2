import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { FormRepeaterTableProps, FormRepeaterColumn, DeviceSerialEntry, EquipmentUnitEntry } from "./form-repeater/formRepeaterTypes";
import { resolveRepeaterColumns } from "./form-repeater/formRepeaterColumns";
import { useFormRepeater } from "./form-repeater/useFormRepeater";
import { FormRepeaterRow } from "./form-repeater/FormRepeaterRow";
import { styles } from "./form-repeater/formRepeaterStyles";

// Re-export all types, column definitions, and utilities for backward compatibility
export type { FormRepeaterColumn, DeviceSerialEntry, EquipmentUnitEntry, FormRepeaterTableProps };
export {
  DEFAULT_PERMIT_EQUIPMENT_COLUMNS,
  DEFAULT_EQUIPMENT_REPEATER_COLUMNS,
  DEFAULT_AMATEUR_EQUIPMENT_REPEATER_COLUMNS,
  DEFAULT_AMATEUR_PROPOSED_EQUIPMENT_COLUMNS,
  DEFAULT_AMATEUR_PURCHASE_PARTICULARS_COLUMNS,
  DEFAULT_AMATEUR_ANTENNA_REPEATER_COLUMNS,
  DEFAULT_ANTENNA_REPEATER_COLUMNS,
  DEFAULT_DEVICE_REPEATER_COLUMNS,
  DEFAULT_OFFICER_REPEATER_COLUMNS,
  DEFAULT_TVRO_EQUIPMENT_COLUMNS,
  DEFAULT_TVRO_ANTENNA_COLUMNS,
  DEFAULT_TVRO_SIGNAL_COLUMNS,
  resolveRepeaterColumns,
} from "./form-repeater/formRepeaterColumns";
export { parseSerialEntries, parseEquipmentEntries } from "./form-repeater/formRepeaterUtils";
export { useFormRepeater } from "./form-repeater/useFormRepeater";

export function FormRepeaterTable({
  label = "Particulars of Equipment",
  isRequired = false,
  value = "",
  columns,
  onChange,
  error,
  addButtonLabel,
  minRows = 1,
  maxRows = 20,
  instruction = "Provide complete details for each equipment item / entry.",
  fieldKey,
  parentMakeTypeModel,
  showCallSign = false,
}: FormRepeaterTableProps) {
  const resolvedColumns = resolveRepeaterColumns(fieldKey, label, columns);
  const {
    rows,
    handleCellChange,
    handleSerialEntryChange,
    handleAddSerialEntry,
    handleRemoveSerialEntry,
    handleEquipmentUnitChange,
    handleAddEquipmentUnit,
    handleRemoveEquipmentUnit,
    handleAddRow,
    handleRemoveRow,
  } = useFormRepeater({
    value,
    resolvedColumns,
    parentMakeTypeModel,
    minRows,
    maxRows,
    onChange,
  });

  const isDeviceTable = resolvedColumns.some((c) => c.type === "serials" || c.key === "deviceType");
  const isEquipmentsTable = resolvedColumns.some((c) => c.type === "equipments" || c.key === "equipments");
  const isPurchaseClassOnly = resolvedColumns.length === 1 && resolvedColumns[0].key === "classOfStation";
  const cleanLabel = label.replace(/Details|Particulars|Information|Technical/gi, "").trim() || "Item";
  const btnLabel = addButtonLabel || (isPurchaseClassOnly ? "Add Class of Station" : isDeviceTable ? "Add Another Equipment Device Group" : isEquipmentsTable ? "Add Another Equipment (Make/Type/Model)" : `Add ${cleanLabel}`);

  return (
    <View style={[styles.container, isEquipmentsTable && styles.containerMinimal]}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <View style={styles.iconBadge}>
            <Icon name="layers" size={14} color="#0F2C59" />
          </View>
          <Text style={styles.mainLabel}>{label}</Text>
          {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}
        </View>
        <Text style={styles.rowCountBadge}>
          {rows.length} {rows.length === 1 ? (isDeviceTable ? "device group" : isEquipmentsTable ? "equipment" : "entry") : (isDeviceTable ? "device groups" : isEquipmentsTable ? "equipments" : "entries")}
        </Text>
      </View>

      {instruction && instruction.length > 0 && (
        <Text style={styles.instructionText}>{instruction}</Text>
      )}

      <View style={styles.rowsWrapper}>
        {rows.map((rowItem, rowIndex) => (
          <FormRepeaterRow
            key={rowItem._id || `row-${rowIndex}`}
            rowItem={rowItem}
            rowIndex={rowIndex}
            minRows={minRows}
            totalRows={rows.length}
            isDeviceTable={isDeviceTable}
            isEquipmentsTable={isEquipmentsTable}
            resolvedColumns={resolvedColumns}
            showCallSign={showCallSign}
            onRemoveRow={handleRemoveRow}
            onCellChange={handleCellChange}
            onEquipmentUnitChange={handleEquipmentUnitChange}
            onAddEquipmentUnit={handleAddEquipmentUnit}
            onRemoveEquipmentUnit={handleRemoveEquipmentUnit}
            onSerialEntryChange={handleSerialEntryChange}
            onAddSerialEntry={handleAddSerialEntry}
            onRemoveSerialEntry={handleRemoveSerialEntry}
          />
        ))}
      </View>

      {rows.length < maxRows && (
        <TouchableOpacity
          onPress={handleAddRow}
          style={styles.addButton}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={15} color="#0F2C59" />
          <Text style={styles.addButtonText}>{btnLabel}</Text>
        </TouchableOpacity>
      )}

      {error !== undefined && error.length > 0 && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}
