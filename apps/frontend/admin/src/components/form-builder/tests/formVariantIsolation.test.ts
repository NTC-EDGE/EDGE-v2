// @ts-expect-error - bun test runtime module
import { describe, it, expect } from "bun:test";
import { FormField, FormSchema, ServiceVariantToolbarItem } from "../types";
import {
  isFieldApplicableForVariant,
  variantNamesMatch,
  deleteFieldOrSectionForVariant,
  applyVariantPropertyOverride,
  resolveFieldForVariant,
  getVariantsUsingField,
  isFieldUnusedByAllVariants,
  detectSharedChangesImpact,
  formatServiceVariantDisplayName,
} from "../utils";

describe("Form Builder - Master Superset, Variant Overrides, Propagation & Deletion Guards", () => {
  const allVariants = ["Commercial Broadcast", "Amateur Radio (NTC 1-09)"];
  const toolbarVariants: ServiceVariantToolbarItem[] = [
    { id: "v-1", name: "Commercial Broadcast", source: "service" },
    { id: "v-2", name: "Amateur Radio (NTC 1-09)", source: "service" },
  ];

  it("base form field and variant-added fields ALL appear in All Sections & Fields ('ALL')", () => {
    const baseField: FormField = {
      id: "f-base-1",
      type: "text",
      label: "Official Applicant Name",
      required: true,
    };
    const variantAddedField: FormField = {
      id: "f-var-extra",
      type: "text",
      label: "Broadcast Transmitter License Ref",
      required: true,
      condition: { variants: ["Commercial Broadcast"] },
    };

    expect(isFieldApplicableForVariant(baseField, "ALL")).toBe(true);
    expect(isFieldApplicableForVariant(variantAddedField, "ALL")).toBe(true);
    expect(isFieldApplicableForVariant(variantAddedField, "Commercial Broadcast")).toBe(true);
    expect(isFieldApplicableForVariant(variantAddedField, "Amateur Radio (NTC 1-09)")).toBe(false);
  });

  it("editing a shared base field inside a Variant stores a clean variantOverride without duplicating or mutating Base Form", () => {
    const baseField: FormField = {
      id: "f-tax-id",
      type: "text",
      label: "Standard Tax ID",
      required: false,
      placeholder: "000-000-000",
    };

    const overridden = applyVariantPropertyOverride(baseField, "Commercial Broadcast", {
      label: "Commercial Broadcast Entity TIN",
      required: true,
      placeholder: "999-888-777-000",
    });

    // All Sections & Fields keeps original Base Form properties intact
    const inAllView = resolveFieldForVariant(overridden, "ALL");
    expect(inAllView.label).toBe("Standard Tax ID");
    expect(inAllView.required).toBe(false);

    // Commercial Broadcast sees its customized properties
    const inCommercial = resolveFieldForVariant(overridden, "Commercial Broadcast");
    expect(inCommercial.label).toBe("Commercial Broadcast Entity TIN");
    expect(inCommercial.required).toBe(true);
    expect(inCommercial.placeholder).toBe("999-888-777-000");

    // Amateur Radio continues inheriting Base Form properties
    const inAmateur = resolveFieldForVariant(overridden, "Amateur Radio (NTC 1-09)");
    expect(inAmateur.label).toBe("Standard Tax ID");
    expect(inAmateur.required).toBe(false);
  });

  it("deletion guard identifies fields used by Service Variants vs unused fields safe to delete in All Sections", () => {
    const fields: FormField[] = [
      { id: "sec-1", type: "section-header", label: "General", required: false },
      { id: "f-serial", type: "text", label: "Radio Serial Number", required: true },
      {
        id: "f-only-comm",
        type: "text",
        label: "Broadcast Studio Address",
        required: true,
        condition: { variants: ["Commercial Broadcast"] },
      },
    ];

    const serialField = fields[1];
    const commOnlyField = fields[2];
    expect(serialField).toBeDefined();
    expect(commOnlyField).toBeDefined();
    if (serialField && commOnlyField) {
      // Both fields are currently used by >= 1 Service Variant -> locked from deletion in All Sections
      expect(getVariantsUsingField(serialField, toolbarVariants).length).toBe(2);
      expect(getVariantsUsingField(commOnlyField, toolbarVariants).length).toBe(1);
      expect(isFieldUnusedByAllVariants(commOnlyField, toolbarVariants)).toBe(false);
    }

    // Remove f-only-comm from Commercial Broadcast -> becomes unused (0 variants) while staying visible in All Sections!
    const afterRemoveInComm = deleteFieldOrSectionForVariant(
      fields,
      "f-only-comm",
      "Commercial Broadcast",
      allVariants
    );
    const removedField = afterRemoveInComm.find((f) => f.id === "f-only-comm");
    expect(removedField).toBeDefined();
    if (removedField) {
      expect(isFieldApplicableForVariant(removedField, "ALL")).toBe(true);
      expect(isFieldApplicableForVariant(removedField, "Commercial Broadcast")).toBe(false);
      expect(getVariantsUsingField(removedField, toolbarVariants).length).toBe(0);
      expect(isFieldUnusedByAllVariants(removedField, toolbarVariants)).toBe(true);
    }
  });

  it("detectSharedChangesImpact detects renamed labels or updated options in All Sections used by Service Variants", () => {
    const orig: FormSchema = {
      id: "form-1",
      name: "NTC 1-09",
      description: "",
      version: "1.0",
      createdAt: "",
      updatedAt: "",
      isPublished: true,
      fields: [
        { id: "f-1", type: "text", label: "Call Sign", required: true },
      ],
    };
    const edited: FormSchema = {
      ...orig,
      fields: [
        { id: "f-1", type: "text", label: "Official Station Call Sign", required: true },
      ],
    };

    const impact = detectSharedChangesImpact(orig, edited, toolbarVariants, ["Commercial Broadcast"]);
    expect(impact.hasSharedUpdates).toBe(true);
    expect(impact.affectedVariantNames.length).toBe(2);
    expect(impact.affectedCustomizedVariantNames).toEqual(["Commercial Broadcast"]);
  });

  it("formatServiceVariantDisplayName strips (NA) and avoids duplicate parenthetical suffixes", () => {
    expect(formatServiceVariantDisplayName("Permit to Purchase", "NA")).toBe("Permit to Purchase");
    expect(formatServiceVariantDisplayName("Commercial ROC (Renewal)", "Renewal")).toBe(
      "Commercial ROC (Renewal)"
    );
    expect( formatServiceVariantDisplayName("Commercial Exam", "FirstTaker")).toBe(
      "Commercial Exam (First Taker)"
    );
    expect(variantNamesMatch("Amateur Radio", "Amateur Radio (NTC 1-09)")).toBe(true);
  });

  it("convertBackendFormToSchema deduplicates repetitive sections and repetitive fields within a section", async () => {
    const { convertBackendFormToSchema } = await import("../utils/schemaFromBackend");
    const schema = convertBackendFormToSchema({
      formId: "f-dedup-1",
      name: "NTC 1-11: Radio Station License",
      sections: [
        {
          key: "stations",
          title: "Particulars of Station",
          orderIndex: 0,
          fields: [
            { fieldId: "fd000000-0000-0000-0000-000000000028", label: "Call Sign", type: "text", isRequired: true, orderIndex: 0 },
            { fieldId: "dup-guid-999", label: "Call Sign", type: "text", isRequired: true, orderIndex: 1 },
          ],
        },
        {
          key: "particulars-of-station",
          title: "Particulars of Station",
          orderIndex: 1,
          fields: [
            { fieldId: "fd000000-0000-0000-0000-000000000103", label: "Frequency(ies)", type: "text", isRequired: true, orderIndex: 0 },
          ],
        },
      ],
    });

    const sectionHeaders = schema.fields.filter((f) => f.type === "section-header");
    const regularFields = schema.fields.filter((f) => f.type !== "section-header");
    expect(sectionHeaders.length).toBe(1);
    expect(regularFields.length).toBe(2);
    expect(regularFields.map((f) => f.label)).toEqual(["Call Sign", "Frequency(ies)"]);
  });
});
