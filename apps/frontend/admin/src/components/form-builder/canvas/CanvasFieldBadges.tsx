"use client";

import React, { useMemo } from "react";
import { FormField } from "../types";
import { parseFieldCondition } from "../utils";

export interface FieldBadgeItem {
  label: string;
  tooltip?: string;
  type: "parent" | "variant" | "service" | "applicant" | "generic";
}

export function CanvasFieldBadges({
  field,
  allFields,
}: {
  field: FormField;
  allFields?: FormField[];
}) {
  const condition = useMemo(() => {
    if (field.condition && typeof field.condition === "object") return field.condition;
    if (field.visibilityCondition) return parseFieldCondition(field.visibilityCondition);
    return undefined;
  }, [field.condition, field.visibilityCondition]);

  const badges = useMemo(() => {
    if (!condition) {
      if (Boolean(field.visibilityCondition && field.visibilityCondition.trim() !== "")) {
        return [{ label: "⚡ Conditional", tooltip: field.visibilityCondition, type: "generic" as const }];
      }
      return [];
    }

    const result: FieldBadgeItem[] = [];
    const deps = condition.fieldDependencies ?? [];
    for (const dep of deps) {
      const parentField = allFields?.find((f) => {
        if (f.id === dep.fieldId) return true;
        const normTarget = dep.fieldId.toLowerCase().replace(/[^a-z0-9]/g, "");
        const normLabel = f.label.toLowerCase().replace(/[^a-z0-9]/g, "");
        return normTarget.length > 0 && normLabel === normTarget;
      });
      const pLabel = parentField ? parentField.label : dep.fieldId;
      const op = dep.operator === "equals" ? "=" : dep.operator === "not_equals" ? "≠" : dep.operator === "is_not_empty" ? "filled" : dep.operator === "is_empty" ? "empty" : dep.operator;
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

    const hasOtherRules = Boolean(
      condition?.fieldDependencies?.length ||
      condition?.services?.length ||
      condition?.serviceCodes?.length ||
      condition?.elements?.length ||
      condition?.applicantTypes?.length
    );

    if (result.length === 0 && hasOtherRules && Boolean(field.visibilityCondition && field.visibilityCondition.trim() !== "")) {
      result.push({
        label: "⚡ Conditional",
        tooltip: field.visibilityCondition,
        type: "generic",
      });
    }

    return result;
  }, [condition, field.visibilityCondition, allFields]);

  if (badges.length === 0) return null;

  return (
    <>
      {badges.map((badge, idx) => (
        <span
          key={`badge-${idx}`}
          title={badge.tooltip || badge.label}
          className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 flex-shrink-0 ${
            badge.type === "parent"
              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700"
              : badge.type === "variant"
              ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60"
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
