import { useState, useCallback, useMemo, useEffect } from "react";
import { FormField, FormSchema } from "../types";
import { parseFieldCondition, isFieldApplicableForVariant } from "../utils";

export interface SectionGroup {
  id: string;
  headerField: FormField | null;
  headerIndex: number;
  title: string;
  childFields: Array<{ field: FormField; originalIndex: number }>;
}

export function useCanvasSections(
  form: FormSchema,
  selectedVariant: string,
  selectedFieldId: string | null,
  onSelectField: (id: string | null) => void
) {
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(new Set());

  const toggleSectionCollapse = useCallback((sectionId: string) => {
    setCollapsedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  const collapseAllSections = useCallback(() => {
    const allSectionIds = form.fields
      .filter((f) => f.type === "section-header")
      .map((f) => f.id);
    if (allSectionIds.length === 0) allSectionIds.push("default-section");
    setCollapsedSectionIds(new Set(allSectionIds));
  }, [form.fields]);

  const expandAllSections = useCallback(() => {
    setCollapsedSectionIds(new Set());
  }, []);

  const sectionGroups: SectionGroup[] = useMemo(() => {
    const groups: SectionGroup[] = [];
    let currentGroup: SectionGroup = {
      id: "default-section",
      headerField: null,
      headerIndex: -1,
      title: "General Information",
      childFields: [],
    };

    form.fields.forEach((field, index) => {
      if (field.type === "section-header") {
        if (currentGroup.headerField !== null || currentGroup.childFields.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = {
          id: field.id,
          headerField: field,
          headerIndex: index,
          title: field.sectionTitle || field.label || "Untitled Section",
          childFields: [],
        };
      } else {
        currentGroup.childFields.push({ field, originalIndex: index });
      }
    });

    if (currentGroup.headerField !== null || currentGroup.childFields.length > 0) {
      groups.push(currentGroup);
    }
    return groups;
  }, [form.fields]);

  const isSectionApplicable = useCallback(
    (
      headerField: FormField | null,
      childFields: Array<{ field: FormField; originalIndex: number }>
    ): boolean => {
      if (headerField && !isFieldApplicableForVariant(headerField, selectedVariant)) {
        return false;
      }

      const applicableChildCount = childFields.filter((cf) =>
        isFieldApplicableForVariant(cf.field, selectedVariant)
      ).length;
      if (applicableChildCount > 0) return true;

      if (childFields.length === 0 && headerField) {
        return isFieldApplicableForVariant(headerField, selectedVariant);
      }

      return false;
    },
    [selectedVariant]
  );

  const displayedSectionGroups = useMemo(() => {
    return sectionGroups
      .filter((group) => isSectionApplicable(group.headerField, group.childFields))
      .map((group) => ({
        ...group,
        childFields: group.childFields.filter((cf) =>
          isFieldApplicableForVariant(cf.field, selectedVariant)
        ),
      }));
  }, [sectionGroups, selectedVariant, isSectionApplicable]);

  const applicableFieldsCount = useMemo(() => {
    return displayedSectionGroups.reduce(
      (sum, g) => sum + (g.headerField ? 1 : 0) + g.childFields.length,
      0
    );
  }, [displayedSectionGroups]);

  useEffect(() => {
    if (selectedFieldId !== null && selectedVariant !== "ALL") {
      const visibleFieldIds = new Set(
        displayedSectionGroups.flatMap((g) => [
          ...(g.headerField ? [g.headerField.id] : []),
          ...g.childFields.map((cf) => cf.field.id),
        ])
      );
      if (!visibleFieldIds.has(selectedFieldId)) {
        onSelectField(null);
      }
    }
  }, [selectedVariant, displayedSectionGroups, selectedFieldId, onSelectField]);

  const sectionCount = form.fields.filter((f) => f.type === "section-header").length;

  return {
    collapsedSectionIds,
    toggleSectionCollapse,
    collapseAllSections,
    expandAllSections,
    sectionGroups,
    displayedSectionGroups,
    applicableFieldsCount,
    sectionCount,
  };
}
