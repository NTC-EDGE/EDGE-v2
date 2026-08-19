import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { ValidatedInput } from "./ValidatedInput";
import { Select } from "./Select";
import { DatePickerInput } from "./DatePickerInput";
import { FormGrid, FormCol } from "./FormGrid";

export interface FormRepeaterColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "date";
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
}

export interface FormRepeaterTableProps {
  label?: string;
  isRequired?: boolean;
  value?: string;
  columns?: FormRepeaterColumn[];
  onChange: (value: string) => void;
  error?: string;
  addButtonLabel?: string;
  minRows?: number;
  maxRows?: number;
  instruction?: string;
  fieldKey?: string;
}

export const DEFAULT_EQUIPMENT_REPEATER_COLUMNS: FormRepeaterColumn[] = [
  { key: "make", label: "Make", placeholder: "e.g. ICOM, Yaesu, Kenwood", required: true },
  { key: "typeModel", label: "Type / Model", placeholder: "e.g. IC-7300, FT-991A", required: true },
  { key: "serialNumber", label: "Serial Number", placeholder: "e.g. SN-9821034", required: true },
  { key: "frequencyRange", label: "Frequency Range / Power", placeholder: "e.g. 144-148 MHz / 100W", required: false },
];

export const DEFAULT_ANTENNA_REPEATER_COLUMNS: FormRepeaterColumn[] = [
  { key: "antennaType", label: "Antenna Type", placeholder: "e.g. Yagi-Uda, Dipole, Vertical", required: true },
  { key: "height", label: "Height (m)", placeholder: "e.g. 15m", required: false },
  { key: "gain", label: "Gain (dBi)", placeholder: "e.g. 9 dBi", required: false },
  { key: "polarization", label: "Directivity / Polarization", placeholder: "e.g. Directional / Vertical", required: false },
];

export const DEFAULT_DEVICE_REPEATER_COLUMNS: FormRepeaterColumn[] = [
  { key: "deviceType", label: "Device Type", placeholder: "e.g. RFID / SRD / WDN Device", required: true },
  { key: "make", label: "Make / Brand", placeholder: "e.g. Cisco / Zebra", required: true },
  { key: "model", label: "Type / Model", placeholder: "e.g. AP-515 / FX9600", required: true },
  { key: "serialNumber", label: "Serial Number", placeholder: "e.g. SN-0029103", required: true },
];

export const DEFAULT_OFFICER_REPEATER_COLUMNS: FormRepeaterColumn[] = [
  { key: "name", label: "Officer Full Name", placeholder: "e.g. Juan dela Cruz", required: true },
  { key: "licenseNo", label: "Certificate / License No.", placeholder: "e.g. 1RTG-10293", required: true },
  { key: "rating", label: "Class / Rating", placeholder: "e.g. First Class Commercial", required: false },
  { key: "expiryDate", label: "Validity / Expiry Date", type: "date", required: false },
];

export function resolveRepeaterColumns(
  fieldKey?: string,
  fieldLabel?: string,
  customColumns?: FormRepeaterColumn[]
): FormRepeaterColumn[] {
  if (customColumns && customColumns.length > 0) {
    return customColumns;
  }

  const keyLower = (fieldKey || "").toLowerCase();
  const labelLower = (fieldLabel || "").toLowerCase();

  if (keyLower.includes("antenna") || labelLower.includes("antenna")) {
    return DEFAULT_ANTENNA_REPEATER_COLUMNS;
  }
  if (keyLower.includes("device") || labelLower.includes("device")) {
    return DEFAULT_DEVICE_REPEATER_COLUMNS;
  }
  if (keyLower.includes("officer") || keyLower.includes("personnel") || labelLower.includes("officer")) {
    return DEFAULT_OFFICER_REPEATER_COLUMNS;
  }

  return DEFAULT_EQUIPMENT_REPEATER_COLUMNS;
}

function parseInitialRows(value?: string, cols?: FormRepeaterColumn[]): Array<Record<string, string>> {
  if (!value || value.trim() === "") {
    return [createEmptyRow(cols || DEFAULT_EQUIPMENT_REPEATER_COLUMNS)];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item) => {
        if (typeof item === "object" && item !== null) {
          const rowRecord: Record<string, string> = {};
          Object.keys(item).forEach((k) => {
            const val = item[k];
            rowRecord[k] = val !== null && val !== undefined ? String(val) : "";
          });
          return rowRecord;
        }
        return { value: String(item) };
      });
    }
  } catch {
    // If string is comma separated or simple text, map to first column
    const defaultColKey = (cols && cols[0]?.key) || "make";
    return [{ [defaultColKey]: value }];
  }

  return [createEmptyRow(cols || DEFAULT_EQUIPMENT_REPEATER_COLUMNS)];
}

function createEmptyRow(cols: FormRepeaterColumn[]): Record<string, string> {
  const row: Record<string, string> = { _id: String(Date.now() + Math.random()) };
  cols.forEach((col) => {
    row[col.key] = "";
  });
  return row;
}

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
}: FormRepeaterTableProps) {
  const resolvedColumns = resolveRepeaterColumns(fieldKey, label, columns);
  const [rows, setRows] = useState<Array<Record<string, string>>>(() =>
    parseInitialRows(value, resolvedColumns)
  );

  const lastEmittedRef = useRef<string>(value);

  useEffect(() => {
    if (value !== lastEmittedRef.current && value !== "") {
      const parsed = parseInitialRows(value, resolvedColumns);
      setRows(parsed);
      lastEmittedRef.current = value;
    }
  }, [value, resolvedColumns]);

  const emitChange = (updatedRows: Array<Record<string, string>>) => {
    setRows(updatedRows);
    const serialized = JSON.stringify(updatedRows);
    lastEmittedRef.current = serialized;
    onChange(serialized);
  };

  const handleCellChange = (rowIndex: number, columnKey: string, cellValue: string) => {
    const updated = rows.map((r, idx) => {
      if (idx === rowIndex) {
        return { ...r, [columnKey]: cellValue };
      }
      return r;
    });
    emitChange(updated);
  };

  const handleAddRow = () => {
    if (rows.length >= maxRows) return;
    const newRow = createEmptyRow(resolvedColumns);
    const updated = [...rows, newRow];
    emitChange(updated);
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (rows.length <= minRows) return;
    const updated = rows.filter((_, idx) => idx !== rowIndex);
    emitChange(updated);
  };

  const cleanLabel = label.replace(/Details|Particulars|Information|Technical/gi, "").trim() || "Item";
  const btnLabel = addButtonLabel || `Add ${cleanLabel}`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <View style={styles.iconBadge}>
            <Icon name="layers" size={14} color="#0F2C59" />
          </View>
          <Text style={styles.mainLabel}>{label}</Text>
          {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}
        </View>
        <Text style={styles.rowCountBadge}>{rows.length} {rows.length === 1 ? "entry" : "entries"}</Text>
      </View>

      {instruction && instruction.length > 0 && (
        <Text style={styles.instructionText}>{instruction}</Text>
      )}

      {/* Rows Container */}
      <View style={styles.rowsWrapper}>
        {rows.map((rowItem, rowIndex) => {
          const rowId = rowItem._id || `row-${rowIndex}`;

          return (
            <View key={rowId} style={styles.rowCard}>
              <View style={styles.rowCardHeader}>
                <View style={styles.rowNumberPill}>
                  <Text style={styles.rowNumberText}>#{rowIndex + 1}</Text>
                </View>
                {rows.length > minRows && (
                  <TouchableOpacity
                    onPress={() => handleRemoveRow(rowIndex)}
                    style={styles.deleteButton}
                    activeOpacity={0.7}
                  >
                    <Icon name="trash-2" size={13} color="#DC2626" />
                    <Text style={styles.deleteButtonText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <FormGrid>
                {resolvedColumns.map((col) => {
                  const cellVal = rowItem[col.key] ?? "";
                  const isSelect = col.type === "select";
                  const isDate = col.type === "date";
                  const isNumber = col.type === "number";

                  return (
                    <FormCol key={`${rowId}-${col.key}`} span={6}>
                      {isSelect ? (
                        <Select
                          label={col.label}
                          required={col.required}
                          value={cellVal}
                          options={col.options || []}
                          placeholder={col.placeholder || `Select ${col.label}...`}
                          onValueChange={(v) => handleCellChange(rowIndex, col.key, v)}
                        />
                      ) : isDate ? (
                        <DatePickerInput
                          label={col.label}
                          required={col.required}
                          value={cellVal}
                          onChangeText={(v) => handleCellChange(rowIndex, col.key, v)}
                        />
                      ) : (
                        <ValidatedInput
                          label={col.label}
                          required={col.required}
                          placeholder={col.placeholder || `Enter ${col.label}...`}
                          value={cellVal}
                          keyboardType={isNumber ? "numeric" : "default"}
                          onChangeText={(v) => handleCellChange(rowIndex, col.key, v)}
                        />
                      )}
                    </FormCol>
                  );
                })}
              </FormGrid>
            </View>
          );
        })}
      </View>

      {/* Add Row Button */}
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

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  mainLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F2C59",
  },
  requiredAsterisk: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
  },
  rowCountBadge: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    backgroundColor: "#E2E8F0",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  instructionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
  },
  rowsWrapper: {
    gap: 12,
  },
  rowCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 12,
  },
  rowCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 6,
  },
  rowNumberPill: {
    backgroundColor: "#EFF6FF",
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  rowNumberText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  deleteButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 12,
  },
  addButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    color: "#0F2C59",
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#DC2626",
    marginTop: 6,
  },
});
