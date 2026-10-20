import { FormRepeaterColumn, DeviceSerialEntry, EquipmentUnitEntry } from "./formRepeaterTypes";
import { DEFAULT_EQUIPMENT_REPEATER_COLUMNS } from "./formRepeaterColumns";

export function isRecord(value: unknown): value is Record<string, unknown> {
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

export function parseEquipmentEntries(val: unknown): EquipmentUnitEntry[] {
  if (Array.isArray(val)) {
    const entries: EquipmentUnitEntry[] = [];
    val.forEach((item, idx) => {
      if (isRecord(item)) {
        const idVal = typeof item.id === "string" && item.id.length > 0 ? item.id : `eq-${idx}-${Date.now()}`;
        const serialVal = typeof item.serialNumber === "string" ? item.serialNumber : typeof item.serial === "string" ? item.serial : "";
        const freqVal = typeof item.frequency === "string" ? item.frequency : typeof item.frequencyRange === "string" ? item.frequencyRange : "";
        const callSignVal = typeof item.callSign === "string" ? item.callSign : typeof item.callsign === "string" ? item.callsign : "";
        entries.push({ id: idVal, serialNumber: serialVal, frequency: freqVal, callSign: callSignVal });
      } else if (typeof item === "string" && item.trim() !== "") {
        entries.push({ id: `eq-${idx}-${Date.now()}`, serialNumber: item.trim(), frequency: "", callSign: "" });
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
          return parseEquipmentEntries(parsed);
        }
      } catch {
        // Fallback
      }
    }
  }

  return [{ id: `eq-1`, serialNumber: "", frequency: "", callSign: "" }];
}

export function createEmptyRow(cols: FormRepeaterColumn[]): Record<string, string> {
  const row: Record<string, string> = { _id: String(Date.now() + Math.random()) };
  cols.forEach((col) => {
    if (col.type === "serials" || col.key === "equipmentSerials") {
      row[col.key] = JSON.stringify([{ id: `serial-${Date.now()}`, serialNumber: "" }]);
      row["typeOfEquipmentDevice"] = "Wireless Data Network (WDN) - Indoor";
      row["nameTypeModel"] = "";
      row["serialNumber"] = "";
    } else if (col.type === "equipments" || col.key === "equipments") {
      row[col.key] = JSON.stringify([{ id: `eq-1`, serialNumber: "", frequency: "" }]);
      row["makeTypeModel"] = "";
      row["serialNumber"] = "";
      row["frequency"] = "";
    } else {
      row[col.key] = "";
    }
  });
  return row;
}

export function parseInitialRows(value?: string, cols?: FormRepeaterColumn[]): Array<Record<string, string>> {
  const activeCols = cols || DEFAULT_EQUIPMENT_REPEATER_COLUMNS;
  const isEquipments = activeCols.some((c) => c.type === "equipments" || c.key === "equipments");

  if (!value || value.trim() === "") {
    return [createEmptyRow(activeCols)];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const sourceList = isEquipments ? [parsed[0]] : parsed;
      return sourceList.map((item) => {
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

          if (!rowRecord.equipmentSerials && activeCols.some((c) => c.type === "serials" || c.key === "equipmentSerials")) {
            const fallbackSerials = rowRecord.serialNumbers || rowRecord.serialNumber || rowRecord.serials;
            if (fallbackSerials) {
              const entries = parseSerialEntries(fallbackSerials);
              rowRecord.equipmentSerials = JSON.stringify(entries);
            }
          }

          if (isEquipments && !rowRecord.equipments) {
            const fallbackEq = rowRecord.serialNumber || rowRecord.frequency || rowRecord.frequencyRange;
            if (fallbackEq) {
              const entries = parseEquipmentEntries([
                {
                  id: `eq-1`,
                  serialNumber: rowRecord.serialNumber || "",
                  frequency: rowRecord.frequency || rowRecord.frequencyRange || "",
                },
              ]);
              rowRecord.equipments = JSON.stringify(entries);
            } else {
              rowRecord.equipments = JSON.stringify([{ id: `eq-1`, serialNumber: "", frequency: "" }]);
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
    const defaultColKey = (activeCols && activeCols[0]?.key) || "item";
    const fallbackRow: Record<string, string> = {
      [defaultColKey]: value,
      _id: String(Date.now() + Math.random()),
    };
    if (isEquipments) {
      fallbackRow.equipments = JSON.stringify([{ id: `eq-1`, serialNumber: "", frequency: "" }]);
    }
    return [fallbackRow];
  }

  return [createEmptyRow(activeCols)];
}
