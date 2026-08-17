import { useSyncExternalStore } from 'react';
import { FieldType, FormField, FormSchema, RepeaterColumn } from './types';

const STORAGE_KEY = 'edge_form_builder_forms';

export function generateId(): string {
  return crypto.randomUUID();
}

export const DEFAULT_EQUIPMENT_COLUMNS: RepeaterColumn[] = [
  { id: 'col-1', key: 'equipmentType', label: 'Equipment Type', type: 'text', placeholder: 'e.g. Transmitter / Transceiver', required: true },
  { id: 'col-2', key: 'make', label: 'Make / Brand', type: 'text', placeholder: 'e.g. Motorola, Icom', required: true },
  { id: 'col-3', key: 'model', label: 'Model No.', type: 'text', placeholder: 'e.g. IC-7300', required: true },
  { id: 'col-4', key: 'serialNumber', label: 'Serial Number', type: 'text', placeholder: 'e.g. SN-12345678', required: true },
  { id: 'col-5', key: 'powerOutput', label: 'Power (Watts)', type: 'number', placeholder: 'e.g. 50', required: false },
  { id: 'col-6', key: 'frequency', label: 'Frequency (MHz)', type: 'text', placeholder: 'e.g. 144-148 MHz', required: false },
];

export function getFieldIcon(type: FieldType): string {
  const icons: Record<FieldType, string> = {
    text: '✏️',
    textarea: '📝',
    number: '🔢',
    email: '📧',
    phone: '📱',
    date: '📅',
    select: '📋',
    radio: '🔘',
    checkbox: '☑️',
    file: '📎',
    repeater: '📊',
    'section-header': '📌',
    divider: '➖',
  };
  return icons[type] ?? '✏️';
}

export function getFieldLabel(type: FieldType): string {
  const labels: Record<FieldType, string> = {
    text: 'Text Input',
    textarea: 'Text Area',
    number: 'Number',
    email: 'Email',
    phone: 'Phone',
    date: 'Date Picker',
    select: 'Dropdown',
    radio: 'Radio Group',
    checkbox: 'Checkbox Group',
    file: 'File Upload',
    repeater: 'Equipment / Repeatable Table',
    'section-header': 'Section Header',
    divider: 'Divider',
  };
  return labels[type] ?? 'Field';
}

export function createDefaultField(type: FieldType): FormField {
  const base: FormField = {
    id: generateId(),
    type,
    label: getFieldLabel(type),
    required: false,
    cols: 2,
  };

  if (type === 'text' || type === 'email' || type === 'phone') {
    return { ...base, placeholder: `Enter ${getFieldLabel(type).toLowerCase()}...` };
  }
  if (type === 'textarea') {
    return { ...base, placeholder: 'Enter your text here...' };
  }
  if (type === 'number') {
    return { ...base, placeholder: '0' };
  }
  if (type === 'select' || type === 'radio' || type === 'checkbox') {
    return {
      ...base,
      options: [
        { id: generateId(), label: 'Option 1', value: 'option_1' },
        { id: generateId(), label: 'Option 2', value: 'option_2' },
      ],
    };
  }
  if (type === 'repeater') {
    return {
      ...base,
      label: 'Equipment Inventory / Specifications',
      helpText: 'List all radio equipment units included in this application.',
      addButtonLabel: 'Add Equipment',
      repeaterColumns: [...DEFAULT_EQUIPMENT_COLUMNS],
      minRows: 1,
      cols: 2,
    };
  }
  if (type === 'section-header') {
    return { ...base, sectionTitle: 'Section Title', cols: 2 };
  }
  if (type === 'divider') {
    return { ...base, cols: 2 };
  }
  return base;
}

export function loadForms(): FormSchema[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as FormSchema[];
    }
    return [];
  } catch {
    return [];
  }
}

const FORM_STORAGE_EVENT = 'edge_form_storage_change';

export function notifyFormStorageChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(FORM_STORAGE_EVENT));
  }
}

export function saveForms(forms: FormSchema[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
  notifyFormStorageChange();
}

export function saveFormSchema(form: FormSchema): void {
  const forms = loadForms();
  const index = forms.findIndex((f) => f.id === form.id);
  if (index >= 0) {
    forms[index] = form;
  } else {
    forms.unshift(form);
  }
  saveForms(forms);
}

export function deleteFormSchema(id: string): void {
  const forms = loadForms();
  saveForms(forms.filter((f) => f.id !== id));
}

let cachedRaw: string | null = null;
let cachedForms: FormSchema[] = [];

export function getCachedLocalForms(): FormSchema[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      cachedForms = Array.isArray(parsed) ? (parsed as FormSchema[]) : [];
    } catch {
      cachedForms = [];
    }
  }
  return cachedForms;
}

const emptyFormsSnapshot: FormSchema[] = [];

export function useLocalForms(): FormSchema[] {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(FORM_STORAGE_EVENT, onStoreChange);
      window.addEventListener('storage', onStoreChange);
      return () => {
        window.removeEventListener(FORM_STORAGE_EVENT, onStoreChange);
        window.removeEventListener('storage', onStoreChange);
      };
    },
    getCachedLocalForms,
    () => emptyFormsSnapshot
  );
}

export function normalizeFieldType(type: string): FieldType {
  const lower = type.toLowerCase();
  if (lower === 'dropdown' || lower === 'select') return 'select';
  if (lower === 'textarea' || lower === 'text-area') return 'textarea';
  if (lower === 'number') return 'number';
  if (lower === 'email') return 'email';
  if (lower === 'phone' || lower === 'tel') return 'phone';
  if (lower === 'date') return 'date';
  if (lower === 'radio') return 'radio';
  if (lower === 'checkbox') return 'checkbox';
  if (lower === 'file' || lower === 'signature') return 'file';
  if (lower === 'repeater' || lower === 'table' || lower === 'equipment-table' || lower === 'repeatable') return 'repeater';
  if (lower === 'section-header' || lower === 'section') return 'section-header';
  if (lower === 'divider') return 'divider';
  return 'text';
}

export interface BackendFormDtoLike {
  formId?: string;
  id?: string;
  serviceId?: string;
  version?: string;
  serviceName?: string;
  serviceCode?: string;
  name?: string;
  sections?: Array<{
    key?: string;
    title?: string;
    required?: boolean;
    orderIndex?: number;
    fields?: Array<{
      fieldId?: string;
      label?: string;
      type?: string;
      isRequired?: boolean;
      orderIndex?: number;
      validationRules?: string;
      visibilityCondition?: string;
    }>;
  }>;
}

export function convertBackendFormToSchema(dto: BackendFormDtoLike): FormSchema {
  const formId = dto.formId ?? dto.id ?? generateId();
  const fields: FormField[] = [];
  const seenIds = new Set<string>();

  if (Array.isArray(dto.sections)) {
    for (const section of dto.sections) {
      if (section.title) {
        const rawSecKey = section.key || generateId();
        let secId = `sec-${rawSecKey}`;
        if (seenIds.has(secId)) {
          secId = `sec-${rawSecKey}-${generateId().slice(0, 6)}`;
        }
        seenIds.add(secId);

        fields.push({
          id: secId,
          type: 'section-header',
          label: section.title,
          sectionTitle: section.title,
          required: false,
          cols: 2,
        });
      }
      if (Array.isArray(section.fields)) {
        for (const f of section.fields) {
          const normType = normalizeFieldType(f.type ?? 'text');
          let parsedRules: Record<string, unknown> = {};
          if (f.validationRules) {
            try {
              parsedRules = JSON.parse(f.validationRules) as Record<string, unknown>;
            } catch {
              parsedRules = {};
            }
          }

          const rawId = f.fieldId || generateId();
          let uniqueId = rawId;
          if (seenIds.has(uniqueId)) {
            uniqueId = generateId();
          }
          seenIds.add(uniqueId);

          fields.push({
            id: uniqueId,
            type: normType,
            label: f.label ?? 'Untitled Field',
            required: Boolean(f.isRequired),
            cols: (parsedRules.cols === 1 ? 1 : 2) as 1 | 2,
            placeholder: typeof parsedRules.placeholder === 'string' ? parsedRules.placeholder : undefined,
            helpText: typeof parsedRules.helpText === 'string' ? parsedRules.helpText : undefined,
            minLength: typeof parsedRules.minLength === 'number' ? parsedRules.minLength : undefined,
            maxLength: typeof parsedRules.maxLength === 'number' ? parsedRules.maxLength : undefined,
            min: typeof parsedRules.min === 'number' ? parsedRules.min : undefined,
            max: typeof parsedRules.max === 'number' ? parsedRules.max : undefined,
            acceptedFileTypes: typeof parsedRules.acceptedFileTypes === 'string' ? parsedRules.acceptedFileTypes : undefined,
            maxFileSizeMb: typeof parsedRules.maxFileSizeMb === 'number' ? parsedRules.maxFileSizeMb : undefined,
            options: Array.isArray(parsedRules.options) ? (parsedRules.options as FormField['options']) : undefined,
            repeaterColumns: Array.isArray(parsedRules.repeaterColumns)
              ? (parsedRules.repeaterColumns as RepeaterColumn[])
              : normType === 'repeater'
              ? [...DEFAULT_EQUIPMENT_COLUMNS]
              : undefined,
            minRows: typeof parsedRules.minRows === 'number' ? parsedRules.minRows : undefined,
            maxRows: typeof parsedRules.maxRows === 'number' ? parsedRules.maxRows : undefined,
            addButtonLabel: typeof parsedRules.addButtonLabel === 'string' ? parsedRules.addButtonLabel : 'Add Equipment',
          });
        }
      }
    }
  }

  return {
    id: formId,
    serviceId: dto.serviceId,
    serviceName: dto.serviceName,
    serviceCode: dto.serviceCode,
    name: dto.name ?? (dto.serviceName ? `${dto.serviceName} Form` : `Service Form (v${dto.version ?? '1.0'})`),
    description: dto.serviceName
      ? `Form template for ${dto.serviceName} (v${dto.version ?? '1.0'})`
      : `Dynamic form schema version ${dto.version ?? '1.0'}`,
    fields,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
  };
}

export function convertSchemaToBackendSections(fields: FormField[]) {
  const sections: Array<{
    key: string;
    title: string;
    required: boolean;
    orderIndex: number;
    fields: Array<{
      fieldId: string;
      label: string;
      type: string;
      isRequired: boolean;
      orderIndex: number;
      validationRules?: string;
      visibilityCondition?: string;
    }>;
  }> = [];

  let currentSection = {
    key: 'general',
    title: 'General Information',
    required: true,
    orderIndex: 0,
    fields: [] as Array<{
      fieldId: string;
      label: string;
      type: string;
      isRequired: boolean;
      orderIndex: number;
      validationRules?: string;
      visibilityCondition?: string;
    }>,
  };

  let sectionIndex = 0;
  let fieldIndex = 0;

  for (const field of fields) {
    if (field.type === 'section-header') {
      if (currentSection.fields.length > 0) {
        sections.push(currentSection);
        sectionIndex++;
      }
      const title = field.sectionTitle || field.label || `Section ${sectionIndex + 1}`;
      const key =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `section-${sectionIndex}`;
      currentSection = {
        key,
        title,
        required: true,
        orderIndex: sectionIndex,
        fields: [],
      };
      fieldIndex = 0;
      continue;
    }

    if (field.type === 'divider') {
      continue;
    }

    const fieldDto = {
      fieldId: field.id,
      label: field.label || 'Untitled Field',
      type: field.type,
      isRequired: Boolean(field.required),
      orderIndex: fieldIndex++,
      validationRules: JSON.stringify({
        placeholder: field.placeholder,
        helpText: field.helpText,
        minLength: field.minLength,
        maxLength: field.maxLength,
        min: field.min,
        max: field.max,
        acceptedFileTypes: field.acceptedFileTypes,
        maxFileSizeMb: field.maxFileSizeMb,
        options: field.options,
        cols: field.cols,
        repeaterColumns: field.repeaterColumns,
        minRows: field.minRows,
        maxRows: field.maxRows,
        addButtonLabel: field.addButtonLabel,
      }),
    };

    currentSection.fields.push(fieldDto);
  }

  if (currentSection.fields.length > 0 || sections.length === 0) {
    sections.push(currentSection);
  }

  return sections;
}
