import { FieldType, FormField, FormSchema } from './types';

const STORAGE_KEY = 'edge_form_builder_forms';

export function generateId(): string {
  return crypto.randomUUID();
}

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
    'section-header': '📌',
    divider: '➖',
  };
  return icons[type];
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
    'section-header': 'Section Header',
    divider: 'Divider',
  };
  return labels[type];
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

export function saveForms(forms: FormSchema[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
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
