"use client";

import React from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  FileText,
  Layout,
  ListFilter,
  ShieldAlert,
  Building2,
  Layers,
  Calendar,
  Globe,
  EyeOff,
  Eye,
  Table,
  Sparkles,
} from "lucide-react";
import { FormField, FormSchema, FieldType, RepeaterColumn } from "./types";
import { ConditionBuilder } from "./ConditionBuilder";
import {
  generateId,
  getFieldLabel,
  getFieldIcon,
  DEFAULT_EQUIPMENT_COLUMNS,
  DEFAULT_STATION_PARTICULARS_COLUMNS,
  DEFAULT_DEVICE_REGISTRATION_COLUMNS,
  DEFAULT_TVRO_EQUIPMENT_COLUMNS,
  DEFAULT_REQUEST_DEVICE_COLUMNS,
  DEFAULT_REQUEST_SIM_COLUMNS,
  DEFAULT_COMPLAINT_ATTACHMENT_COLUMNS,
} from "./utils";

interface FieldEditorProps {
  field: FormField | null;
  form?: FormSchema | null;
  onUpdateField: (updates: Partial<FormField>) => void;
  onUpdateForm?: (updates: Partial<FormSchema>) => void;
  onSelectField?: (fieldId: string | null) => void;
  selectedVariant?: string;
  isVariantEditMode?: boolean;
  isReadOnly?: boolean;
}

function LabeledSection({
  title,
  icon: Icon,
  description,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {title}
        </label>
      </div>
      {description && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

const FIELDS_WITH_PLACEHOLDER: FieldType[] = ["text", "textarea", "number", "email", "phone", "date", "time"];
const FIELDS_WITH_OPTIONS: FieldType[] = ["select", "radio", "checkbox"];

function parseRepeaterColType(val: string): RepeaterColumn["type"] {
  if (
    val === "text" ||
    val === "number" ||
    val === "select" ||
    val === "date" ||
    val === "file" ||
    val === "equipments" ||
    val === "serials"
  ) {
    return val;
  }
  return "text";
}

function formatDate(isoString?: string): string {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function FieldEditor({
  field,
  form,
  onUpdateField,
  onUpdateForm,
  onSelectField,
  selectedVariant = "ALL",
  isVariantEditMode = false,
  isReadOnly = false,
}: FieldEditorProps) {
  // If NO field is selected, display the Form Template Overview and Details
  if (!field) {
    const totalFields = form?.fields.length ?? 0;
    const requiredFields = form?.fields.filter((f) => f.required).length ?? 0;
    const sectionHeaders = form?.fields.filter((f) => f.type === "section-header").length ?? 0;
    const fileFields = form?.fields.filter((f) => f.type === "file").length ?? 0;

    return (
      <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate">
                Form Template Details
              </h2>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                {form?.id ? `ID: ${form.id}` : "Overview & Summary"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Associated Service Card */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Associated Service
              </span>
            </div>
            {form?.serviceName ? (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {form.serviceName}
                </p>
                {form.serviceCode && (
                  <span className="inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {form.serviceCode}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Standalone / Unassigned</p>
            )}
          </div>

          {/* Form Properties & Settings */}
          <LabeledSection
            title="Form Title"
            icon={FileText}
            description="Display title of this form template."
          >
            <input
              type="text"
              value={form?.name ?? ""}
              onChange={(e) => onUpdateForm && onUpdateForm({ name: e.target.value })}
              className={inputClass}
              placeholder="Form template name"
            />
          </LabeledSection>

          <LabeledSection
            title="Form Description"
            description="Instructions displayed to applicants."
          >
            <textarea
              value={form?.description ?? ""}
              onChange={(e) => onUpdateForm && onUpdateForm({ description: e.target.value })}
              className={`${inputClass} h-16 resize-none`}
              placeholder="Form description / purpose"
            />
          </LabeledSection>

          {/* Status & Publication */}
          <LabeledSection
            title="Publication State"
            icon={form?.isPublished ? Globe : EyeOff}
            description="Control whether this form is live for applicants."
          >
            <button
              type="button"
              onClick={() => onUpdateForm && onUpdateForm({ isPublished: !form?.isPublished })}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                form?.isPublished
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                  : "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    form?.isPublished ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span>{form?.isPublished ? "Published (Live)" : "Draft Mode"}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                Click to switch
              </span>
            </button>
          </LabeledSection>

          {/* Form Statistics */}
          <LabeledSection
            title="Form Statistics"
            icon={Layers}
            description="Summary of fields and sections in this form."
          >
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 block font-mono">
                  {totalFields}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Total Fields</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400 block font-mono">
                  {requiredFields}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Required</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-lg font-bold text-slate-700 dark:text-slate-300 block font-mono">
                  {sectionHeaders}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Sections</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400 block font-mono">
                  {fileFields}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Attachments</span>
              </div>
            </div>
          </LabeledSection>

          {/* Form Outline / Quick Jump */}
          {form?.fields && form.fields.length > 0 && (
            <LabeledSection
              title="Field Outline (Click to Inspect)"
              icon={ListFilter}
              description="Click any component below to edit its specific properties."
            >
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {form.fields.map((f, idx) => (
                  <button
                    key={`${f.id}-${idx}`}
                    type="button"
                    onClick={() => onSelectField && onSelectField(f.id)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs">{getFieldIcon(f.type)}</span>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {f.label || `Field ${idx + 1}`}
                      </span>
                    </div>
                    {f.required && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 font-bold shrink-0">
                        *
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </LabeledSection>
          )}

          {/* Metadata Timestamps */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Created:
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-300" suppressHydrationWarning>
                {formatDate(form?.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Updated:
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-300" suppressHydrationWarning>
                {formatDate(form?.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If a FIELD IS SELECTED, display individual Field Properties
  const hasPlaceholder = FIELDS_WITH_PLACEHOLDER.includes(field.type);
  const hasOptions = FIELDS_WITH_OPTIONS.includes(field.type);

  const handleOptionChange = (optionId: string, key: "label" | "value", value: string) => {
    if (!field.options) return;
    onUpdateField({
      options: field.options.map((opt) =>
        opt.id === optionId ? { ...opt, [key]: value } : opt
      ),
    });
  };

  const handleAddOption = () => {
    const nextIdx = (field.options?.length ?? 0) + 1;
    const newOption = {
      id: generateId(),
      label: `Option ${nextIdx}`,
      value: `option_${nextIdx}`,
    };
    onUpdateField({ options: [...(field.options ?? []), newOption] });
  };

  const handleRemoveOption = (optionId: string) => {
    onUpdateField({ options: (field.options ?? []).filter((o) => o.id !== optionId) });
  };

  const handleMoveOption = (optionId: string, direction: "up" | "down") => {
    if (!field.options) return;
    const idx = field.options.findIndex((o) => o.id === optionId);
    if (idx < 0) return;
    const newOptions = [...field.options];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newOptions.length) return;
    const temp = newOptions[idx];
    const swap = newOptions[targetIdx];
    if (!temp || !swap) return;
    newOptions[idx] = swap;
    newOptions[targetIdx] = temp;
    onUpdateField({ options: newOptions });
  };

  // Repeater Column Handlers
  const columns: RepeaterColumn[] = field.repeaterColumns ?? [];

  const handleAddColumn = () => {
    const nextIdx = columns.length + 1;
    const newCol: RepeaterColumn = {
      id: generateId(),
      key: `col_${nextIdx}`,
      label: `Column ${nextIdx}`,
      type: "text",
      required: false,
    };
    onUpdateField({ repeaterColumns: [...columns, newCol] });
  };

  const handleUpdateColumn = (colId: string, updates: Partial<RepeaterColumn>) => {
    const updated = columns.map((c) => (c.id === colId ? { ...c, ...updates } : c));
    onUpdateField({ repeaterColumns: updated });
  };

  const handleRemoveColumn = (colId: string) => {
    onUpdateField({ repeaterColumns: columns.filter((c) => c.id !== colId) });
  };

  const handleMoveColumn = (colId: string, direction: "up" | "down") => {
    const idx = columns.findIndex((c) => c.id === colId);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= columns.length) return;
    const newCols = [...columns];
    const temp = newCols[idx];
    const swap = newCols[targetIdx];
    if (!temp || !swap) return;
    newCols[idx] = swap;
    newCols[targetIdx] = temp;
    onUpdateField({ repeaterColumns: newCols });
  };

  const handleLoadEquipmentPreset = () => {
    onUpdateField({
      label: "Equipment Inventory / Specifications",
      helpText: "List all radio equipment units included in this application.",
      addButtonLabel: "Add Equipment",
      repeaterColumns: [...DEFAULT_EQUIPMENT_COLUMNS],
      minRows: 1,
    });
  };

  const handleLoadRequestDevicePreset = () => {
    onUpdateField({
      label: "Device Particulars",
      helpText: "List all mobile phone handsets to be blocked/unblocked.",
      addButtonLabel: "Add Another Device (Dual SIM / Multiple Handsets)",
      repeaterColumns: [...DEFAULT_REQUEST_DEVICE_COLUMNS],
      minRows: 1,
    });
  };

  const handleLoadRequestSimPreset = () => {
    onUpdateField({
      label: "SIM Card / Mobile Numbers",
      helpText: "Enter all mobile numbers and SIM details associated with this request.",
      addButtonLabel: "Add Another Mobile Number",
      repeaterColumns: [...DEFAULT_REQUEST_SIM_COLUMNS],
      minRows: 1,
    });
  };

  const handleLoadComplaintAttachmentPreset = () => {
    onUpdateField({
      label: "Attached Proof / Supporting Documents",
      helpText: "Upload evidence, screenshots, or billing statements supporting the complaint.",
      addButtonLabel: "Add Another Proof / Attachment",
      repeaterColumns: [...DEFAULT_COMPLAINT_ATTACHMENT_COLUMNS],
      minRows: 1,
    });
  };

  const handleLoadStationParticularsPreset = () => {
    onUpdateField({
      label: "Particulars of Station & Equipment",
      helpText: "Enter station specifications, equipment units, frequencies, and serial numbers.",
      addButtonLabel: "Add Station",
      repeaterColumns: [...DEFAULT_STATION_PARTICULARS_COLUMNS],
      minRows: 1,
    });
  };

  const handleLoadDeviceRegistrationPreset = () => {
    onUpdateField({
      label: "Particulars of Equipment",
      helpText: "Enter make/type/model, serial numbers, and frequency range.",
      addButtonLabel: "Add Equipment",
      repeaterColumns: [...DEFAULT_DEVICE_REGISTRATION_COLUMNS],
      minRows: 1,
    });
  };

  const handleLoadTvroEquipmentPreset = () => {
    onUpdateField({
      label: "Particulars of Equipment",
      helpText: "Enter TVRO equipment units, serial numbers, and frequency range.",
      addButtonLabel: "Add Equipment",
      repeaterColumns: [...DEFAULT_TVRO_EQUIPMENT_COLUMNS],
      minRows: 1,
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
      {/* Editor Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">{getFieldIcon(field.type)}</span>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate">
              {getFieldLabel(field.type)}
            </h2>
            <p className="text-[10px] text-slate-400 font-mono truncate">ID: {field.id}</p>
          </div>
        </div>
        {onSelectField && (
          <button
            type="button"
            onClick={() => onSelectField(null)}
            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
            title="Deselect to view Form Overview"
          >
            Form Overview
          </button>
        )}
      </div>

      {selectedVariant && selectedVariant !== "ALL" && (
        <div className="p-2.5 mx-4 mt-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="font-bold">Variant Scoped Editing: {selectedVariant}</p>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
              Changes will apply only to this service variant and will not affect other forms.
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        {/* Label */}
        <LabeledSection
          title="Field Label"
          icon={FileText}
          description="The question or title displayed above the input."
        >
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdateField({ label: e.target.value })}
            className={inputClass}
            placeholder="e.g. Full Legal Name, Business Address..."
          />
        </LabeledSection>

        {/* Section Header Title */}
        {field.type === "section-header" && (
          <LabeledSection
            title="Section Heading Text"
            icon={Layout}
            description="Heading text displayed on the divider banner."
          >
            <input
              type="text"
              value={field.sectionTitle ?? ""}
              onChange={(e) => onUpdateField({ sectionTitle: e.target.value })}
              className={inputClass}
              placeholder="e.g. Part I: Applicant Information"
            />
          </LabeledSection>
        )}

        {/* Placeholder */}
        {hasPlaceholder && (
          <LabeledSection
            title="Placeholder Text"
            description="Subtle example text shown inside the input before typing."
          >
            <input
              type="text"
              value={field.placeholder ?? ""}
              onChange={(e) => onUpdateField({ placeholder: e.target.value })}
              className={inputClass}
              placeholder="e.g. Enter your complete address..."
            />
          </LabeledSection>
        )}

        {/* Help / Guidance Text */}
        {field.type !== "section-header" && field.type !== "divider" && (
          <LabeledSection
            title="Help / Guidance Text"
            description="Helper instructions displayed underneath the input for end users."
          >
            <input
              type="text"
              value={field.helpText ?? ""}
              onChange={(e) => onUpdateField({ helpText: e.target.value })}
              className={inputClass}
              placeholder="e.g. Please provide your registered address per official ID"
            />
          </LabeledSection>
        )}

        {/* Mandatory / Required toggle */}
        {field.type !== "section-header" && field.type !== "divider" && (
          <LabeledSection
            title="Validation Requirements"
            icon={ShieldAlert}
            description="Enforce user input before form submission."
          >
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    field.required ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                  }`}
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Mandatory Field
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {field.required ? "Required to submit form" : "Optional field"}
                  </span>
                </div>
              </div>
              <div
                role="checkbox"
                aria-checked={field.required}
                tabIndex={0}
                onClick={() => onUpdateField({ required: !field.required })}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") onUpdateField({ required: !field.required });
                }}
                className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                  field.required ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    field.required ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>
          </LabeledSection>
        )}

        {/* Column Span Layout */}
        {field.type !== "divider" && (
          <LabeledSection
            title="Grid Column Span"
            icon={Layout}
            description="Choose how wide this field renders on the page."
          >
            <div className="grid grid-cols-2 gap-2">
              {([1, 2] as const).map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => onUpdateField({ cols: col })}
                  className={`py-2 px-3 text-xs rounded-xl border font-semibold transition-all text-center ${
                    (field.cols ?? 2) === col
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-indigo-400"
                  }`}
                >
                  {col === 1 ? "Half Width (1 Col)" : "Full Width (2 Cols)"}
                </button>
              ))}
            </div>
          </LabeledSection>
        )}

        {/* Text length constraints */}
        {(field.type === "text" || field.type === "textarea") && (
          <LabeledSection
            title="Character Limits"
            description="Optional minimum and maximum length constraints."
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                  Min Characters
                </label>
                <input
                  type="number"
                  value={field.minLength ?? ""}
                  onChange={(e) =>
                    onUpdateField({ minLength: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  className={inputClass}
                  placeholder="0"
                  min={0}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                  Max Characters
                </label>
                <input
                  type="number"
                  value={field.maxLength ?? ""}
                  onChange={(e) =>
                    onUpdateField({ maxLength: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  className={inputClass}
                  placeholder="No limit"
                  min={0}
                />
              </div>
            </div>
          </LabeledSection>
        )}

        {/* Number constraints */}
        {field.type === "number" && (
          <LabeledSection
            title="Numeric Value Range"
            description="Minimum and maximum accepted numbers."
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                  Min Value
                </label>
                <input
                  type="number"
                  value={field.min ?? ""}
                  onChange={(e) =>
                    onUpdateField({ min: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  className={inputClass}
                  placeholder="Min"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                  Max Value
                </label>
                <input
                  type="number"
                  value={field.max ?? ""}
                  onChange={(e) =>
                    onUpdateField({ max: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  className={inputClass}
                  placeholder="Max"
                />
              </div>
            </div>
          </LabeledSection>
        )}

        {/* File constraints */}
        {field.type === "file" && (
          <>
            <LabeledSection
              title="Allowed File Types"
              description="Comma-separated extensions e.g. .pdf, .docx, .png, .jpg"
            >
              <input
                type="text"
                value={field.acceptedFileTypes ?? ""}
                onChange={(e) => onUpdateField({ acceptedFileTypes: e.target.value })}
                className={inputClass}
                placeholder=".pdf,.jpg,.png"
              />
            </LabeledSection>
            <LabeledSection
              title="Maximum File Size (MB)"
              description="Upload limit per attached file."
            >
              <input
                type="number"
                value={field.maxFileSizeMb ?? ""}
                onChange={(e) =>
                  onUpdateField({
                    maxFileSizeMb: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className={inputClass}
                placeholder="10 (MB)"
                min={1}
              />
            </LabeledSection>
          </>
        )}

        {/* Table & Repeater Columns Editor */}
        {field.type === "repeater" && (
          <LabeledSection
            title="Table Columns & Equipment Fields"
            icon={Table}
            description="Define the table columns for each repeatable equipment entry."
          >
            {/* Quick Preset Buttons */}
            <div className="space-y-1 mb-2">
              <span className="text-[10px] font-semibold text-slate-400 block">Quick Presets:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handleLoadEquipmentPreset}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-semibold transition-colors"
                >
                  <Sparkles className="w-3 h-3 flex-shrink-0" />
                  <span>Radio Equipment</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadRequestDevicePreset}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-[11px] text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-semibold transition-colors"
                >
                  <Sparkles className="w-3 h-3 flex-shrink-0" />
                  <span>Device / Handset</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadRequestSimPreset}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-[11px] text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-semibold transition-colors"
                >
                  <Sparkles className="w-3 h-3 flex-shrink-0" />
                  <span>SIM / Mobile No.</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadComplaintAttachmentPreset}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-semibold transition-colors"
                >
                  <Sparkles className="w-3 h-3 flex-shrink-0" />
                  <span>Proof Documents</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadStationParticularsPreset}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-[11px] text-purple-700 dark:text-purple-300 hover:bg-purple-100 font-semibold transition-colors"
                >
                  <Sparkles className="w-3 h-3 flex-shrink-0" />
                  <span>Station & Equip</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadDeviceRegistrationPreset}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-[11px] text-teal-700 dark:text-teal-300 hover:bg-teal-100 font-semibold transition-colors"
                >
                  <Sparkles className="w-3 h-3 flex-shrink-0" />
                  <span>Device Reg.</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadTvroEquipmentPreset}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-[11px] text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 font-semibold transition-colors col-span-2"
                >
                  <Sparkles className="w-3 h-3 flex-shrink-0" />
                  <span>TVRO / CATV Equipment</span>
                </button>
              </div>
            </div>

            {/* Columns List */}
            <div className="space-y-2">
              {columns.map((col, idx) => (
                <div
                  key={col.id}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveColumn(col.id, "up")}
                        disabled={idx === 0}
                        className="p-0.5 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move column up"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">#{idx + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 cursor-pointer text-[10px] text-slate-600 dark:text-slate-400">
                        <input
                          type="checkbox"
                          checked={col.required ?? false}
                          onChange={(e) => handleUpdateColumn(col.id, { required: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-0 w-3 h-3"
                        />
                        <span>Req</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveColumn(col.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                        title="Delete column"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[9px] font-semibold text-slate-400 block mb-0.5">Column Label</label>
                      <input
                        type="text"
                        value={col.label}
                        onChange={(e) => handleUpdateColumn(col.id, { label: e.target.value })}
                        className={inputClass}
                        placeholder="Column Label"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-semibold text-slate-400 block mb-0.5">Input Type</label>
                      <select
                        value={col.type}
                        onChange={(e) =>
                          handleUpdateColumn(col.id, {
                            type: parseRepeaterColType(e.target.value),
                          })
                        }
                        className={inputClass}
                      >
                        <option value="text">Text Input</option>
                        <option value="number">Number</option>
                        <option value="select">Dropdown</option>
                        <option value="date">Date Picker</option>
                        <option value="file">File Upload</option>
                        <option value="equipments">Equipment Units (Freq & Serial)</option>
                        <option value="serials">Serial Number List</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-semibold text-slate-400 block mb-0.5">Placeholder</label>
                    <input
                      type="text"
                      value={col.placeholder ?? ""}
                      onChange={(e) => handleUpdateColumn(col.id, { placeholder: e.target.value })}
                      className={inputClass}
                      placeholder="e.g. Motorola / IC-7300..."
                    />
                  </div>

                  {col.type === "select" && (
                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-semibold text-slate-400">Dropdown Options</label>
                        <button
                          type="button"
                          onClick={() => {
                            const currentOpts = col.options ?? [];
                            const nextNum = currentOpts.length + 1;
                            const newOpt = { id: generateId(), label: `Option ${nextNum}`, value: `option_${nextNum}` };
                            handleUpdateColumn(col.id, { options: [...currentOpts, newOpt] });
                          }}
                          className="text-[9px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                        >
                          + Add Option
                        </button>
                      </div>
                      <div className="space-y-1">
                        {(col.options ?? []).map((opt, oIdx) => (
                          <div key={opt.id} className="flex items-center gap-1">
                            <input
                              type="text"
                              value={opt.label}
                              onChange={(e) => {
                                const currentOpts = col.options ?? [];
                                const updated = currentOpts.map((o) =>
                                  o.id === opt.id ? { ...o, label: e.target.value, value: e.target.value } : o
                                );
                                handleUpdateColumn(col.id, { options: updated });
                              }}
                              className={inputClass}
                              placeholder={`Option ${oIdx + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const currentOpts = col.options ?? [];
                                handleUpdateColumn(col.id, { options: currentOpts.filter((o) => o.id !== opt.id) });
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded"
                              title="Delete option"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddColumn}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Table Column
              </button>
            </div>

            {/* Table Action Controls & Row Constraints */}
            <div className="pt-2 space-y-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Add Button Label
                </label>
                <input
                  type="text"
                  value={field.addButtonLabel ?? "Add Equipment"}
                  onChange={(e) => onUpdateField({ addButtonLabel: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Add Equipment / Add Row"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Min Rows Required
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={field.minRows ?? 1}
                    onChange={(e) =>
                      onUpdateField({
                        minRows: e.target.value ? parseInt(e.target.value, 10) : 0,
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Max Rows Allowed
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={field.maxRows ?? ""}
                    onChange={(e) =>
                      onUpdateField({
                        maxRows: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      })
                    }
                    className={inputClass}
                    placeholder="Unlimited"
                  />
                </div>
              </div>
            </div>
          </LabeledSection>
        )}

          {/* Conditional Visibility & Logic */}
        {field.type !== "divider" && (
          <LabeledSection
            title={field.type === "section-header" ? "Section Visibility & Logic" : "Conditional Visibility & Logic"}
            icon={EyeOff}
            description={
              field.type === "section-header"
                ? "Control when this entire section appears based on Service, Variant, Element, Applicant Type, or parent field dependency."
                : "Control when this field appears based on Service, Variant, Element, Applicant Type, or field dependency."
            }
          >
            <ConditionBuilder
              field={field}
              form={form}
              onUpdateField={onUpdateField}
            />
          </LabeledSection>
        )}

        {hasOptions && (
          <LabeledSection
            title="Choice Options"
            icon={ListFilter}
            description="Manage choices presented to users."
          >
            <div className="space-y-2">
              {(field.options ?? []).map((option, idx) => (
                <div
                  key={option.id}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <button
                    type="button"
                    onClick={() => handleMoveOption(option.id, "up")}
                    disabled={idx === 0}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => handleOptionChange(option.id, "label", e.target.value)}
                    className={`${inputClass} flex-1`}
                    placeholder="Display Label"
                    title="Display Label"
                  />
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => handleOptionChange(option.id, "value", e.target.value)}
                    className={`${inputClass} w-24 font-mono text-[11px]`}
                    placeholder="Value Code"
                    title="Stored Value Code"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(option.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    title="Delete option"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddOption}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Choice Option
              </button>
            </div>
          </LabeledSection>
        )}
      </div>
    </div>
  );
}
