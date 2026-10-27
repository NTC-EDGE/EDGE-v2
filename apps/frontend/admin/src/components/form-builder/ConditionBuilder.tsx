"use client";

import React, { useState, useMemo } from "react";
import {
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Building2,
  Layers,
  User,
  GitBranch,
  Info,
} from "lucide-react";
import { FormField, FormSchema, FieldCondition } from "./types";
import { parseFieldCondition } from "./utils";
import {
  NTC_SERVICES,
  NTC_GLOBAL_VARIANTS,
  NTC_GLOBAL_ELEMENTS,
  NTC_CATALOG,
} from "./ntcCatalogConstants";

type DepOperator = "equals" | "not_equals" | "contains" | "is_not_empty" | "is_empty";

function parseDepOperator(val: string): DepOperator {
  if (
    val === "equals" ||
    val === "not_equals" ||
    val === "contains" ||
    val === "is_not_empty" ||
    val === "is_empty"
  ) {
    return val;
  }
  return "equals";
}

const KNOWN_PARENT_FIELD_IDS: Record<string, string> = {
  loss_reason: "fd000000-0000-0000-0000-000000000313",
  complaint_types: "fd000000-0000-0000-0000-000000000327",
  knownByAnotherName: "fd000000-0000-0000-0000-000000000234",
};

function matchesParentField(pf: FormField, rawTargetId: string | undefined): boolean {
  if (!rawTargetId) return false;
  if (pf.id === rawTargetId) return true;
  const mappedId = KNOWN_PARENT_FIELD_IDS[rawTargetId];
  if (mappedId && pf.id.toLowerCase() === mappedId.toLowerCase()) return true;
  const normTarget = rawTargetId.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normLabel = pf.label.toLowerCase().replace(/[^a-z0-9]/g, "");
  return normTarget.length > 0 && normLabel === normTarget;
}

interface ConditionBuilderProps {
  field: FormField;
  form?: FormSchema | null;
  onUpdateField: (updates: Partial<FormField>) => void;
}

export function ConditionBuilder({
  field,
  form,
  onUpdateField,
}: ConditionBuilderProps) {
  const [activeTab, setActiveTab] = useState<
    "services" | "variants" | "elements" | "applicant" | "field" | null
  >(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllVariants, setShowAllVariants] = useState(false);
  const [showAllElements, setShowAllElements] = useState(false);

  // Extract condition from field.condition or parse from field.visibilityCondition
  const condition: FieldCondition = useMemo(() => {
    if (field.condition && typeof field.condition === "object") {
      return field.condition;
    }
    return parseFieldCondition(field.visibilityCondition) ?? {};
  }, [field.condition, field.visibilityCondition]);

  const selectedServices = condition.services ?? [];
  const selectedVariants = condition.variants ?? [];
  const selectedApplicationTypes = condition.applicationTypes ?? [];
  const selectedElements = condition.elements ?? [];
  const selectedApplicantTypes = condition.applicantTypes ?? [];
  const fieldDependencies = condition.fieldDependencies ?? [];

  const hasAnyCondition =
    selectedServices.length > 0 ||
    selectedVariants.length > 0 ||
    selectedApplicationTypes.length > 0 ||
    selectedElements.length > 0 ||
    selectedApplicantTypes.length > 0 ||
    fieldDependencies.length > 0;

  // Catalog data for the current form's associated service (case-insensitive & fuzzy match)
  const currentServiceCatalog = useMemo(() => {
    if (!form?.serviceName) return null;
    const direct = NTC_CATALOG[form.serviceName];
    if (direct) return direct;

    const targetUpper = form.serviceName.toUpperCase().trim();
    const upperMatch = NTC_CATALOG[targetUpper];
    if (upperMatch) return upperMatch;

    for (const [key, item] of Object.entries(NTC_CATALOG)) {
      const keyUpper = key.toUpperCase().trim();
      if (keyUpper === targetUpper || keyUpper.includes(targetUpper) || targetUpper.includes(keyUpper)) {
        return item;
      }
    }
    return null;
  }, [form?.serviceName]);

  const availableServices = NTC_SERVICES;

  const availableVariants = useMemo(() => {
    const list: string[] = [];
    if (currentServiceCatalog && currentServiceCatalog.variants.length > 0) {
      for (const v of currentServiceCatalog.variants) {
        if (!list.includes(v)) list.push(v);
      }
    }
    if (selectedServices.length > 0) {
      for (const s of selectedServices) {
        const item = NTC_CATALOG[s] ?? NTC_CATALOG[s.toUpperCase().trim()];
        if (item) {
          for (const v of item.variants) {
            if (!list.includes(v)) list.push(v);
          }
        }
      }
    }
    if (showAllVariants || list.length === 0) {
      for (const v of NTC_GLOBAL_VARIANTS) {
        if (!list.includes(v)) list.push(v);
      }
    }
    return list;
  }, [showAllVariants, currentServiceCatalog, selectedServices]);

  const availableApplicationTypes = useMemo(() => {
    const list: string[] = [];
    if (currentServiceCatalog && currentServiceCatalog.applicationTypes.length > 0) {
      for (const t of currentServiceCatalog.applicationTypes) {
        if (!list.includes(t)) list.push(t);
      }
    }
    if (selectedServices.length > 0) {
      for (const s of selectedServices) {
        const item = NTC_CATALOG[s] ?? NTC_CATALOG[s.toUpperCase().trim()];
        if (item) {
          for (const t of item.applicationTypes) {
            if (!list.includes(t)) list.push(t);
          }
        }
      }
    }
    return list;
  }, [currentServiceCatalog, selectedServices]);

  const availableElements = useMemo(() => {
    if (!showAllElements && currentServiceCatalog && currentServiceCatalog.elements.length > 0) {
      return currentServiceCatalog.elements;
    }
    return NTC_GLOBAL_ELEMENTS;
  }, [showAllElements, currentServiceCatalog]);

  const candidateParentFields = useMemo(() => {
    return (form?.fields ?? []).filter(
      (f) => f.id !== field.id && f.type !== "section-header" && f.type !== "divider"
    );
  }, [form?.fields, field.id]);

  const updateCondition = (newCondition: FieldCondition) => {
    const hasRules = Boolean(
      (newCondition.services && newCondition.services.length > 0) ||
      (newCondition.variants && newCondition.variants.length > 0) ||
      (newCondition.applicationTypes && newCondition.applicationTypes.length > 0) ||
      (newCondition.elements && newCondition.elements.length > 0) ||
      (newCondition.applicantTypes && newCondition.applicantTypes.length > 0) ||
      (newCondition.fieldDependencies && newCondition.fieldDependencies.length > 0)
    );

    if (!hasRules) {
      onUpdateField({
        condition: undefined,
        visibilityCondition: undefined,
      });
    } else {
      onUpdateField({
        condition: newCondition,
        visibilityCondition: JSON.stringify(newCondition),
      });
    }
  };

  const toggleService = (service: string) => {
    const exists = selectedServices.includes(service);
    const updated = exists
      ? selectedServices.filter((s) => s !== service)
      : [...selectedServices, service];
    updateCondition({
      ...condition,
      services: updated.length > 0 ? updated : undefined,
    });
  };

  const toggleVariant = (variant: string) => {
    const exists = selectedVariants.includes(variant);
    const updated = exists
      ? selectedVariants.filter((v) => v !== variant)
      : [...selectedVariants, variant];
    updateCondition({
      ...condition,
      variants: updated.length > 0 ? updated : undefined,
    });
  };

  const toggleApplicationType = (appType: string) => {
    const exists = selectedApplicationTypes.includes(appType);
    const updated = exists
      ? selectedApplicationTypes.filter((t) => t !== appType)
      : [...selectedApplicationTypes, appType];
    updateCondition({
      ...condition,
      applicationTypes: updated.length > 0 ? updated : undefined,
    });
  };

  const toggleElement = (element: string) => {
    const exists = selectedElements.includes(element);
    const updated = exists
      ? selectedElements.filter((e) => e !== element)
      : [...selectedElements, element];
    updateCondition({
      ...condition,
      elements: updated.length > 0 ? updated : undefined,
    });
  };

  const setApplicantType = (type: "all" | "individual" | "company") => {
    if (type === "all") {
      updateCondition({
        ...condition,
        applicantTypes: undefined,
      });
    } else {
      updateCondition({
        ...condition,
        applicantTypes: [type],
      });
    }
  };

  const updateParentFieldDep = (
    parentFieldId: string,
    operator: "equals" | "not_equals" | "contains" | "is_not_empty" | "is_empty",
    value: string
  ) => {
    if (!parentFieldId) {
      updateCondition({
        ...condition,
        fieldDependencies: undefined,
      });
      return;
    }
    updateCondition({
      ...condition,
      fieldDependencies: [
        {
          fieldId: parentFieldId,
          operator,
          value: operator === "is_not_empty" || operator === "is_empty" ? undefined : value,
        },
      ],
    });
  };

  const clearAllConditions = () => {
    onUpdateField({
      condition: undefined,
      visibilityCondition: undefined,
    });
    setActiveTab(null);
  };

  const activeParentDep = fieldDependencies[0];
  const selectedParentField = candidateParentFields.find((f) =>
    matchesParentField(f, activeParentDep?.fieldId)
  );

  return (
    <div className="space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
      {/* Visibility Mode Switch */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
            Visibility Mode
          </label>
          <p className="text-[10px] text-slate-400">
            {hasAnyCondition
              ? "Shows conditionally based on rules below"
              : "Always visible to all applicants"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              if (hasAnyCondition) {
                clearAllConditions();
              } else {
                setActiveTab("variants");
              }
            }}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
              hasAnyCondition
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300"
            }`}
          >
            {hasAnyCondition ? "Conditional" : "Always Visible"}
          </button>
        </div>
      </div>

      {/* Condition Summary Chip Bar */}
      {hasAnyCondition && (
        <div className="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
              <Sliders className="w-3 h-3" />
              Active Filters
            </span>
            <button
              type="button"
              onClick={clearAllConditions}
              className="text-[10px] text-slate-400 hover:text-rose-500 font-semibold"
            >
              Reset to Always Visible
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedServices.length > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Building2 className="w-2.5 h-2.5" />
                {selectedServices.length} Service{selectedServices.length > 1 ? "s" : ""}
              </span>
            )}
            {selectedVariants.length > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <GitBranch className="w-2.5 h-2.5" />
                {selectedVariants.join(", ")}
              </span>
            )}
            {selectedApplicationTypes.length > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                <Layers className="w-2.5 h-2.5" />
                {selectedApplicationTypes.length} App Type{selectedApplicationTypes.length > 1 ? "s" : ""}
              </span>
            )}
            {selectedElements.length > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {selectedElements.length} Element{selectedElements.length > 1 ? "s" : ""}
              </span>
            )}
            {selectedApplicantTypes.length > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <User className="w-2.5 h-2.5" />
                {selectedApplicantTypes[0] === "individual" ? "Individual Only" : "Company Only"}
              </span>
            )}
            {fieldDependencies.length > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Depends on {selectedParentField?.label || "Field"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Accordion Categories */}
      <div className="space-y-1.5 pt-1">
        {/* 1. Services Filter */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "services" ? null : "services")}
            className="w-full flex items-center justify-between p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                Service Scope (For Shared Forms)
              </span>
              {selectedServices.length > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-mono">
                  {selectedServices.length}
                </span>
              )}
            </div>
            {activeTab === "services" ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {activeTab === "services" && (
            <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-[10px] text-slate-400">
                Select which service(s) this field applies to. Leave unselected if this field applies to all services using this form.
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {(showAllServices ? availableServices : availableServices.slice(0, 8)).map(
                  (svc) => {
                    const isSelected = selectedServices.includes(svc);
                    return (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => toggleService(svc)}
                        className={`w-full flex items-center justify-between p-1.5 rounded text-left text-[11px] transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 font-medium"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className="truncate pr-1">{svc}</span>
                        {isSelected && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                      </button>
                    );
                  }
                )}
              </div>
              {availableServices.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAllServices(!showAllServices)}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  {showAllServices
                    ? "Show less"
                    : `Show all ${availableServices.length} services...`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. Application Types & Variants Filter */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "variants" ? null : "variants")}
            className="w-full flex items-center justify-between p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <GitBranch className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                Variants & Application Types
              </span>
              {(selectedVariants.length > 0 || selectedApplicationTypes.length > 0) && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-mono">
                  {selectedVariants.length + selectedApplicationTypes.length}
                </span>
              )}
            </div>
            {activeTab === "variants" ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {activeTab === "variants" && (
            <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {/* Variants (NEW, RENEWAL, FIRST TAKER, etc.) */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Filing Variants (Exact NTC Terms)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableVariants.map((v) => {
                    const isSelected = selectedVariants.includes(v);
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => toggleVariant(v)}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                          isSelected
                            ? "bg-purple-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
                {currentServiceCatalog && currentServiceCatalog.variants.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllVariants(!showAllVariants)}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold mt-1.5 block"
                  >
                    {showAllVariants ? "Show service-specific variants only" : "Show all NTC variants..."}
                  </button>
                )}
              </div>

              {/* Specific Application Types (Radiotelegraphy, Aircraft, etc.) */}
              {availableApplicationTypes.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Application Types for this Service
                  </label>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {availableApplicationTypes.map((appType) => {
                      const isSelected = selectedApplicationTypes.includes(appType);
                      return (
                        <button
                          key={appType}
                          type="button"
                          onClick={() => toggleApplicationType(appType)}
                          className={`w-full flex items-center justify-between p-1.5 rounded text-left text-[11px] transition-colors ${
                            isSelected
                              ? "bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 font-medium"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span className="truncate pr-1">{appType}</span>
                          {isSelected && <Check className="w-3 h-3 text-purple-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Elements Filter */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "elements" ? null : "elements")}
            className="w-full flex items-center justify-between p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Layers className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                Exam / Station Elements
              </span>
              {selectedElements.length > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-mono">
                  {selectedElements.length}
                </span>
              )}
            </div>
            {activeTab === "elements" ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {activeTab === "elements" && (
            <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-[10px] text-slate-400">
                Filter by exam element or station class (e.g. 1RTG, 1PHN, Class A, MAIN, BRANCH).
              </p>
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                {availableElements.map((elem) => {
                  const isSelected = selectedElements.includes(elem);
                  return (
                    <button
                      key={elem}
                      type="button"
                      onClick={() => toggleElement(elem)}
                      className={`w-full flex items-center justify-between p-1.5 rounded text-left text-[11px] transition-colors ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-medium"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="truncate pr-1">{elem}</span>
                      {isSelected && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {currentServiceCatalog && currentServiceCatalog.elements.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllElements(!showAllElements)}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  {showAllElements ? "Show service-specific elements only" : "Show all NTC elements..."}
                </button>
              )}
            </div>
          )}
        </div>

        {/* 4. Applicant Entity Type */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "applicant" ? null : "applicant")}
            className="w-full flex items-center justify-between p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                Applicant Entity Type
              </span>
              {selectedApplicantTypes.length > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                  {selectedApplicantTypes[0]}
                </span>
              )}
            </div>
            {activeTab === "applicant" ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {activeTab === "applicant" && (
            <div className="p-2.5 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { key: "all", label: "All Applicants" },
                    { key: "individual", label: "Individual" },
                    { key: "company", label: "Company / Juridical" },
                  ] as const
                ).map((opt) => {
                  const isSelected =
                    opt.key === "all"
                      ? selectedApplicantTypes.length === 0
                      : selectedApplicantTypes.includes(opt.key);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setApplicantType(opt.key)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all text-center ${
                        isSelected
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 5. Parent Field Dependency */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "field" ? null : "field")}
            className="w-full flex items-center justify-between p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Sliders className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                Field Dependency (Inter-field Rule)
              </span>
              {fieldDependencies.length > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-mono">
                  1 Rule
                </span>
              )}
            </div>
            {activeTab === "field" ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {activeTab === "field" && (
            <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {candidateParentFields.length === 0 ? (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  Add at least one other field to your form to create dependencies.
                </p>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Parent Field (Controller)
                    </label>
                    <select
                      value={selectedParentField?.id ?? activeParentDep?.fieldId ?? ""}
                      onChange={(e) => {
                        const newPid = e.target.value;
                        const pField = candidateParentFields.find((f) => f.id === newPid);
                        const defaultVal =
                          pField?.options?.[0]?.value || pField?.options?.[0]?.label || "";
                        updateParentFieldDep(
                          newPid,
                          activeParentDep?.operator ?? "equals",
                          defaultVal
                        );
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <option value="">— Select parent field —</option>
                      {candidateParentFields.map((pf) => (
                        <option key={pf.id} value={pf.id}>
                          {pf.label || "Untitled Field"} ({pf.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeParentDep?.fieldId && (
                    <>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                          Condition Operator
                        </label>
                        <select
                          value={activeParentDep?.operator ?? "equals"}
                          onChange={(e) =>
                            updateParentFieldDep(
                              selectedParentField?.id ?? activeParentDep.fieldId,
                              parseDepOperator(e.target.value),
                              activeParentDep.value ?? ""
                            )
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                          <option value="equals">Equals (Value matches)</option>
                          <option value="not_equals">Not Equals (Value does not match)</option>
                          <option value="contains">Contains text</option>
                          <option value="is_not_empty">Has Any Value (Not empty)</option>
                          <option value="is_empty">Is Empty</option>
                        </select>
                      </div>

                      {activeParentDep.operator !== "is_not_empty" &&
                        activeParentDep.operator !== "is_empty" && (
                          <div>
                            <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                              Trigger Value
                            </label>
                            {selectedParentField &&
                            selectedParentField.options &&
                            selectedParentField.options.length > 0 ? (
                              <select
                                value={activeParentDep.value ?? ""}
                                onChange={(e) =>
                                  updateParentFieldDep(
                                    selectedParentField?.id ?? activeParentDep.fieldId,
                                    activeParentDep.operator,
                                    e.target.value
                                  )
                                }
                                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                              >
                                <option value="">— Select trigger choice —</option>
                                {selectedParentField.options.map((opt) => (
                                  <option key={opt.id} value={opt.value}>
                                    {opt.label} ({opt.value})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={activeParentDep.value ?? ""}
                                onChange={(e) =>
                                  updateParentFieldDep(
                                    selectedParentField?.id ?? activeParentDep.fieldId,
                                    activeParentDep.operator,
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. Option 1, Yes, Verified..."
                                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                              />
                            )}
                          </div>
                        )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
