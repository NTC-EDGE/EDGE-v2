"use client";

import React from "react";
import { FileText, Layout, EyeOff, Sparkles } from "lucide-react";
import { FormField, FormSchema } from "./types";
import { ConditionBuilder } from "./ConditionBuilder";
import { getFieldLabel, getFieldIcon } from "./utils";
import { LabeledSection, inputClass, FIELDS_WITH_PLACEHOLDER, FIELDS_WITH_OPTIONS } from "./field-editor/FieldEditorPrimitives";
import { FormOverviewPanel } from "./field-editor/FormOverviewPanel";
import { FieldConstraintsEditor } from "./field-editor/FieldConstraintsEditor";
import { RepeaterColumnsEditor } from "./field-editor/RepeaterColumnsEditor";
import { FieldOptionsEditor } from "./field-editor/FieldOptionsEditor";

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

export function FieldEditor({
  field,
  form,
  onUpdateField,
  onUpdateForm,
  onSelectField,
  selectedVariant = "ALL",
}: FieldEditorProps) {
  if (!field) {
    return (
      <FormOverviewPanel
        form={form}
        onUpdateForm={onUpdateForm}
        onSelectField={onSelectField}
      />
    );
  }

  const hasPlaceholder = FIELDS_WITH_PLACEHOLDER.includes(field.type);
  const hasOptions = FIELDS_WITH_OPTIONS.includes(field.type);

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
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
              Changes will apply only to this service variant and will not affect other variants.
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        {field.type === "section-header" ? (
          <>
            <LabeledSection
              title="Section Heading Title"
              icon={Layout}
              description="Heading text displayed on the section card header and form outline."
            >
              <input
                type="text"
                value={
                  (selectedVariant !== "ALL" && field.variantTitles?.[selectedVariant]) ||
                  field.sectionTitle ||
                  field.label ||
                  ""
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (selectedVariant !== "ALL") {
                    onUpdateField({ variantTitles: { ...(field.variantTitles ?? {}), [selectedVariant]: val } });
                  } else {
                    onUpdateField({ label: val, sectionTitle: val });
                  }
                }}
                className={inputClass}
                placeholder="e.g. Part I: Applicant Information"
              />
            </LabeledSection>
            <LabeledSection
              title="Section Key (Contract Key)"
              icon={FileText}
              description="Optional machine key matching service contract requiredSections (auto-generated from title if blank)."
            >
              <input
                type="text"
                value={field.sectionKey ?? ""}
                onChange={(e) => onUpdateField({ sectionKey: e.target.value })}
                className={`${inputClass} font-mono`}
                placeholder="e.g. applicant_information"
              />
            </LabeledSection>
          </>
        ) : (
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
        )}

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

        <FieldConstraintsEditor field={field} onUpdateField={onUpdateField} />

        {field.type === "repeater" && (
          <RepeaterColumnsEditor field={field} onUpdateField={onUpdateField} />
        )}

        {field.type !== "divider" && (
          <LabeledSection
            title={
              field.type === "section-header"
                ? "Section Visibility & Logic"
                : "Conditional Visibility & Logic"
            }
            icon={EyeOff}
            description={field.type === "section-header"
              ? "Control when this section appears based on Service, Variant, Element, Applicant Type, or parent dependency."
              : "Control when this field appears based on Service, Variant, Element, Applicant Type, or field dependency."}
          >
            <ConditionBuilder field={field} form={form} onUpdateField={onUpdateField} />
          </LabeledSection>
        )}

        {hasOptions && <FieldOptionsEditor field={field} onUpdateField={onUpdateField} />}
      </div>
    </div>
  );
}
