import { useState, useEffect, useRef } from "react";
import { FormRepeaterColumn, DeviceSerialEntry, EquipmentUnitEntry } from "./formRepeaterTypes";
import {
  parseInitialRows,
  parseSerialEntries,
  parseEquipmentEntries,
  createEmptyRow,
} from "./formRepeaterUtils";

interface UseFormRepeaterProps {
  value?: string;
  resolvedColumns: FormRepeaterColumn[];
  parentMakeTypeModel?: string;
  minRows?: number;
  maxRows?: number;
  onChange: (value: string) => void;
}

export function useFormRepeater({
  value = "",
  resolvedColumns,
  parentMakeTypeModel,
  minRows = 1,
  maxRows = 20,
  onChange,
}: UseFormRepeaterProps) {
  const [rows, setRows] = useState<Array<Record<string, string>>>(() => {
    const initial = parseInitialRows(value, resolvedColumns);
    if (parentMakeTypeModel && parentMakeTypeModel.trim() !== "") {
      const trimmed = parentMakeTypeModel.trim();
      return initial.map((r) => ({
        ...r,
        makeTypeModel: trimmed,
        nameTypeModel: trimmed,
        make: trimmed,
        typeModel: trimmed,
      }));
    }
    return initial;
  });

  const lastEmittedRef = useRef<string>(value);

  useEffect(() => {
    if (value !== lastEmittedRef.current && value !== "") {
      const parsed = parseInitialRows(value, resolvedColumns);
      const enriched = (parentMakeTypeModel && parentMakeTypeModel.trim() !== "")
        ? parsed.map((r) => ({
            ...r,
            makeTypeModel: parentMakeTypeModel.trim(),
            nameTypeModel: parentMakeTypeModel.trim(),
            make: parentMakeTypeModel.trim(),
            typeModel: parentMakeTypeModel.trim(),
          }))
        : parsed;
      setRows(enriched);
      lastEmittedRef.current = value;
    }
  }, [value, resolvedColumns, parentMakeTypeModel]);

  useEffect(() => {
    if (parentMakeTypeModel && parentMakeTypeModel.trim() !== "") {
      const trimmed = parentMakeTypeModel.trim();
      setRows((prevRows) => {
        let hasChanges = false;
        const updated = prevRows.map((r) => {
          if (r.makeTypeModel !== trimmed) {
            hasChanges = true;
            return {
              ...r,
              makeTypeModel: trimmed,
              nameTypeModel: trimmed,
              make: trimmed,
              typeModel: trimmed,
            };
          }
          return r;
        });
        if (hasChanges) {
          const serialized = JSON.stringify(updated);
          lastEmittedRef.current = serialized;
          onChange(serialized);
        }
        return hasChanges ? updated : prevRows;
      });
    }
  }, [parentMakeTypeModel, onChange]);

  const emitChange = (updatedRows: Array<Record<string, string>>) => {
    const enrichedRows = updatedRows.map((r) => {
      const copy = { ...r };
      if (parentMakeTypeModel && parentMakeTypeModel.trim() !== "") {
        const trimmed = parentMakeTypeModel.trim();
        copy.makeTypeModel = trimmed;
        copy.nameTypeModel = trimmed;
        copy.make = trimmed;
        copy.typeModel = trimmed;
      }
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
    const updatedSerials = currentSerials.map((s, idx) => idx === serialIndex ? { ...s, serialNumber: text } : s);
    const serialStrings = updatedSerials.map((s) => s.serialNumber).filter((s) => s.trim().length > 0);
    const commaJoined = serialStrings.join(", ");
    const jsonSerialized = JSON.stringify(updatedSerials);

    const updated = rows.map((r, idx) => idx === rowIndex ? {
      ...r,
      [colKey]: jsonSerialized,
      equipmentSerials: jsonSerialized,
      serialNumbers: jsonSerialized,
      serialNumber: commaJoined || (updatedSerials[0]?.serialNumber ?? ""),
    } : r);
    emitChange(updated);
  };

  const handleAddSerialEntry = (rowIndex: number, colKey: string) => {
    const currentRow = rows[rowIndex];
    if (currentRow === undefined) return;
    const rawSerialsVal = currentRow[colKey] || currentRow.equipmentSerials || currentRow.serialNumbers || currentRow.serialNumber;
    const currentSerials = parseSerialEntries(rawSerialsVal);
    const updatedSerials = [...currentSerials, { id: `serial-${Date.now()}-${currentSerials.length}`, serialNumber: "" }];
    const jsonSerialized = JSON.stringify(updatedSerials);

    const updated = rows.map((r, idx) => idx === rowIndex ? {
      ...r,
      [colKey]: jsonSerialized,
      equipmentSerials: jsonSerialized,
      serialNumbers: jsonSerialized,
    } : r);
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

    const updated = rows.map((r, idx) => idx === rowIndex ? {
      ...r,
      [colKey]: jsonSerialized,
      equipmentSerials: jsonSerialized,
      serialNumbers: jsonSerialized,
      serialNumber: commaJoined || (updatedSerials[0]?.serialNumber ?? ""),
    } : r);
    emitChange(updated);
  };

  const handleEquipmentUnitChange = (
    rowIndex: number,
    colKey: string,
    unitIndex: number,
    field: "serialNumber" | "frequency",
    text: string
  ) => {
    const currentRow = rows[rowIndex];
    if (currentRow === undefined) return;
    const rawEquipmentsVal = currentRow[colKey] || currentRow.equipments;
    const currentUnits = parseEquipmentEntries(rawEquipmentsVal);
    const updatedUnits = currentUnits.map((u, idx) => idx === unitIndex ? { ...u, [field]: text } : u);
    const serialStrings = updatedUnits.map((s) => s.serialNumber).filter((s) => s.trim().length > 0);
    const freqStrings = updatedUnits.map((s) => s.frequency).filter((s) => s.trim().length > 0);
    const jsonSerialized = JSON.stringify(updatedUnits);

    const updated = rows.map((r, idx) => idx === rowIndex ? {
      ...r,
      [colKey]: jsonSerialized,
      equipments: jsonSerialized,
      serialNumber: serialStrings.join(", ") || (updatedUnits[0]?.serialNumber ?? ""),
      frequency: freqStrings.join(", ") || (updatedUnits[0]?.frequency ?? ""),
      frequencyRange: freqStrings.join(", ") || (updatedUnits[0]?.frequency ?? ""),
    } : r);
    emitChange(updated);
  };

  const handleAddEquipmentUnit = (rowIndex: number, colKey: string) => {
    const currentRow = rows[rowIndex];
    if (currentRow === undefined) return;
    const rawEquipmentsVal = currentRow[colKey] || currentRow.equipments;
    const currentUnits = parseEquipmentEntries(rawEquipmentsVal);
    const newUnit: EquipmentUnitEntry = {
      id: `eq-${Date.now()}-${currentUnits.length}`,
      serialNumber: "",
      frequency: currentUnits[0]?.frequency || "",
    };
    const updatedUnits = [...currentUnits, newUnit];
    const jsonSerialized = JSON.stringify(updatedUnits);

    const updated = rows.map((r, idx) => idx === rowIndex ? {
      ...r,
      [colKey]: jsonSerialized,
      equipments: jsonSerialized,
    } : r);
    emitChange(updated);
  };

  const handleRemoveEquipmentUnit = (rowIndex: number, colKey: string, unitIndex: number) => {
    const currentRow = rows[rowIndex];
    if (currentRow === undefined) return;
    const rawEquipmentsVal = currentRow[colKey] || currentRow.equipments;
    const currentUnits = parseEquipmentEntries(rawEquipmentsVal);
    if (currentUnits.length <= 1) return;

    const updatedUnits = currentUnits.filter((_, idx) => idx !== unitIndex);
    const serialStrings = updatedUnits.map((s) => s.serialNumber).filter((s) => s.trim().length > 0);
    const freqStrings = updatedUnits.map((s) => s.frequency).filter((s) => s.trim().length > 0);
    const jsonSerialized = JSON.stringify(updatedUnits);

    const updated = rows.map((r, idx) => idx === rowIndex ? {
      ...r,
      [colKey]: jsonSerialized,
      equipments: jsonSerialized,
      serialNumber: serialStrings.join(", ") || (updatedUnits[0]?.serialNumber ?? ""),
      frequency: freqStrings.join(", ") || (updatedUnits[0]?.frequency ?? ""),
      frequencyRange: freqStrings.join(", ") || (updatedUnits[0]?.frequency ?? ""),
    } : r);
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

  return {
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
  };
}
