export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'repeater'
  | 'section-header'
  | 'divider';

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export interface RepeaterColumn {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: FieldOption[];
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  acceptedFileTypes?: string;
  maxFileSizeMb?: number;
  cols?: 1 | 2;
  sectionTitle?: string;
  // Repeatable table / equipment inventory properties
  repeaterColumns?: RepeaterColumn[];
  minRows?: number;
  maxRows?: number;
  addButtonLabel?: string;
}

export interface FormSchema {
  id: string;
  serviceId?: string;
  serviceName?: string;
  serviceCode?: string;
  name: string;
  description: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  tags?: string[];
}
