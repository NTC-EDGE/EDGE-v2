"use client";

import React, { useMemo } from "react";
import { FormField, ServiceVariantToolbarItem } from "../types";
import { parseFieldCondition } from "../utils/fieldParsers";
import { isFieldUnusedByAllVariants } from "../utils/variantConditionUtils";

export interface FieldBadgeItem {
  label: string;
  tooltip?: string;
  type: "parent" | "variant" | "excluded" | "override" | "unused" | "service" | "applicant" | "generic";
}

export function CanvasFieldBadges({
  field,
  allFields,
  selectedVariant = "ALL",
  formVariants = [],
}: {
  field: FormField;
  allFields?: FormField[];
  selectedVariant?: string;
  formVariants?: ServiceVariantToolbarItem[];
}) {
  const condition = useMemo(() => {
    if (field.condition && typeof field.condition === "object") return field.condition;
    if (field.visibilityCondition) return parseFieldCondition(field.visibilityCondition);
    return undefined;
  }, [field.condition, field.visibilityCondition]);

  const badges = useMemo(() => {
    const result: FieldBadgeItem[] = [];
    const isAllView = !selectedVariant || selectedVariant === "ALL";

    if (isAllView && formVariants.length > 0 && isFieldUnusedByAllVariants(field, formVariants)) {
      result.push({
        label: "🗑️ Unused (0 Variants — Deletable)",
        tooltip: "Not used by any Service Variant. Safe to delete permanently in All Sections & Fields.",
        type: "unused",
      });
    } else if (condition) {
      const realVariants = (condition.variants ?? []).filter((v) => v.trim().toUpperCase() !== "__NONE__");
      const appTypes = condition.applicationTypes ?? [];
      if (realVariants.length > 0) {
        result.push({
          label:
            realVariants.length === 1
              ? `🎯 Only: ${realVariants[0]}`
              : `🎯 Only: ${realVariants.length} Variants`,
          tooltip: `Applies exclusively to: ${realVariants.join(", ")}`,
          type: "variant",
        });
      } else if (appTypes.length > 0) {
        result.push({
          label: `🎯 App Type: ${appTypes.join(", ")}`,
          tooltip: `Applies to application types: ${appTypes.join(", ")}`,
          type: "variant",
        });
      }

      const excluded = condition.excludedVariants ?? [];
      if (isAllView && excluded.length > 0) {
        result.push({
          label:
            excluded.length === 1
              ? `🚫 Hidden in: ${excluded[0]}`
              : `🚫 Hidden in ${excluded.length} Variants`,
          tooltip: `Excluded from: ${excluded.join(", ")}`,
          type: "excluded",
        });
      }
    }

    if (isAllView && field.variantOverrides) {
      const overrideKeys = Object.keys(field.variantOverrides);
      if (overrideKeys.length > 0) {
        result.push({
          label:
            overrideKeys.length === 1
              ? `✨ Customized in ${overrideKeys[0]}`
              : `✨ Customized in ${overrideKeys.length} Variants`,
          tooltip: `Has variant-specific property overrides in: ${overrideKeys.join(", ")}`,
          type: "override",
        });
      }
    }

    if (condition) {
      const deps = condition.fieldDependencies ?? [];
      for (const dep of deps) {
        const parentField = allFields?.find((f) => {
          if (f.id === dep.fieldId) return true;
          const normTarget = dep.fieldId.toLowerCase().replace(/[^a-z0-9]/g, "");
          const normLabel = f.label.toLowerCase().replace(/[^a-z0-9]/g, "");
          return normTarget.length > 0 && normLabel === normTarget;
        });
        const pLabel = parentField ? parentField.label : dep.fieldId;
        const op =
          dep.operator === "equals"
            ? "="
            : dep.operator === "not_equals"
            ? "≠"
            : dep.operator === "is_not_empty"
            ? "filled"
            : dep.operator === "is_empty"
            ? "empty"
            : dep.operator;
        const valStr = dep.value ? ` "${dep.value}"` : "";
        result.push({
          label: `🔗 Depends on: ${pLabel} ${op}${valStr}`,
          tooltip: `Shown only when "${pLabel}" is ${op}${valStr}`,
          type: "parent",
        });
      }

      const services = condition.services ?? [];
      if (services.length > 0) {
        result.push({
          label: services.length === 1 ? `📁 ${services[0]}` : `📁 ${services.length} Services`,
          tooltip: `Applies to services: ${services.join(", ")}`,
          type: "service",
        });
      }

      const applicantTypes = condition.applicantTypes ?? [];
      if (applicantTypes.length > 0) {
        result.push({
          label: `👤 ${applicantTypes.join("/")}`,
          tooltip: `Applicant type: ${applicantTypes.join(", ")}`,
          type: "applicant",
        });
      }
    }

    if (result.length === 0 && Boolean(field.visibilityCondition && field.visibilityCondition.trim() !== "")) {
      result.push({
        label: "⚡ Conditional",
        tooltip: field.visibilityCondition,
        type: "generic",
      });
    }

    return result;
  }, [condition, field, allFields, selectedVariant, formVariants]);

  if (badges.length === 0) return null;

  return (
    <>
      {badges.map((badge, idx) => (
        <span
          key={`badge-${idx}`}
          title={badge.tooltip || badge.label}
          className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 flex-shrink-0 max-w-[260px] truncate ${
            badge.type === "parent"
              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700"
              : badge.type === "variant"
              ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60"
              : badge.type === "excluded"
              ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60"
              : badge.type === "override"
              ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60"
              : badge.type === "unused"
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
              : badge.type === "service"
              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          }`}
        >
          {badge.label}
        </span>
      ))}
    </>
  );
}
