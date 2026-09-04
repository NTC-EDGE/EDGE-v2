export interface FormRepeaterColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "date" | "serials" | "equipments";
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
}

export interface DeviceSerialEntry {
  id: string;
  serialNumber: string;
}

export interface EquipmentUnitEntry {
  id: string;
  serialNumber: string;
  frequency: string;
  callSign?: string;
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
  parentMakeTypeModel?: string;
  showCallSign?: boolean;
  hideAddButton?: boolean;
}
