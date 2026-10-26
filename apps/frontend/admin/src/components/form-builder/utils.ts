import { useSyncExternalStore } from 'react';
import { FieldCondition, FieldOption, FieldType, FormField, FormSchema, FormVersionSummary, RepeaterColumn } from './types';

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

export const DEFAULT_REQUEST_DEVICE_COLUMNS: RepeaterColumn[] = [
  { id: 'col-1', key: 'make_model_type', label: 'Make / Type / Model', type: 'text', placeholder: 'e.g. Apple iPhone 15 Pro / Samsung Galaxy S24', required: true },
  { id: 'col-2', key: 'imei_number', label: 'IMEI Number (15 Digits)', type: 'number', placeholder: 'e.g. 356789012345678', required: true },
];

export const DEFAULT_REQUEST_SIM_COLUMNS: RepeaterColumn[] = [
  { id: 'col-1', key: 'mobile_number', label: 'Mobile Number', type: 'text', placeholder: '09XXXXXXXXX or +639XXXXXXXXX', required: true },
  {
    id: 'col-2',
    key: 'telco_provider',
    label: 'Network / Telco Provider',
    type: 'select',
    required: false,
    options: [
      { id: 'opt-1', label: 'Smart / TNT', value: 'Smart / TNT' },
      { id: 'opt-2', label: 'Globe / TM', value: 'Globe / TM' },
      { id: 'opt-3', label: 'DITO', value: 'DITO' },
      { id: 'opt-4', label: 'Others', value: 'Others' },
    ],
  },
];

export const DEFAULT_COMPLAINT_ATTACHMENT_COLUMNS: RepeaterColumn[] = [
  { id: 'col-1', key: 'document_description', label: 'Document Description', type: 'text', placeholder: 'e.g. Screenshot of Spam / Billing Statement / Official Receipt', required: true },
  { id: 'col-2', key: 'attachment_file', label: 'Attached Document / File', type: 'file', placeholder: 'Upload file', required: true },
];

export const DEFAULT_STATION_PARTICULARS_COLUMNS: RepeaterColumn[] = [
  {
    id: 'col-1',
    key: 'stationClass',
    label: 'Station Class',
    type: 'select',
    required: true,
    options: [
      { id: 'sc-1', label: 'RT', value: 'RT' },
      { id: 'sc-2', label: 'FX', value: 'FX' },
      { id: 'sc-3', label: 'FB', value: 'FB' },
      { id: 'sc-4', label: 'FX/FB', value: 'FX/FB' },
      { id: 'sc-5', label: 'ML', value: 'ML' },
      { id: 'sc-6', label: 'P', value: 'P' },
      { id: 'sc-7', label: 'Others', value: 'Others' },
    ],
  },
  { id: 'col-2', key: 'exactLocation', label: 'Exact Location', type: 'text', placeholder: 'Enter Exact Station Location...', required: true },
  { id: 'col-3', key: 'longitude', label: 'Longitude', type: 'text', placeholder: `e.g. 121° 02' 35" E`, required: false },
  { id: 'col-4', key: 'latitude', label: 'Latitude', type: 'text', placeholder: `e.g. 14° 38' 20" N`, required: false },
  { id: 'col-5', key: 'configuration', label: 'Configuration', type: 'text', placeholder: 'e.g. Simplex, Duplex, Repeater', required: false },
  { id: 'col-6', key: 'dataRate', label: 'Data Rate', type: 'text', placeholder: 'e.g. 1200 bps, 9600 bps', required: false },
  { id: 'col-7', key: 'remarks', label: 'Remarks', type: 'text', placeholder: 'e.g. Station remarks', required: false },
  { id: 'col-8', key: 'makeTypeModel', label: 'Particulars of Equipment (Make / Type / Model)', type: 'text', placeholder: 'e.g. ICOM IC-7300 / Kenwood TS-590SG', required: true },
  { id: 'col-9', key: 'equipments', label: 'Equipment Units (Unique Frequency & Serial Number)', type: 'equipments', required: true },
];

export const DEFAULT_DEVICE_REGISTRATION_COLUMNS: RepeaterColumn[] = [
  {
    id: 'col-1',
    key: 'deviceType',
    label: 'Equipment Type',
    type: 'select',
    required: true,
    options: [
      { id: 'dt-1', label: 'Wireless Data Network (WDN) - Indoor', value: 'Wireless Data Network (WDN) - Indoor' },
      { id: 'dt-2', label: 'Short Range Devices (SRD)', value: 'Short Range Devices (SRD)' },
      { id: 'dt-3', label: 'Radio Frequency Identification (RFID) Devices', value: 'Radio Frequency Identification (RFID) Devices' },
      { id: 'dt-4', label: 'Short Range Radio Services (SRRS) Devices', value: 'Short Range Radio Services (SRRS) Devices' },
      { id: 'dt-5', label: 'Public Trunked Radio Equipment (Mobile/Portable)', value: 'Public Trunked Radio Equipment (Mobile/Portable)' },
    ],
  },
  { id: 'col-2', key: 'makeTypeModel', label: 'Make/Type/Model', type: 'text', placeholder: 'e.g. Cisco Catalyst 9120AXI / Zebra FX9600', required: true },
  { id: 'col-3', key: 'serialNumbers', label: 'Serial Number(s)', type: 'serials', placeholder: 'Enter Serial Number', required: true },
];

export const DEFAULT_TVRO_EQUIPMENT_COLUMNS: RepeaterColumn[] = [
  { id: 'col-1', key: 'makeTypeModel', label: 'Make/Type/Model', type: 'text', placeholder: 'e.g. Harmonic ProView 8100', required: true },
  { id: 'col-2', key: 'serialNumbers', label: 'Serial Number(s)', type: 'serials', placeholder: 'Enter Serial Number', required: true },
  { id: 'col-3', key: 'frequencyRange', label: 'Frequency Range', type: 'text', placeholder: 'e.g. 3.4 - 4.2 GHz (C-Band)', required: true },
];

export const DEFAULT_TVRO_ANTENNA_COLUMNS: RepeaterColumn[] = [
  { id: 'col-1', key: 'antennaType', label: 'Type', type: 'text', placeholder: 'e.g. Parabolic Dish', required: true },
  { id: 'col-2', key: 'diameter', label: 'Diameter (m)', type: 'text', placeholder: 'e.g. 3.7m', required: false },
  { id: 'col-3', key: 'gain', label: 'Gain (dBi)', type: 'text', placeholder: 'e.g. 41.5 dBi', required: false },
  { id: 'col-4', key: 'directivity', label: 'Directivity', type: 'text', placeholder: 'e.g. Directional', required: false },
  { id: 'col-5', key: 'heightAboveGround', label: 'Height Above Ground (m)', type: 'text', placeholder: 'e.g. 15m', required: false },
  { id: 'col-6', key: 'azimuthAngle', label: 'Azimuth Angle (deg)', type: 'text', placeholder: 'e.g. 142.5°', required: false },
  { id: 'col-7', key: 'elevationAngle', label: 'Elevation Angle (deg)', type: 'text', placeholder: 'e.g. 58.2°', required: false },
  { id: 'col-8', key: 'polarization', label: 'Polarization', type: 'text', placeholder: 'e.g. Linear (H/V) or Circular', required: false },
  { id: 'col-9', key: 'horBeamwidth', label: 'Hor. Beamwidth', type: 'text', placeholder: 'e.g. 1.4°', required: false },
  { id: 'col-10', key: 'verBeamwidth', label: 'Ver. Beamwidth', type: 'text', placeholder: 'e.g. 1.4°', required: false },
];

export const DEFAULT_TVRO_SIGNAL_COLUMNS: RepeaterColumn[] = [
  { id: 'col-1', key: 'satelliteName', label: 'Name of Satellite', type: 'text', placeholder: 'e.g. Measat-3a / Apstar-7', required: true },
  { id: 'col-2', key: 'orbitalLocation', label: 'Orbital Location (deg)', type: 'text', placeholder: 'e.g. 91.5° E', required: false },
  { id: 'col-3', key: 'transponderNo', label: 'Transponder No.', type: 'text', placeholder: 'e.g. TP-12', required: false },
  { id: 'col-4', key: 'downlinkFreq', label: 'Downlink Freq (MHz)', type: 'text', placeholder: 'e.g. 3960 MHz', required: false },
  { id: 'col-5', key: 'bandwidth', label: 'Bandwidth (MHz)', type: 'text', placeholder: 'e.g. 36 MHz', required: false },
  { id: 'col-6', key: 'polarity', label: 'Polarity', type: 'text', placeholder: 'e.g. Horizontal / Vertical', required: false },
  { id: 'col-7', key: 'symbolRate', label: 'Symbol Rate', type: 'text', placeholder: 'e.g. 27500 Msps', required: false },
  { id: 'col-8', key: 'programName', label: 'Program / Channel Name', type: 'text', placeholder: 'e.g. HBO Asia / CNN International', required: true },
  { id: 'col-9', key: 'programProvider', label: 'Program Provider', type: 'text', placeholder: 'e.g. Warner Bros. Discovery', required: false },
];

export const DEFAULT_OFFICER_REPEATER_COLUMNS: RepeaterColumn[] = [
  { id: 'col-1', key: 'officerName', label: 'Full Name of Officer / Engineer', type: 'text', placeholder: 'e.g. Engr. Juan Dela Cruz', required: true },
  { id: 'col-2', key: 'certificateType', label: 'License / Certificate Type', type: 'text', placeholder: 'e.g. PECE / ECE / 1PHN / GOC', required: true },
  { id: 'col-3', key: 'registrationNo', label: 'PRC / NTC License No.', type: 'text', placeholder: 'e.g. 0012345', required: true },
  { id: 'col-4', key: 'expiryDate', label: 'Validity / Expiry Date', type: 'date', placeholder: 'YYYY-MM-DD', required: false },
];

export function resolveDefaultRepeaterColumns(label?: string, fieldId?: string): RepeaterColumn[] {
  const lbl = (label || '').toLowerCase();
  const fid = (fieldId || '').toLowerCase();
  if (fid.includes('device_particulars') || lbl.includes('device particulars') || lbl.includes('imei') || lbl.includes('handset')) {
    return [...DEFAULT_REQUEST_DEVICE_COLUMNS];
  }
  if (lbl.includes('sim') || fid.includes('sim_mobile_numbers') || lbl.includes('mobile number')) {
    return [...DEFAULT_REQUEST_SIM_COLUMNS];
  }
  if (lbl.includes('proof') || lbl.includes('attachment') || fid.includes('attached_proof_documents')) {
    return [...DEFAULT_COMPLAINT_ATTACHMENT_COLUMNS];
  }
  if (fid === 'particulars' || fid === 'fd000000-0000-0000-0000-000000000340' || lbl === 'particulars') {
    return [...DEFAULT_STATION_PARTICULARS_COLUMNS];
  }
  if (fid.includes('devicesdetails') || lbl.includes('registered devices') || lbl.includes('wdn') || lbl.includes('srd') || lbl.includes('rfid')) {
    return [...DEFAULT_DEVICE_REGISTRATION_COLUMNS];
  }
  if (fid.includes('tvroequipment') || (lbl.includes('particulars of equipment') && fid.includes('223'))) {
    return [...DEFAULT_TVRO_EQUIPMENT_COLUMNS];
  }
  if (fid.includes('tvroantenna') || lbl.includes('antenna')) {
    return [...DEFAULT_TVRO_ANTENNA_COLUMNS];
  }
  if (fid.includes('tvrosignal') || lbl.includes('signal')) {
    return [...DEFAULT_TVRO_SIGNAL_COLUMNS];
  }
  if (fid.includes('officer') || fid.includes('personnel') || lbl.includes('officer') || lbl.includes('personnel')) {
    return [...DEFAULT_OFFICER_REPEATER_COLUMNS];
  }
  return [...DEFAULT_EQUIPMENT_COLUMNS];
}

export function getFieldIcon(type: FieldType): string {
  const icons: Record<FieldType, string> = {
    text: '✏️',
    textarea: '📝',
    number: '🔢',
    email: '📧',
    phone: '📱',
    date: '📅',
    time: '⏰',
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
    time: 'Time Picker',
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
  if (type === 'time') {
    return { ...base, placeholder: 'HH:MM AM/PM', cols: 1 };
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

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export function parseFieldOptions(rawList: unknown): FieldOption[] | undefined {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return undefined;
  }
  const result: FieldOption[] = [];
  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed.length > 0) {
        result.push({
          id: `opt-${i + 1}-${generateId().slice(0, 4)}`,
          label: trimmed,
          value: trimmed,
        });
      }
    } else if (isRecord(item)) {
      const rawLabel = item['label'];
      const rawVal = item['value'];
      const rawId = item['id'];
      const label =
        typeof rawLabel === 'string'
          ? rawLabel
          : typeof rawVal === 'string'
          ? rawVal
          : `Option ${i + 1}`;
      const val = typeof rawVal === 'string' ? rawVal : label;
      const id =
        typeof rawId === 'string' && rawId.length > 0
          ? rawId
          : `opt-${i + 1}-${generateId().slice(0, 4)}`;
      result.push({ id, label, value: val });
    } else if (typeof item === 'number' || typeof item === 'boolean') {
      const str = String(item);
      result.push({
        id: `opt-${i + 1}-${generateId().slice(0, 4)}`,
        label: str,
        value: str,
      });
    }
  }
  return result.length > 0 ? result : undefined;
}

export function parseRepeaterColumns(rawColumns: unknown): RepeaterColumn[] | undefined {
  if (!Array.isArray(rawColumns) || rawColumns.length === 0) {
    return undefined;
  }
  const result: RepeaterColumn[] = [];
  for (let i = 0; i < rawColumns.length; i++) {
    const col = rawColumns[i];
    if (isRecord(col)) {
      const key = typeof col['key'] === 'string' ? col['key'] : `col_${i + 1}`;
      const label = typeof col['label'] === 'string' ? col['label'] : key;
      const rawType = typeof col['type'] === 'string' ? col['type'] : 'text';
      let type: RepeaterColumn['type'] = 'text';
      if (rawType === 'number') type = 'number';
      else if (rawType === 'select' || rawType === 'dropdown') type = 'select';
      else if (rawType === 'date') type = 'date';
      else if (rawType === 'file') type = 'file';
      else if (rawType === 'equipments') type = 'equipments';
      else if (rawType === 'serials') type = 'serials';

      const placeholder = typeof col['placeholder'] === 'string' ? col['placeholder'] : undefined;
      const required = typeof col['required'] === 'boolean' ? col['required'] : false;
      const options = parseFieldOptions(col['options']);
      const id = typeof col['id'] === 'string' && col['id'].length > 0 ? col['id'] : `col-${i + 1}`;

      result.push({
        id,
        key,
        label,
        type,
        placeholder,
        required,
        options,
      });
    }
  }
  return result.length > 0 ? result : undefined;
}

function normalizeDependencyOperator(
  rawOp: unknown
): 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'is_not_empty' {
  if (typeof rawOp !== 'string') return 'equals';
  const op = rawOp.toLowerCase().trim();
  if (op === 'not_equals' || op === 'notequals') return 'not_equals';
  if (op === 'contains') return 'contains';
  if (op === 'is_empty' || op === 'isempty') return 'is_empty';
  if (op === 'is_not_empty' || op === 'notempty') return 'is_not_empty';
  return 'equals';
}

export function parseFieldCondition(val: unknown): FieldCondition | undefined {
  let targetVal: unknown = val;
  if (typeof targetVal === "string") {
    const trimmed = targetVal.trim();
    if (!trimmed.startsWith("{")) return undefined;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (!isRecord(parsed)) return undefined;
      targetVal = parsed;
    } catch {
      return undefined;
    }
  }
  if (!isRecord(targetVal)) return undefined;
  const valRecord = targetVal;

  const serviceCodes = Array.isArray(valRecord['serviceCodes'])
    ? valRecord['serviceCodes'].filter((s): s is string => typeof s === 'string')
    : undefined;
  const services = Array.isArray(valRecord['services'])
    ? valRecord['services'].filter((s): s is string => typeof s === 'string')
    : undefined;

  const appTypesList: string[] = [];
  if (Array.isArray(valRecord['applicationTypes'])) {
    for (const item of valRecord['applicationTypes']) {
      if (typeof item === 'string' && !appTypesList.includes(item)) appTypesList.push(item);
    }
  }
  if (typeof valRecord['variantDescription'] === 'string' && valRecord['variantDescription'].trim().length > 0) {
    if (!appTypesList.includes(valRecord['variantDescription'])) appTypesList.push(valRecord['variantDescription']);
  } else if (Array.isArray(valRecord['variantDescription'])) {
    for (const item of valRecord['variantDescription']) {
      if (typeof item === 'string' && !appTypesList.includes(item)) appTypesList.push(item);
    }
  }

  const variantsList: string[] = [];
  if (Array.isArray(valRecord['variants'])) {
    for (const item of valRecord['variants']) {
      if (typeof item === 'string' && !variantsList.includes(item)) variantsList.push(item);
    }
  }
  if (typeof valRecord['variantType'] === 'string' && valRecord['variantType'].trim().length > 0) {
    if (!variantsList.includes(valRecord['variantType'])) variantsList.push(valRecord['variantType']);
  } else if (Array.isArray(valRecord['variantType'])) {
    for (const item of valRecord['variantType']) {
      if (typeof item === 'string' && !variantsList.includes(item)) variantsList.push(item);
    }
  }

  const elements = Array.isArray(valRecord['elements'])
    ? valRecord['elements'].filter((s): s is string => typeof s === 'string')
    : undefined;

  let applicantTypes: ('individual' | 'company')[] | undefined = undefined;
  if (Array.isArray(valRecord['applicantTypes'])) {
    const filtered = valRecord['applicantTypes'].filter(
      (s): s is 'individual' | 'company' => s === 'individual' || s === 'company'
    );
    if (filtered.length > 0) applicantTypes = filtered;
  } else if (valRecord['applicantType'] === 'individual' || valRecord['applicantType'] === 'company') {
    applicantTypes = [valRecord['applicantType']];
  }

  let fieldDependencies: FieldCondition['fieldDependencies'] = undefined;
  if (Array.isArray(valRecord['fieldDependencies'])) {
    const mapped = valRecord['fieldDependencies']
      .filter(isRecord)
      .map((dep) => ({
        fieldId:
          typeof dep['fieldId'] === 'string'
            ? dep['fieldId']
            : typeof dep['fieldKey'] === 'string'
            ? dep['fieldKey']
            : typeof dep['field'] === 'string'
            ? dep['field']
            : '',
        operator: normalizeDependencyOperator(dep['operator']),
        value: typeof dep['value'] === 'string' ? dep['value'] : undefined,
      }))
      .filter((d) => d.fieldId.length > 0);
    if (mapped.length > 0) fieldDependencies = mapped;
  } else if (valRecord['dependsOn'] !== undefined && valRecord['dependsOn'] !== null) {
    const rawDep = valRecord['dependsOn'];
    const list = Array.isArray(rawDep) ? rawDep : [rawDep];
    const mapped = list
      .filter(isRecord)
      .map((dep) => ({
        fieldId:
          typeof dep['fieldId'] === 'string'
            ? dep['fieldId']
            : typeof dep['fieldKey'] === 'string'
            ? dep['fieldKey']
            : typeof dep['field'] === 'string'
            ? dep['field']
            : '',
        operator: normalizeDependencyOperator(dep['operator']),
        value: typeof dep['value'] === 'string' ? dep['value'] : undefined,
      }))
      .filter((d) => d.fieldId.length > 0);
    if (mapped.length > 0) fieldDependencies = mapped;
  } else if (typeof valRecord['field'] === 'string' && valRecord['field'].trim().length > 0) {
    fieldDependencies = [
      {
        fieldId: valRecord['field'].trim(),
        operator: normalizeDependencyOperator(valRecord['operator']),
        value: typeof valRecord['value'] === 'string' ? valRecord['value'] : undefined,
      },
    ];
  }

  return {
    serviceCodes: serviceCodes && serviceCodes.length > 0 ? serviceCodes : undefined,
    services: services && services.length > 0 ? services : undefined,
    applicationTypes: appTypesList.length > 0 ? appTypesList : undefined,
    variants: variantsList.length > 0 ? variantsList : undefined,
    elements: elements && elements.length > 0 ? elements : undefined,
    applicantTypes,
    fieldDependencies,
  };
}

export function normalizeFieldType(type: string): FieldType {
  const lower = type.toLowerCase().trim();
  if (lower === 'dropdown' || lower === 'select' || lower.includes('select') || lower.includes('dropdown')) return 'select';
  if (lower === 'textarea' || lower === 'text-area' || lower.includes('textarea')) return 'textarea';
  if (lower === 'number') return 'number';
  if (lower === 'email') return 'email';
  if (lower === 'phone' || lower === 'tel') return 'phone';
  if (lower === 'date') return 'date';
  if (lower === 'time') return 'time';
  if (lower === 'radio' || lower.includes('radio')) return 'radio';
  if (lower === 'checkbox' || lower === 'checkbox_group' || lower === 'checkboxgroup' || lower.includes('checkbox')) return 'checkbox';
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
  isActive?: boolean;
  sections?: Array<{
    key?: string;
    title?: string;
    required?: boolean;
    orderIndex?: number;
    visibilityCondition?: string;
    fields?: Array<{
      fieldId?: string;
      label?: string;
      type?: string;
      isRequired?: boolean;
      orderIndex?: number;
      validationRules?: string;
      visibilityCondition?: string;
      options?: unknown[];
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

        let secCondition: FormField['condition'] = undefined;
        if (section.visibilityCondition && section.visibilityCondition.trim().startsWith('{')) {
          try {
            const parsedSecCond: unknown = JSON.parse(section.visibilityCondition);
            secCondition = parseFieldCondition(parsedSecCond);
          } catch {
            // ignore
          }
        }

        fields.push({
          id: secId,
          type: 'section-header',
          label: section.title,
          sectionTitle: section.title,
          sectionKey: section.key,
          required: false,
          cols: 2,
          visibilityCondition: section.visibilityCondition || undefined,
          condition: secCondition,
        });
      }
      if (Array.isArray(section.fields)) {
        for (const f of section.fields) {
          const normType = normalizeFieldType(f.type ?? 'text');
          let parsedRules: Record<string, unknown> = {};
          let rawArrayPayload: unknown[] | null = null;

          if (f.validationRules !== null && f.validationRules !== undefined && typeof f.validationRules === 'string') {
            try {
              const parsed: unknown = JSON.parse(f.validationRules);
              if (Array.isArray(parsed)) {
                rawArrayPayload = parsed;
              } else if (isRecord(parsed)) {
                parsedRules = parsed;
                if (Array.isArray(parsed['options'])) {
                  rawArrayPayload = parsed['options'];
                }
              }
            } catch {
              parsedRules = {};
            }
          }

          if (rawArrayPayload === null && Array.isArray(f.options)) {
            rawArrayPayload = f.options;
          }

          let resolvedOptions: FieldOption[] | undefined = undefined;
          let resolvedRepeaterColumns: RepeaterColumn[] | undefined = undefined;

          if (normType === 'repeater') {
            if (rawArrayPayload !== null && rawArrayPayload.length > 0 && isRecord(rawArrayPayload[0])) {
              resolvedRepeaterColumns = parseRepeaterColumns(rawArrayPayload);
            } else if (Array.isArray(parsedRules['repeaterColumns'])) {
              resolvedRepeaterColumns = parseRepeaterColumns(parsedRules['repeaterColumns']);
            }
            if (resolvedRepeaterColumns === undefined) {
              resolvedRepeaterColumns = resolveDefaultRepeaterColumns(f.label, f.fieldId);
            }
          } else if (normType === 'select' || normType === 'radio' || normType === 'checkbox') {
            resolvedOptions = parseFieldOptions(rawArrayPayload);
          }

          const rawId = f.fieldId || generateId();
          let uniqueId = rawId;
          if (seenIds.has(uniqueId)) {
            uniqueId = generateId();
          }
          seenIds.add(uniqueId);

          const fieldCondition = (() => {
            const parsedCond = parsedRules['condition'];
            if (isRecord(parsedCond)) {
              return parseFieldCondition(parsedCond);
            }
            const visCond = f.visibilityCondition;
            if (typeof visCond === 'string' && visCond.trim().startsWith('{')) {
              try {
                const parsed: unknown = JSON.parse(visCond);
                return parseFieldCondition(parsed);
              } catch {
                // ignore
              }
            }
            return undefined;
          })();

          fields.push({
            id: uniqueId,
            type: normType,
            label: f.label ?? 'Untitled Field',
            required: Boolean(f.isRequired),
            cols: parsedRules['cols'] === 1 ? 1 : 2,
            placeholder: typeof parsedRules['placeholder'] === 'string' ? parsedRules['placeholder'] : undefined,
            helpText: typeof parsedRules['helpText'] === 'string' ? parsedRules['helpText'] : undefined,
            minLength: typeof parsedRules['minLength'] === 'number' ? parsedRules['minLength'] : undefined,
            maxLength: typeof parsedRules['maxLength'] === 'number' ? parsedRules['maxLength'] : undefined,
            min: typeof parsedRules['min'] === 'number' ? parsedRules['min'] : undefined,
            max: typeof parsedRules['max'] === 'number' ? parsedRules['max'] : undefined,
            acceptedFileTypes: typeof parsedRules['acceptedFileTypes'] === 'string' ? parsedRules['acceptedFileTypes'] : undefined,
            maxFileSizeMb: typeof parsedRules['maxFileSizeMb'] === 'number' ? parsedRules['maxFileSizeMb'] : undefined,
            options: resolvedOptions,
            repeaterColumns: resolvedRepeaterColumns,
            minRows: typeof parsedRules['minRows'] === 'number' ? parsedRules['minRows'] : undefined,
            maxRows: typeof parsedRules['maxRows'] === 'number' ? parsedRules['maxRows'] : undefined,
            addButtonLabel: typeof parsedRules['addButtonLabel'] === 'string'
              ? parsedRules['addButtonLabel']
              : normType === 'repeater'
              ? (f.label?.toLowerCase().includes('device') ? 'Add Another Device' : f.label?.toLowerCase().includes('sim') ? 'Add Another Mobile Number' : f.label?.toLowerCase().includes('proof') ? 'Add Another Proof / Attachment' : 'Add Equipment')
              : 'Add Equipment',
            visibilityCondition: f.visibilityCondition || undefined,
            condition: fieldCondition,
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
    isPublished: dto.isActive !== false,
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function convertSchemaToBackendSections(fields: FormField[]) {
  type SectionItemOutput = {
    key: string;
    title: string;
    required: boolean;
    orderIndex: number;
    visibilityCondition?: string;
    fields: Array<{
      fieldId: string;
      label: string;
      type: string;
      isRequired: boolean;
      orderIndex: number;
      validationRules?: string;
      visibilityCondition?: string;
    }>;
  };

  const sections: SectionItemOutput[] = [];

  const usedSectionKeys = new Set<string>();
  const getUniqueSectionKey = (baseKey: string): string => {
    let key = baseKey;
    let suffix = 1;
    while (usedSectionKeys.has(key)) {
      suffix++;
      key = `${baseKey}-${suffix}`;
    }
    usedSectionKeys.add(key);
    return key;
  };

  const initialKey = getUniqueSectionKey('general');
  let currentSection: SectionItemOutput = {
    key: initialKey,
    title: 'General Information',
    required: true,
    orderIndex: 0,
    visibilityCondition: undefined,
    fields: [],
  };

  let sectionIndex = 0;
  let fieldIndex = 0;
  const seenFieldIds = new Set<string>();
  let hasEncounteredExplicitSection = false;

  for (const field of fields) {
    if (field.type === 'section-header') {
      if (hasEncounteredExplicitSection || currentSection.fields.length > 0) {
        sections.push(currentSection);
        sectionIndex++;
      }
      hasEncounteredExplicitSection = true;
      const title = field.sectionTitle || field.label || `Section ${sectionIndex + 1}`;
      const baseKey =
        field.sectionKey && field.sectionKey.trim().length > 0
          ? field.sectionKey.trim()
          : title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') || `section-${sectionIndex}`;
      const key = getUniqueSectionKey(baseKey);

      currentSection = {
        key,
        title,
        required: true,
        orderIndex: sectionIndex,
        visibilityCondition: field.condition ? JSON.stringify(field.condition) : field.visibilityCondition,
        fields: [],
      };
      fieldIndex = 0;
      continue;
    }

    if (field.type === 'divider') {
      continue;
    }

    let fieldId = field.id;
    if (!fieldId || !UUID_REGEX.test(fieldId) || seenFieldIds.has(fieldId)) {
      fieldId = generateId();
    }
    seenFieldIds.add(fieldId);

    const resolvedFieldVisibility = field.condition
      ? JSON.stringify(field.condition)
      : field.visibilityCondition || currentSection.visibilityCondition;

    const fieldDto = {
      fieldId,
      label: field.label || 'Untitled Field',
      type: field.type,
      isRequired: Boolean(field.required),
      orderIndex: fieldIndex++,
      visibilityCondition: resolvedFieldVisibility,
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
        condition: field.condition,
      }),
    };

    currentSection.fields.push(fieldDto);
  }

  if (hasEncounteredExplicitSection || currentSection.fields.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Reorders fields in the schema while keeping section hierarchies intact.
 * When dragging a section-header, the header AND all fields belonging to that section
 * move together as a single block to prevent breaking the form layout.
 */
export function reorderFieldsWithSections(
  fields: FormField[],
  fromIndex: number,
  toIndex: number
): FormField[] {
  if (fromIndex < 0 || fromIndex >= fields.length || toIndex < 0 || toIndex > fields.length) {
    return fields;
  }
  if (fromIndex === toIndex) {
    return fields;
  }

  const targetField = fields[fromIndex];
  const newFields = [...fields];

  // If moving a section-header, move the section header AND all its child fields as a block
  if (targetField.type === 'section-header') {
    const blockStart = fromIndex;
    let blockEnd = fromIndex + 1;
    while (blockEnd < fields.length && fields[blockEnd].type !== 'section-header') {
      blockEnd++;
    }

    // If dropping inside the same section block, no-op
    if (toIndex >= blockStart && toIndex <= blockEnd) {
      return fields;
    }

    const blockSize = blockEnd - blockStart;
    const sectionBlock = newFields.splice(blockStart, blockSize);

    // Calculate insertion index in the spliced array
    let insertIndex = toIndex;
    if (toIndex > blockStart) {
      insertIndex = toIndex - blockSize;
    }
    insertIndex = Math.max(0, Math.min(insertIndex, newFields.length));

    newFields.splice(insertIndex, 0, ...sectionBlock);
    return newFields;
  }

  // Regular single field move
  const [removed] = newFields.splice(fromIndex, 1);
  if (!removed) return fields;

  const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex;
  const insertIndex = Math.max(0, Math.min(adjustedTo, newFields.length));
  newFields.splice(insertIndex, 0, removed);

  return newFields;
}

/**
 * Duplicates a field or an entire section with all its child fields.
 */
export function duplicateFieldWithSection(fields: FormField[], id: string): FormField[] {
  const fromIndex = fields.findIndex((f) => f.id === id);
  if (fromIndex < 0) return fields;

  const targetField = fields[fromIndex];
  const newFields = [...fields];

  if (targetField.type === 'section-header') {
    const blockStart = fromIndex;
    let blockEnd = fromIndex + 1;
    while (blockEnd < fields.length && fields[blockEnd].type !== 'section-header') {
      blockEnd++;
    }

    const duplicatedBlock: FormField[] = fields.slice(blockStart, blockEnd).map((field, idx) => {
      if (idx === 0) {
        return {
          ...field,
          id: generateId(),
          sectionTitle: `${field.sectionTitle || field.label} (Copy)`,
          label: `${field.label} (Copy)`,
          sectionKey: field.sectionKey ? `${field.sectionKey}-copy` : undefined,
        };
      }
      return {
        ...field,
        id: generateId(),
      };
    });

    newFields.splice(blockEnd, 0, ...duplicatedBlock);
    return newFields;
  }

  const duplicate: FormField = {
    ...targetField,
    id: generateId(),
    label: `${targetField.label} (Copy)`,
  };
  newFields.splice(fromIndex + 1, 0, duplicate);
  return newFields;
}

/**
 * Deletes a single field, or when targeting a section-header (or default-section),
 * deletes the entire section block including its child fields so that orphaned
 * fields do not recreate a fallback section or merge into an adjacent section.
 */
export function deleteFieldWithSection(fields: FormField[], id: string): FormField[] {
  if (id === 'default-section') {
    let firstSectionIndex = 0;
    while (firstSectionIndex < fields.length && fields[firstSectionIndex].type !== 'section-header') {
      firstSectionIndex++;
    }
    return fields.slice(firstSectionIndex);
  }

  const fromIndex = fields.findIndex((f) => f.id === id);
  if (fromIndex < 0) return fields;

  const targetField = fields[fromIndex];
  if (targetField.type === 'section-header') {
    const blockStart = fromIndex;
    let blockEnd = fromIndex + 1;
    while (blockEnd < fields.length && fields[blockEnd].type !== 'section-header') {
      blockEnd++;
    }
    return [...fields.slice(0, blockStart), ...fields.slice(blockEnd)];
  }

  return fields.filter((f) => f.id !== id);
}
