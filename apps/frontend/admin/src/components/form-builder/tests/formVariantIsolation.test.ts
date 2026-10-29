// @ts-expect-error - bun test runtime module
import { describe, it, expect } from "bun:test";
import { FormField } from "../types";
import {
  isFieldApplicableForVariant,
  variantNamesMatch,
  excludeVariantFromField,
  deleteFieldOrSectionForVariant,
} from "../utils";

describe("Form Builder - Variant Isolation and Base Form Propagation", () => {
  const allVariants = ["Commercial Broadcast", "Amateur Radio (NTC 1-09)"];

  it("base form field propagates cleanly to all dependent variants when unedited", () => {
    const baseField: FormField = {
      id: "f-base-1",
      type: "text",
      label: "Official Applicant Name",
      required: true,
    };

    expect(isFieldApplicableForVariant(baseField, "ALL")).toBe(true);
    expect(isFieldApplicableForVariant(baseField, "Commercial Broadcast")).toBe(true);
    expect(isFieldApplicableForVariant(baseField, "Amateur Radio (NTC 1-09)")).toBe(true);

    const updatedBase: FormField = { ...baseField, label: "Updated Base Applicant Name" };
    expect(isFieldApplicableForVariant(updatedBase, "Commercial Broadcast")).toBe(true);
    expect(isFieldApplicableForVariant(updatedBase, "Amateur Radio (NTC 1-09)")).toBe(true);
  });

  it("customizing a field under a variant creates isolated override and avoids duplicates", () => {
    const baseField: FormField = {
      id: "f-tax-id",
      type: "text",
      label: "Standard Tax ID",
      required: false,
    };

    const excludedBase = excludeVariantFromField(baseField, "Commercial Broadcast", allVariants);
    const forkedVariantField: FormField = {
      ...baseField,
      id: "f-tax-id-commercial",
      label: "Commercial Broadcast Entity TIN",
      required: true,
      condition: { variants: ["Commercial Broadcast"] },
      visibilityCondition: JSON.stringify({ variants: ["Commercial Broadcast"] }),
    };

    const formFields = [excludedBase, forkedVariantField];

    const fieldsInAll = formFields.filter((f) => isFieldApplicableForVariant(f, "ALL"));
    expect(fieldsInAll.length).toBe(1);
    expect(fieldsInAll[0]?.id).toBe("f-tax-id");
    expect(fieldsInAll[0]?.label).toBe("Standard Tax ID");

    const fieldsInCommercial = formFields.filter((f) =>
      isFieldApplicableForVariant(f, "Commercial Broadcast")
    );
    expect(fieldsInCommercial.length).toBe(1);
    expect(fieldsInCommercial[0]?.id).toBe("f-tax-id-commercial");
    expect(fieldsInCommercial[0]?.label).toBe("Commercial Broadcast Entity TIN");
    expect(fieldsInCommercial[0]?.required).toBe(true);

    const fieldsInAmateur = formFields.filter((f) =>
      isFieldApplicableForVariant(f, "Amateur Radio (NTC 1-09)")
    );
    expect(fieldsInAmateur.length).toBe(1);
    expect(fieldsInAmateur[0]?.id).toBe("f-tax-id");
    expect(fieldsInAmateur[0]?.label).toBe("Standard Tax ID");
  });

  it("subsequent base form updates propagate to dependent variants without altering customized variant", () => {
    const excludedBase: FormField = {
      id: "f-email",
      type: "email",
      label: "Contact Email",
      placeholder: "name@domain.gov.ph",
      required: true,
      condition: { excludedVariants: ["Commercial Broadcast"] },
    };

    const customizedCommercial: FormField = {
      id: "f-email-commercial",
      type: "email",
      label: "Official Broadcast Station Corporate Email",
      placeholder: "broadcast@network.com",
      required: true,
      condition: { variants: ["Commercial Broadcast"] },
    };

    const modifiedBase: FormField = {
      ...excludedBase,
      label: "Official Primary Contact Email",
      placeholder: "contact@agency.gov.ph",
    };

    expect(isFieldApplicableForVariant(modifiedBase, "Amateur Radio (NTC 1-09)")).toBe(true);
    expect(modifiedBase.label).toBe("Official Primary Contact Email");
    expect(modifiedBase.placeholder).toBe("contact@agency.gov.ph");

    expect(isFieldApplicableForVariant(customizedCommercial, "Commercial Broadcast")).toBe(true);
    expect(customizedCommercial.label).toBe("Official Broadcast Station Corporate Email");
    expect(customizedCommercial.placeholder).toBe("broadcast@network.com");
  });

  it("section header title customization isolates per variant and preserves base title", () => {
    const sectionHeader: FormField = {
      id: "sec-technical",
      type: "section-header",
      label: "Technical Parameters",
      sectionTitle: "Technical Parameters",
      required: false,
      variantTitles: {
        "Commercial Broadcast": "Transmitter Power & Broadcast Frequency Specs",
      },
    };

    const resolveTitle = (field: FormField, variant: string): string => {
      if (variant !== "ALL" && field.variantTitles && variant in field.variantTitles) {
        const custom = field.variantTitles[variant];
        if (custom) return custom;
      }
      return field.sectionTitle || field.label;
    };

    expect(resolveTitle(sectionHeader, "ALL")).toBe("Technical Parameters");
    expect(resolveTitle(sectionHeader, "Commercial Broadcast")).toBe(
      "Transmitter Power & Broadcast Frequency Specs"
    );
    expect(resolveTitle(sectionHeader, "Amateur Radio (NTC 1-09)")).toBe("Technical Parameters");
  });

  it("deleting a base field under a variant adds exclusion instead of removing from base form", () => {
    const fields: FormField[] = [
      { id: "sec-1", type: "section-header", label: "General", required: false },
      { id: "f-serial", type: "text", label: "Radio Serial Number", required: true },
      { id: "f-notes", type: "textarea", label: "Special Remarks", required: false },
    ];

    const result = deleteFieldOrSectionForVariant(
      fields,
      "f-serial",
      "Commercial Broadcast",
      allVariants
    );

    expect(result.length).toBe(3);
    const target = result.find((f) => f.id === "f-serial");
    expect(target).toBeDefined();
    expect(target?.condition?.excludedVariants).toContain("Commercial Broadcast");

    expect(isFieldApplicableForVariant(target ?? fields[1], "Commercial Broadcast")).toBe(false);
    expect(isFieldApplicableForVariant(target ?? fields[1], "ALL")).toBe(true);
    expect(isFieldApplicableForVariant(target ?? fields[1], "Amateur Radio (NTC 1-09)")).toBe(true);
  });

  it("normalizes variant names with parenthetical descriptors", () => {
    expect(variantNamesMatch("Amateur Radio", "Amateur Radio (NTC 1-09)")).toBe(true);
    expect(variantNamesMatch("Amateur Radio (NTC 1-09)", "Amateur Radio")).toBe(true);
    expect(variantNamesMatch("Commercial Broadcast", "Amateur Radio")).toBe(false);
  });
});
