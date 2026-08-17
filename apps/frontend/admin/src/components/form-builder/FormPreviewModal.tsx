"use client";

import React from "react";
import { X } from "lucide-react";
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

function PreviewField({ field }: { field: FormField }) {
  const labelEl = (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
      {field.label}
      {field.required && <span className="text-rose-500 ml-1">*</span>}
    </label>
  );

  const inputClass =
    "w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

  const helpText = field.helpText ? (
    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{field.helpText}</p>
  ) : null;

  if (field.type === "section-header") {
    return (
      <div className="pt-2 pb-1">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          {field.sectionTitle || field.label}
        </h3>
        <div className="mt-1.5 h-px bg-indigo-200 dark:bg-indigo-800" />
      </div>
    );
  }

  if (field.type === "divider") {
    return <hr className="border-slate-200 dark:border-slate-700" />;
  }

  if (field.type === "textarea") {
    return (
      <div>
        {labelEl}
        <textarea
          placeholder={field.placeholder}
          className={`${inputClass} h-24 resize-vertical`}
          minLength={field.minLength}
          maxLength={field.maxLength}
          required={field.required}
        />
        {helpText}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        {labelEl}
        <select className={inputClass} required={field.required} defaultValue="">
          <option value="" disabled>
            {field.placeholder || "Select an option..."}
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
      <div>
        {labelEl}
        <div className="space-y-2">
          {(field.options ?? []).map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={opt.value}
                required={field.required}
                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{opt.label}</span>
            </label>
          ))}
        </div>
        {helpText}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div>
        {labelEl}
        <div className="space-y-2">
          {(field.options ?? []).map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                value={opt.value}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{opt.label}</span>
            </label>
          ))}
        </div>
        {helpText}
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <div>
        {labelEl}
        <div className="relative">
          <input
            type="file"
            accept={field.acceptedFileTypes}
            required={field.required}
            className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-600 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-lg p-2"
          />
        </div>
        {field.maxFileSizeMb && (
          <p className="text-xs text-slate-400 mt-1">Max size: {field.maxFileSizeMb}MB</p>
        )}
        {helpText}
      </div>
    );
  }

  const typeMap: Record<string, string> = {
    text: "text",
    number: "number",
    email: "email",
    phone: "tel",
    date: "date",
  };

  return (
    <div>
      {labelEl}
      <input
        type={typeMap[field.type] ?? "text"}
        placeholder={field.placeholder}
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

export function FormPreviewModal({ open, onOpenChange, form }: FormPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-700">
                  Preview
                </span>
                {form.isPublished ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-700">
                    Published
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-700">
                    Draft
                  </span>
                )}
              </div>
              <DialogTitle>{form.name || "Untitled Form"}</DialogTitle>
              {form.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{form.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {form.fields.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-sm">This form has no fields yet.</p>
            </div>
          ) : (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              {form.fields.map((field) => (
                <PreviewField key={field.id} field={field} />
              ))}
            </form>
          )}
        </div>

        {form.fields.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
            <button
              type="button"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
            >
              Submit Form
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
