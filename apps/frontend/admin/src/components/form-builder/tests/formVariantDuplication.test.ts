// @ts-expect-error - bun test runtime module
import { describe, it, expect } from "bun:test";
import { FormField } from "../types";
import {
  duplicateFieldWithSection,
  reorderFieldsWithSections,
  resetVariantToBaseFields,
  isFieldApplicableForVariant,
} from "../utils";

describe("Form Builder - Form Duplication and Variant Reset", () => {
  const allVariants = ["Commercial Broadcast", "Amateur Radio"];

  it("duplicating a field in a variant scopes the copy to that variant and hides from ALL", () => {
    const fields: FormField[] = [
      { id: "sec-1", type: "section-header", label: "Station Info", required: false },
      { id: "f-freq", type: "text", label: "Assigned Frequency (MHz)", required: true },
    ];

    const duplicated = duplicateFieldWithSection(fields, "f-freq", "Commercial Broadcast");

    expect(duplicated.length).toBe(3);
    const copy = duplicated[2];
    expect(copy).toBeDefined();
    expect(copy?.id).not.toBe("f-freq");
    expect(copy?.label).toBe("Assigned Frequency (MHz) (Copy)");
    expect(copy?.condition?.variants).toEqual(["Commercial Broadcast"]);

    expect(isFieldApplicableForVariant(copy ?? fields[1], "Commercial Broadcast")).toBe(true);
    expect(isFieldApplicableForVariant(copy ?? fields[1], "ALL")).toBe(false);
    expect(isFieldApplicableForVariant(copy ?? fields[1], "Amateur Radio")).toBe(false);
  });

  it("duplicating a section header in a variant duplicates the section and its child fields scoped to variant", () => {
    const fields: FormField[] = [
      { id: "sec-a", type: "section-header", label: "Transmitter Specs", required: false },
      { id: "f-power", type: "number", label: "Power Output (kW)", required: true },
      { id: "sec-b", type: "section-header", label: "Antenna Specs", required: false },
    ];

    const duplicated = duplicateFieldWithSection(fields, "sec-a", "Commercial Broadcast");

    expect(duplicated.length).toBe(5);
    const copiedSection = duplicated[2];
    const copiedField = duplicated[3];

    expect(copiedSection?.type).toBe("section-header");
    expect(copiedSection?.label).toBe("Transmitter Specs (Copy)");
    expect(copiedSection?.condition?.variants).toEqual(["Commercial Broadcast"]);

    expect(copiedField?.type).toBe("number");
    expect(copiedField?.condition?.variants).toEqual(["Commercial Broadcast"]);

    expect(isFieldApplicableForVariant(copiedSection ?? fields[0], "ALL")).toBe(false);
    expect(isFieldApplicableForVariant(copiedField ?? fields[1], "ALL")).toBe(false);
    expect(isFieldApplicableForVariant(copiedSection ?? fields[0], "Commercial Broadcast")).toBe(true);
    expect(isFieldApplicableForVariant(copiedField ?? fields[1], "Commercial Broadcast")).toBe(true);
  });

  it("reordering a section block moves all child fields cleanly together", () => {
    const fields: FormField[] = [
      { id: "sec-1", type: "section-header", label: "Section 1", required: false },
      { id: "f-1a", type: "text", label: "Field 1A", required: true },
      { id: "f-1b", type: "text", label: "Field 1B", required: true },
      { id: "sec-2", type: "section-header", label: "Section 2", required: false },
      { id: "f-2a", type: "text", label: "Field 2A", required: true },
    ];

    // Reorder Section 2 before Section 1
    const reordered = reorderFieldsWithSections(fields, 3, 0);

    expect(reordered[0]?.id).toBe("sec-2");
    expect(reordered[1]?.id).toBe("f-2a");
    expect(reordered[2]?.id).toBe("sec-1");
    expect(reordered[3]?.id).toBe("f-1a");
    expect(reordered[4]?.id).toBe("f-1b");
  });

  it("resetVariantToBaseFields purges variant-exclusive fields and restores base fields cleanly", () => {
    const fields: FormField[] = [
      {
        id: "sec-main",
        type: "section-header",
        label: "Main Details",
        sectionTitle: "Main Details",
        required: false,
        variantTitles: {
          "Commercial Broadcast": "Broadcast Transmitter Network",
        },
      },
      {
        id: "f-base-name",
        type: "text",
        label: "Standard Applicant Name",
        required: true,
        condition: { excludedVariants: ["Commercial Broadcast"] },
      },
      {
        id: "f-custom-comm",
        type: "text",
        label: "Commercial Station Operator",
        required: true,
        condition: { variants: ["Commercial Broadcast"] },
      },
      {
        id: "f-shared",
        type: "text",
        label: "Contact Telephone",
        required: false,
      },
    ];

    const restored = resetVariantToBaseFields(fields, "Commercial Broadcast", allVariants);

    // The variant-exclusive field should be purged
    expect(restored.some((f) => f.id === "f-custom-comm")).toBe(false);
    expect(restored.length).toBe(3);

    // The base field should no longer exclude Commercial Broadcast
    const restoredBase = restored.find((f) => f.id === "f-base-name");
    expect(restoredBase).toBeDefined();
    expect(restoredBase?.condition?.excludedVariants).toBeUndefined();
    expect(isFieldApplicableForVariant(restoredBase ?? fields[1], "Commercial Broadcast")).toBe(true);

    // The section header variantTitles for Commercial Broadcast should be cleared
    const restoredSection = restored.find((f) => f.id === "sec-main");
    expect(restoredSection?.variantTitles).toBeUndefined();
  });
});
