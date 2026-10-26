"use client";

import React, { useState } from "react";
import { Building2, Layers, CheckCircle2, Code2, Eye, Plus, Trash2, Sliders } from "lucide-react";
import { parseFieldCondition } from "./utils";
import { collectAllFormVariants } from "./canonicalFormServices";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormSchema, FormField } from "./types";

interface FormPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormSchema;
}

interface PreviewFieldProps {
  field: FormField;
  value?: string;
  onChange?: (val: string) => void;
}

function PreviewField({ field, value = "", onChange }: PreviewFieldProps) {
  const labelEl = (
    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
      {field.label}
      {field.required && <span className="text-rose-500 ml-1 font-bold">*</span>}
    </label>
  );

  const inputClass =
    "w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

  const helpText = field.helpText ? (
    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{field.helpText}</p>
  ) : null;

  if (field.type === "section-header") {
    return (
      <div className="col-span-2 pt-3 pb-1 border-b border-indigo-200 dark:border-indigo-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          {field.sectionTitle || field.label}
        </h3>
      </div>
    );
  }

  if (field.type === "divider") {
    return <div className="col-span-2"><hr className="border-slate-200 dark:border-slate-800 my-2" /></div>;
  }

  const colSpanClass = (field.cols ?? 2) === 1 ? "col-span-1" : "col-span-2";

  if (field.type === "textarea") {
    return (
      <div className={colSpanClass}>
        {labelEl}
        <textarea
          placeholder={field.placeholder || "Enter detailed text..."}
          className={`${inputClass} h-20 resize-vertical`}
          minLength={field.minLength}
          maxLength={field.maxLength}
          required={field.required}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
        {helpText}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className={colSpanClass}>
        {labelEl}
        <select className={inputClass} required={field.required} value={value} onChange={(e) => onChange?.(e.target.value)}>
          <option value="" disabled>
            {field.placeholder || "-- Please Select --"}
          </option>
          {(field.options ?? []).map((opt) => (
            <option key={opt.id} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {helpText}
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div className={colSpanClass}>
        {labelEl}
        <div className="space-y-1.5 pt-1">
          {(field.options ?? []).map((opt) => (
            <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name={field.id}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange?.(opt.value)}
                required={field.required}
                className="w-3.5 h-3.5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        {helpText}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className={colSpanClass}>
        {labelEl}
        <div className="space-y-1.5 pt-1">
          {(field.options ?? []).map((opt) => (
            <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                value={opt.value}
                className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span>{opt.label}</span>
            </label>
          ))}
          {(field.options ?? []).length === 0 && (
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                value="true"
                className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span>{field.placeholder || field.label || 'Checkbox option'}</span>
            </label>
          )}
        </div>
        {helpText}
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <div className={colSpanClass}>
        {labelEl}
        <div className="relative">
          <input
            type="file"
            accept={field.acceptedFileTypes}
            required={field.required}
            className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-600 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-lg p-1.5"
          />
        </div>
        {field.maxFileSizeMb && (
          <p className="text-[10px] text-slate-400 mt-1">Maximum file size: {field.maxFileSizeMb}MB</p>
        )}
        {helpText}
      </div>
    );
  }

  if (field.type === "repeater") {
    return <RepeaterFieldPreview field={field} />;
  }

  const typeMap: Record<string, string> = {
    text: "text",
    number: "number",
    email: "email",
    phone: "tel",
    date: "date",
    time: "time",
  };

  return (
    <div className={colSpanClass}>
      {labelEl}
      <input
        type={typeMap[field.type] ?? "text"}
        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
        required={field.required}
        min={field.min}
        max={field.max}
        minLength={field.minLength}
        maxLength={field.maxLength}
        className={inputClass}
      />
      {helpText}
    </div>
  );
}

function RepeaterFieldPreview({ field }: { field: FormField }) {
  const columns =
    field.repeaterColumns && field.repeaterColumns.length > 0
      ? field.repeaterColumns
      : [
          { id: "col-1", key: "equipmentType", label: "Equipment Type", type: "text" as const, required: true },
          { id: "col-2", key: "make", label: "Make / Brand", type: "text" as const, required: true },
          { id: "col-3", key: "model", label: "Model No.", type: "text" as const, required: true },
          { id: "col-4", key: "serialNumber", label: "Serial Number", type: "text" as const, required: true },
        ];

  const minRows = field.minRows ?? 1;
  const maxRows = field.maxRows ?? 50;

  const [rows, setRows] = useState<Array<{ id: string; values: Record<string, string> }>>(() =>
    Array.from({ length: Math.max(1, minRows) }, (_, i) => ({
      id: `row-${i + 1}`,
      values: {},
    }))
  );

  const handleAddRow = () => {
    if (rows.length >= maxRows) return;
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${prev.length + 1}`,
        values: {},
      },
    ]);
  };

  const handleRemoveRow = (rowId: string) => {
    if (rows.length <= minRows) return;
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleCellChange = (rowId: string, colKey: string, value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, values: { ...r.values, [colKey]: value } } : r
      )
    );
  };

  const inputClass =
    "w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all";

  return (
    <div className="col-span-2 space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {field.label}
          {field.required && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </label>
        <span className="text-[10px] text-slate-400">
          {rows.length} {rows.length === 1 ? "entry" : "entries"}
          {field.maxRows ? ` (Max: ${field.maxRows})` : ""}
        </span>
      </div>

      {field.helpText && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{field.helpText}</p>
      )}

      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-2 w-10 text-center text-slate-400">#</th>
                {columns.map((col) => (
                  <th key={col.id} className="px-3 py-2 min-w-[130px]">
                    {col.label}
                    {col.required && <span className="text-rose-500 ml-0.5">*</span>}
                  </th>
                ))}
                <th className="px-2 py-2 w-12 text-center text-slate-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className="bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                >
                  <td className="px-3 py-2 text-center text-slate-400 font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  {columns.map((col) => (
                    <td key={col.id} className="px-2 py-1.5">
                      {col.type === "select" ? (
                        <select
                          value={row.values[col.key] ?? ""}
                          onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                          required={col.required}
                          className={inputClass}
                        >
                          <option value="">-- Select --</option>
                          {(col.options ?? []).map((o) => (
                            <option key={o.id} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : col.type === "file" ? (
                        <input
                          type="file"
                          onChange={(e) => handleCellChange(row.id, col.key, e.target.files?.[0]?.name ?? "")}
                          required={col.required}
                          className={`${inputClass} cursor-pointer file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-slate-100 dark:file:bg-slate-800`}
                        />
                      ) : (
                        <input
                          type={
                            col.type === "number"
                              ? "number"
                              : col.type === "date"
                              ? "date"
                              : "text"
                          }
                          value={row.values[col.key] ?? ""}
                          onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                          placeholder={col.placeholder || col.label}
                          required={col.required}
                          className={inputClass}
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      disabled={rows.length <= minRows}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title={
                        rows.length <= minRows
                          ? `Minimum ${minRows} row(s) required`
                          : "Delete row"
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-2.5 bg-slate-100/60 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <button
            type="button"
            onClick={handleAddRow}
            disabled={rows.length >= maxRows}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{field.addButtonLabel || "Add Equipment"}</span>
          </button>
          <span className="text-[10px] text-slate-400">
            Min: {minRows} {minRows === 1 ? "row" : "rows"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function FormPreviewModal({ open, onOpenChange, form }: FormPreviewModalProps) {
  const [tab, setTab] = useState<"form" | "json">("form");
  const [submitted, setSubmitted] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>("ALL");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const availableVariants = React.useMemo(() => {
    const all = collectAllFormVariants(form);
    return all.map((v) => v.name);
  }, [form]);

  const handleFieldValueChange = (fieldId: string, val: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
  };

  const isFieldVisibleInPreview = (f: FormField): boolean => {
    if (f.type === "section-header" || f.type === "divider") return true;
    const cond = f.condition ?? (f.visibilityCondition ? parseFieldCondition(f.visibilityCondition) : undefined);
    if (!cond) return true;

    // 1. Variant filter
    if (selectedVariant !== "ALL") {
      const hasVariants = Boolean(cond.variants && cond.variants.length > 0);
      const hasAppTypes = Boolean(cond.applicationTypes && cond.applicationTypes.length > 0);

      if (hasVariants || hasAppTypes) {
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
        const target = normalize(selectedVariant);

        const matchesList = (list?: string[]) => {
          if (!list || list.length === 0) return false;
          return list.some((item) => {
            const norm = normalize(item);
            return norm === target || norm.includes(target) || target.includes(norm);
          });
        };

        if (!matchesList(cond.variants) && !matchesList(cond.applicationTypes)) {
          return false;
        }
      }
    }

    // 2. Parent-child dependencies
    if (cond.fieldDependencies && cond.fieldDependencies.length > 0) {
      for (const dep of cond.fieldDependencies) {
        const parentVal = formValues[dep.fieldId] ?? formValues[dep.fieldId.toLowerCase()] ?? "";
        if (dep.operator === "equals" && dep.value && parentVal !== dep.value) return false;
        if (dep.operator === "not_equals" && dep.value && parentVal === dep.value) return false;
        if (dep.operator === "is_not_empty" && !parentVal.trim()) return false;
        if (dep.operator === "is_empty" && parentVal.trim().length > 0) return false;
        if (dep.operator === "contains" && dep.value && !parentVal.includes(dep.value)) return false;
      }
    }

    return true;
  };

  const visibleFields = form.fields.filter(isFieldVisibleInPreview);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-5xl xl:max-w-6xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-slate-50 dark:bg-slate-900/80 pr-10 sm:pr-12">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-700 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Live Preview
                </span>
                {form.serviceName && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 max-w-[200px] truncate" title={form.serviceName}>
                    <Building2 className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span className="truncate">{form.serviceName}</span>
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                  <Layers className="w-3 h-3 inline mr-1" />
                  {form.fields.length} fields
                </span>
              </div>
              <DialogTitle className="text-base sm:text-lg font-bold break-words">{form.name || "Untitled Form"}</DialogTitle>
              {form.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words">{form.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <div className="flex items-center rounded-lg bg-slate-200 dark:bg-slate-800 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTab("form")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    tab === "form"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Form
                </button>
                <button
                  type="button"
                  onClick={() => setTab("json")}
                  className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
                    tab === "json"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  JSON
                </button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {tab === "json" ? (
            <pre className="p-3 sm:p-4 rounded-xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-auto max-h-[450px]">
              {JSON.stringify(form, null, 2)}
            </pre>
          ) : form.fields.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-sm">This form has no fields yet.</p>
              <p className="text-xs text-slate-500 mt-1">Add fields from the palette to preview them here.</p>
            </div>
          ) : (
            <form id="preview-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {submitted && (
                <div className="col-span-1 sm:col-span-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Preview Submission Validated: All required fields were entered correctly!</span>
                </div>
              )}
              {visibleFields.map((field, idx) => {
                const nextField = form.fields[idx + 1];
                const isEmptySection =
                  field.type === "section-header" &&
                  (!nextField || nextField.type === "section-header");
                return (
                  <React.Fragment key={field.id}>
                    <PreviewField field={field} value={formValues[field.id]} onChange={(val) => handleFieldValueChange(field.id, val)} />
                    {isEmptySection && (
                      <div className="col-span-1 sm:col-span-2 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-dashed border-amber-300 dark:border-amber-800 text-center">
                        <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                          Empty Section (0 fields)
                        </p>
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                          This section currently has no fields configured.
                        </p>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </form>
          )}
        </div>

        {tab === "form" && form.fields.length > 0 && (
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 bg-slate-50 dark:bg-slate-900/60">
            <button
              type="submit"
              form="preview-form"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
            >
              Test Form Submission
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
