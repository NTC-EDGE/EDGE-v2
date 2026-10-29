import { FieldType, FormField, FormSchema } from "../types";
import { DEFAULT_EQUIPMENT_COLUMNS } from "./repeaterPresets";

export function generateId(): string {
  return crypto.randomUUID();
}

export function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

export function isFormSchema(val: unknown): val is FormSchema {
  return (
    isRecord(val) &&
    typeof val["id"] === "string" &&
    typeof val["name"] === "string" &&
    Array.isArray(val["fields"])
  );
}

export function getFieldIcon(type: FieldType): string {
  const icons: Record<FieldType, string> = {
    text: "✏️",
    textarea: "📝",
    number: "🔢",
    email: "📧",
    phone: "📱",
    date: "📅",
    time: "⏰",
    select: "📋",
    radio: "🔘",
    checkbox: "☑️",
    file: "📎",
    repeater: "📊",
    "section-header": "📌",
    divider: "➖",
  };
  return icons[type] ?? "✏️";
}

export function getFieldLabel(type: FieldType): string {
  const labels: Record<FieldType, string> = {
    text: "Text Input",
    textarea: "Text Area",
    number: "Number",
    email: "Email",
    phone: "Phone",
    date: "Date Picker",
    time: "Time Picker",
    select: "Dropdown",
    radio: "Radio Group",
    checkbox: "Checkbox Group",
    file: "File Upload",
    repeater: "Equipment / Repeatable Table",
    "section-header": "Section Header",
    divider: "Divider",
  };
  return labels[type] ?? "Field";
}

export function createDefaultField(type: FieldType): FormField {
  const base: FormField = {
    id: generateId(),
    type,
    label: getFieldLabel(type),
    required: false,
    cols: 2,
  };

  if (type === "text" || type === "email" || type === "phone") {
    return { ...base, placeholder: `Enter ${getFieldLabel(type).toLowerCase()}...` };
  }
  if (type === "time") {
    return { ...base, placeholder: "HH:MM AM/PM", cols: 1 };
  }
  if (type === "textarea") {
    return { ...base, placeholder: "Enter your text here..." };
  }
  if (type === "number") {
    return { ...base, placeholder: "0" };
  }
  if (type === "select" || type === "radio" || type === "checkbox") {
    return {
      ...base,
      options: [
        { id: generateId(), label: "Option 1", value: "option_1" },
        { id: generateId(), label: "Option 2", value: "option_2" },
      ],
    };
  }
  if (type === "repeater") {
    return {
      ...base,
      label: "Equipment Inventory / Specifications",
      helpText: "List all radio equipment units included in this application.",
      addButtonLabel: "Add Equipment",
      repeaterColumns: [...DEFAULT_EQUIPMENT_COLUMNS],
      minRows: 1,
      cols: 2,
    };
  }
  if (type === "section-header") {
    return { ...base, label: "Section Title", sectionTitle: "Section Title", cols: 2 };
  }
  if (type === "divider") {
    return { ...base, cols: 2 };
  }
  return base;
}

export function normalizeFieldType(type: string): FieldType {
  const lower = type.toLowerCase().trim();
  if (lower === "dropdown" || lower === "select" || lower.includes("select") || lower.includes("dropdown")) return "select";
  if (lower === "textarea" || lower === "text-area" || lower.includes("textarea")) return "textarea";
  if (lower === "number") return "number";
  if (lower === "email") return "email";
  if (lower === "phone" || lower === "tel") return "phone";
  if (lower === "date") return "date";
  if (lower === "time") return "time";
  if (lower === "radio" || lower.includes("radio")) return "radio";
  if (lower === "checkbox" || lower === "checkbox_group" || lower === "checkboxgroup" || lower.includes("checkbox")) return "checkbox";
  if (lower === "file" || lower === "signature") return "file";
  if (lower === "repeater" || lower === "table" || lower === "equipment-table" || lower === "repeatable") return "repeater";
  if (lower === "section-header" || lower === "section") return "section-header";
  if (lower === "divider") return "divider";
  return "text";
}
