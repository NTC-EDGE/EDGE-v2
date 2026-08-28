import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { ValidatedInput } from "./ValidatedInput";
import { Select } from "./Select";
import { DatePickerInput } from "./DatePickerInput";
import { FormGrid, FormCol } from "./FormGrid";
import { FIELD_ID_DEVICES } from "../constants/fieldIds";

export interface FormRepeaterColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "date" | "serials";
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
}

export interface DeviceSerialEntry {
  id: string;
  serialNumber: string;
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
  {
    key: "deviceType",
    label: "Device / Equipment Type",
    type: "select",
    required: true,
    options: [
      { label: "Wireless Data Network (WDN) Devices - Indoor", value: "Wireless Data Network (WDN) Devices - Indoor" },
      { label: "Wireless Data Network (WDN) Devices - Outdoor", value: "Wireless Data Network (WDN) Devices - Outdoor" },
      { label: "Short Range Devices (SRD)", value: "Short Range Devices (SRD)" },
      { label: "Radio Frequency Identification (RFID) Devices", value: "Radio Frequency Identification (RFID) Devices" },
      { label: "Bluetooth / Wi-Fi Access Points", value: "Bluetooth / Wi-Fi Access Points" },
      { label: "Short Range Radio Services", value: "Short Range Radio Services" },
    ],
  },
  { key: "makeTypeModel", label: "Make / Type / Model", placeholder: "e.g. Cisco Catalyst 9120AX / Zebra FX9600", required: true },
  {
    key: "equipmentSerials",
    label: "Equipment Serial Numbers",
    type: "serials",
    placeholder: "e.g. SN-00123",
    required: true,
  },
];

export const DEFAULT_OFFICER_REPEATER_COLUMNS: FormRepeaterColumn[] = [
  { key: "name", label: "Officer Full Name", placeholder: "e.g. Juan dela Cruz", required: true },
  { key: "licenseNo", label: "Certificate / License No.", placeholder: "e.g. 1RTG-10293", required: true },
  { key: "rating", label: "Class / Rating", placeholder: "e.g. First Class Commercial", required: false },
  { key: "expiryDate", label: "Validity / Expiry Date", type: "date", required: false },
];

export const DEFAULT_TVRO_EQUIPMENT_COLUMNS: FormRepeaterColumn[] = [
  {
    key: "type",
    label: "Type",
    type: "select",
    required: true,
    options: [
      { label: "LNA/LNB", value: "LNA/LNB" },
      { label: "Receivers", value: "Receivers" },
      { label: "Combiner/s", value: "Combiner/s" },
      { label: "Modulators", value: "Modulators" },
    ],
  },
  { key: "makeTypeModel", label: "Make/Type/Model", placeholder: "e.g. Harmonic ProView 7100", required: true },
  { key: "serialNumber", label: "Serial Number", placeholder: "e.g. SN-8920194", required: true },
  { key: "frequencyRange", label: "Frequency Range", placeholder: "e.g. 3.7 - 4.2 GHz (C-Band)", required: true },
];

export const DEFAULT_TVRO_ANTENNA_COLUMNS: FormRepeaterColumn[] = [
  { key: "makeTypeModel", label: "Make/Type/Model", placeholder: "e.g. Patriot 3.8m Prime Focus", required: false },
  { key: "dishDiameter", label: "Dish Diameter", placeholder: "e.g. 3.8 meters", required: false },
  { key: "polarization", label: "Polarization", placeholder: "e.g. Dual Linear (H/V) / Circular", required: false },
  { key: "azimuth", label: "Azimuth", placeholder: "e.g. 142.5° True", required: false },
];

export const DEFAULT_TVRO_SIGNAL_COLUMNS: FormRepeaterColumn[] = [
  { key: "satellite", label: "Satellite", placeholder: "e.g. Asiasat 7 (105.5°E)", required: false },
  { key: "receivedFrequency", label: "Received Frequency", placeholder: "e.g. 3840 MHz", required: false },
  { key: "polarization", label: "Polarization", placeholder: "e.g. Vertical / Horizontal", required: false },
  { key: "nameOfPrograms", label: "Name of Programs", placeholder: "e.g. News, Educational Feeds", required: false },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseSerialEntries(val: unknown): DeviceSerialEntry[] {
  if (Array.isArray(val)) {
    const entries: DeviceSerialEntry[] = [];
    val.forEach((item, idx) => {
      if (typeof item === "string" && item.trim() !== "") {
        entries.push({ id: `serial-${idx}-${Date.now()}`, serialNumber: item.trim() });
      } else if (isRecord(item)) {
        const idVal = typeof item.id === "string" && item.id.length > 0 ? item.id : `serial-${idx}-${Date.now()}`;
        const serialVal = typeof item.serialNumber === "string" ? item.serialNumber : typeof item.serial === "string" ? item.serial : "";
        entries.push({ id: idVal, serialNumber: serialVal });
      }
    });
    if (entries.length > 0) return entries;
  }

  if (typeof val === "string" && val.trim() !== "") {
    const trimmed = val.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parseSerialEntries(parsed);
        }
      } catch {
        // Fallback to delimiter split
      }
    }
    const parts = trimmed.split(/[;,\n]/).map((p) => p.trim()).filter((p) => p.length > 0);
    if (parts.length > 0) {
      return parts.map((p, idx) => ({ id: `serial-${idx}`, serialNumber: p }));
    }
  }

  return [{ id: `serial-1`, serialNumber: "" }];
}

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

  // TVRO specific matchers
  if (
    keyLower.includes("tvro_signal") ||
    keyLower.includes("tvrosignal") ||
    keyLower.includes("signalreception") ||
    keyLower.includes("tvrosignaldetails") ||
    labelLower.includes("signal to be received") ||
    labelLower.includes("particulars of signal")
  ) {
    return DEFAULT_TVRO_SIGNAL_COLUMNS;
  }
  if (
    keyLower.includes("tvro_antenna") ||
    keyLower.includes("tvroantenna") ||
    keyLower.includes("antennasystem") ||
    keyLower.includes("tvroantennadetails") ||
    (keyLower.includes("antenna") && labelLower.includes("tvro")) ||
    labelLower.includes("particulars of antenna system") ||
    labelLower.includes("antenna system")
  ) {
    return DEFAULT_TVRO_ANTENNA_COLUMNS;
  }
  if (
    keyLower.includes("tvro_equipment") ||
    keyLower.includes("tvroequipment") ||
    keyLower.includes("tvroequipmentdetails") ||
    keyLower.includes("tvrodetails") ||
    labelLower.includes("particulars of equipment") ||
    (labelLower.includes("equipment") && (labelLower.includes("tvro") || keyLower.includes("tvro") || labelLower.includes("particular")))
  ) {
    return DEFAULT_TVRO_EQUIPMENT_COLUMNS;
  }

  if (keyLower.includes("antenna") || labelLower.includes("antenna")) {
    return DEFAULT_ANTENNA_REPEATER_COLUMNS;
  }
  if (
    keyLower.includes("device") ||
    keyLower.includes("devicesdetails") ||
    keyLower === FIELD_ID_DEVICES.toLowerCase() ||
    keyLower === "fd000000-0000-0000-0000-000000000035" ||
    labelLower.includes("device") ||
    labelLower.includes("registered devices") ||
    labelLower.includes("wdn") ||
    labelLower.includes("srd") ||
    labelLower.includes("rfid")
  ) {
    return DEFAULT_DEVICE_REPEATER_COLUMNS;
  }
  if (keyLower.includes("officer") || keyLower.includes("personnel") || labelLower.includes("officer")) {
    return DEFAULT_OFFICER_REPEATER_COLUMNS;
  }

  return DEFAULT_EQUIPMENT_REPEATER_COLUMNS;
}

function parseInitialRows(value?: string, cols?: FormRepeaterColumn[]): Array<Record<string, string>> {
  const activeCols = cols || DEFAULT_EQUIPMENT_REPEATER_COLUMNS;
  if (!value || value.trim() === "") {
    return [createEmptyRow(activeCols)];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item) => {
        if (isRecord(item)) {
          const rowRecord: Record<string, string> = {};
          Object.keys(item).forEach((k) => {
            const val = item[k];
            if (val !== null && val !== undefined) {
              rowRecord[k] = typeof val === "object" ? JSON.stringify(val) : String(val);
            } else {
              rowRecord[k] = "";
            }
          });

          // Harmonize field keys between standards
          if (!rowRecord.deviceType && rowRecord.typeOfEquipmentDevice) {
            rowRecord.deviceType = rowRecord.typeOfEquipmentDevice;
          }
          if (!rowRecord.typeOfEquipmentDevice && rowRecord.deviceType) {
            rowRecord.typeOfEquipmentDevice = rowRecord.deviceType;
          }
          if (!rowRecord.makeTypeModel && rowRecord.nameTypeModel) {
            rowRecord.makeTypeModel = rowRecord.nameTypeModel;
          }
          if (!rowRecord.nameTypeModel && rowRecord.makeTypeModel) {
            rowRecord.nameTypeModel = rowRecord.makeTypeModel;
          }

          // Ensure equipmentSerials is populated if serial numbers exist
          if (!rowRecord.equipmentSerials) {
            const fallbackSerials = rowRecord.serialNumbers || rowRecord.serialNumber || rowRecord.serials;
            if (fallbackSerials) {
              const entries = parseSerialEntries(fallbackSerials);
              rowRecord.equipmentSerials = JSON.stringify(entries);
            }
          }

          if (!rowRecord._id) {
            rowRecord._id = String(Date.now() + Math.random());
          }
          return rowRecord;
        }
        return { value: String(item), _id: String(Date.now() + Math.random()) };
      });
    }
  } catch {
    // If string is comma separated or simple text, map to first column
    const defaultColKey = (activeCols && activeCols[0]?.key) || "make";
    return [{ [defaultColKey]: value, _id: String(Date.now() + Math.random()) }];
  }

  return [createEmptyRow(activeCols)];
}

function createEmptyRow(cols: FormRepeaterColumn[]): Record<string, string> {
  const row: Record<string, string> = { _id: String(Date.now() + Math.random()) };
  cols.forEach((col) => {
    if (col.type === "serials" || col.key === "equipmentSerials") {
      row[col.key] = JSON.stringify([{ id: `serial-${Date.now()}`, serialNumber: "" }]);
      row["typeOfEquipmentDevice"] = "Wireless Data Network (WDN) Devices - Indoor";
      row["nameTypeModel"] = "";
      row["serialNumber"] = "";
    } else {
      row[col.key] = "";
    }
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
    // Format rows with both standardized and helper keys
    const enrichedRows = updatedRows.map((r) => {
      const copy = { ...r };
      if (copy.deviceType && !copy.typeOfEquipmentDevice) {
        copy.typeOfEquipmentDevice = copy.deviceType;
      }
      if (copy.makeTypeModel && !copy.nameTypeModel) {
        copy.nameTypeModel = copy.makeTypeModel;
      }
      return copy;
    });

    setRows(enrichedRows);
    const serialized = JSON.stringify(enrichedRows);
    lastEmittedRef.current = serialized;
    onChange(serialized);
  };

  const handleCellChange = (rowIndex: number, columnKey: string, cellValue: string) => {
    const updated = rows.map((r, idx) => {
      if (idx === rowIndex) {
        const updatedRow = { ...r, [columnKey]: cellValue };
        if (columnKey === "deviceType") {
          updatedRow.typeOfEquipmentDevice = cellValue;
        } else if (columnKey === "makeTypeModel") {
          updatedRow.nameTypeModel = cellValue;
        }
        return updatedRow;
      }
      return r;
    });
    emitChange(updated);
  };

  const handleSerialEntryChange = (rowIndex: number, colKey: string, serialIndex: number, text: string) => {
    const currentRow = rows[rowIndex];
    if (currentRow === undefined) return;

    const rawSerialsVal = currentRow[colKey] || currentRow.equipmentSerials || currentRow.serialNumbers || currentRow.serialNumber;
    const currentSerials = parseSerialEntries(rawSerialsVal);
    const updatedSerials = currentSerials.map((s, idx) => {
      if (idx === serialIndex) {
        return { ...s, serialNumber: text };
      }
      return s;
    });

    const serialStrings = updatedSerials.map((s) => s.serialNumber).filter((s) => s.trim().length > 0);
    const commaJoined = serialStrings.join(", ");
    const jsonSerialized = JSON.stringify(updatedSerials);

    const updated = rows.map((r, idx) => {
      if (idx === rowIndex) {
        return {
          ...r,
          [colKey]: jsonSerialized,
          equipmentSerials: jsonSerialized,
          serialNumbers: jsonSerialized,
          serialNumber: commaJoined || (updatedSerials[0]?.serialNumber ?? ""),
        };
      }
      return r;
    });
    emitChange(updated);
  };

  const handleAddSerialEntry = (rowIndex: number, colKey: string) => {
    const currentRow = rows[rowIndex];
    if (currentRow === undefined) return;

    const rawSerialsVal = currentRow[colKey] || currentRow.equipmentSerials || currentRow.serialNumbers || currentRow.serialNumber;
    const currentSerials = parseSerialEntries(rawSerialsVal);
    const newSerial: DeviceSerialEntry = {
      id: `serial-${Date.now()}-${currentSerials.length}`,
      serialNumber: "",
    };
    const updatedSerials = [...currentSerials, newSerial];
    const jsonSerialized = JSON.stringify(updatedSerials);

    const updated = rows.map((r, idx) => {
      if (idx === rowIndex) {
        return {
          ...r,
          [colKey]: jsonSerialized,
          equipmentSerials: jsonSerialized,
          serialNumbers: jsonSerialized,
        };
      }
      return r;
    });
    emitChange(updated);
  };

  const handleRemoveSerialEntry = (rowIndex: number, colKey: string, serialIndex: number) => {
    const currentRow = rows[rowIndex];
    if (currentRow === undefined) return;

    const rawSerialsVal = currentRow[colKey] || currentRow.equipmentSerials || currentRow.serialNumbers || currentRow.serialNumber;
    const currentSerials = parseSerialEntries(rawSerialsVal);
    if (currentSerials.length <= 1) return;

    const updatedSerials = currentSerials.filter((_, idx) => idx !== serialIndex);
    const serialStrings = updatedSerials.map((s) => s.serialNumber).filter((s) => s.trim().length > 0);
    const commaJoined = serialStrings.join(", ");
    const jsonSerialized = JSON.stringify(updatedSerials);

    const updated = rows.map((r, idx) => {
      if (idx === rowIndex) {
        return {
          ...r,
          [colKey]: jsonSerialized,
          equipmentSerials: jsonSerialized,
          serialNumbers: jsonSerialized,
          serialNumber: commaJoined || (updatedSerials[0]?.serialNumber ?? ""),
        };
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

  const isDeviceTable = resolvedColumns.some((c) => c.type === "serials" || c.key === "deviceType");
  const cleanLabel = label.replace(/Details|Particulars|Information|Technical/gi, "").trim() || "Item";
  const btnLabel = addButtonLabel || (isDeviceTable ? "Add Another Equipment Device Group" : `Add ${cleanLabel}`);

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
        <Text style={styles.rowCountBadge}>
          {rows.length} {rows.length === 1 ? (isDeviceTable ? "device group" : "entry") : (isDeviceTable ? "device groups" : "entries")}
        </Text>
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
                  <Text style={styles.rowNumberText}>
                    {isDeviceTable ? `Device Group #${rowIndex + 1}` : `#${rowIndex + 1}`}
                  </Text>
                </View>
                {rows.length > minRows && (
                  <TouchableOpacity
                    onPress={() => handleRemoveRow(rowIndex)}
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

              <FormGrid>
                {resolvedColumns.map((col) => {
                  const cellVal = rowItem[col.key] ?? "";
                  const isSerials = col.type === "serials";
                  const isSelect = col.type === "select";
                  const isDate = col.type === "date";
                  const isNumber = col.type === "number";

                  if (isSerials) {
                    const serialsList = parseSerialEntries(
                      rowItem[col.key] || rowItem.equipmentSerials || rowItem.serialNumbers || rowItem.serialNumber
                    );

                    return (
                      <FormCol key={`${rowId}-${col.key}`} span={12}>
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
                                    onChangeText={(text) => handleSerialEntryChange(rowIndex, col.key, sIdx, text)}
                                    style={{ marginBottom: 0 }}
                                  />
                                </View>
                                {serialsList.length > 1 && (
                                  <TouchableOpacity
                                    onPress={() => handleRemoveSerialEntry(rowIndex, col.key, sIdx)}
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
                            onPress={() => handleAddSerialEntry(rowIndex, col.key)}
                            style={styles.addSerialBtn}
                            activeOpacity={0.7}
                          >
                            <Icon name="plus" size={13} color="#1D4ED8" />
                            <Text style={styles.addSerialBtnText}>Add Serial Number</Text>
                          </TouchableOpacity>
                        </View>
                      </FormCol>
                    );
                  }

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
  serialsWrapper: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  serialsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  serialsLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    fontWeight: "700",
    color: "#334155",
  },
  serialsBadge: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10.5,
    fontWeight: "600",
    color: "#1E40AF",
    backgroundColor: "#DBEAFE",
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  serialsInstruction: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#64748B",
    marginBottom: 8,
  },
  serialsList: {
    gap: 6,
  },
  serialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  serialInputWrapper: {
    flex: 1,
  },
  serialDeleteBtn: {
    width: 32,
    height: 38,
    borderRadius: 6,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
  },
  addSerialBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  addSerialBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#1D4ED8",
  },
});
