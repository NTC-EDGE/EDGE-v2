import {
  evaluateVisibilityCondition,
  FormEvaluationContext,
  parseOptions,
  resolveFieldForContext,
} from "./dynamicFormUtils";
import { FieldDto } from "./dynamicFormTypes";
import { buildDynamicSections } from "../../formPreview/core/buildDynamicSections";

describe("Client Dynamic Form - Variant Isolation and Base Propagation", () => {
  it("base field without variant conditions renders across all service variants", () => {
    const baseCondition = "";

    const amateurContext: FormEvaluationContext = {
      serviceCategory: "Permit",
      variantName: "Amateur Radio",
      variantDescription: "Amateur Radio Station Permit",
      formValues: {},
    };

    const commercialContext: FormEvaluationContext = {
      serviceCategory: "Permit",
      variantName: "Commercial Broadcast",
      variantDescription: "Commercial Radio Broadcast Station",
      formValues: {},
    };

    expect(evaluateVisibilityCondition(baseCondition, amateurContext)).toBe(true);
    expect(evaluateVisibilityCondition(baseCondition, commercialContext)).toBe(true);
  });

  it("customized field with positive variant condition is visible only to that variant", () => {
    const customizedCondition = JSON.stringify({
      variants: ["Commercial Broadcast"],
    });

    const commercialContext: FormEvaluationContext = {
      serviceCategory: "Permit",
      variantName: "Commercial Broadcast",
      formValues: {},
    };

    const amateurContext: FormEvaluationContext = {
      serviceCategory: "Permit",
      variantName: "Amateur Radio",
      formValues: {},
    };

    expect(evaluateVisibilityCondition(customizedCondition, commercialContext)).toBe(true);
    expect(evaluateVisibilityCondition(customizedCondition, amateurContext)).toBe(false);
  });

  it("base field with excludedVariants is hidden from the overridden variant and visible to others", () => {
    const excludedBaseCondition = JSON.stringify({
      excludedVariants: ["Commercial Broadcast"],
    });

    const commercialContext: FormEvaluationContext = {
      serviceCategory: "Permit",
      variantName: "Commercial Broadcast",
      formValues: {},
    };

    const amateurContext: FormEvaluationContext = {
      serviceCategory: "Permit",
      variantName: "Amateur Radio",
      formValues: {},
    };

    expect(evaluateVisibilityCondition(excludedBaseCondition, commercialContext)).toBe(false);
    expect(evaluateVisibilityCondition(excludedBaseCondition, amateurContext)).toBe(true);
  });

  it("simulates full form evaluation ensuring single instance per field without duplicate display", () => {
    const fields = [
      {
        id: "f-tax-base",
        label: "Standard Tax ID",
        condition: JSON.stringify({ excludedVariants: ["Commercial Broadcast"] }),
      },
      {
        id: "f-tax-commercial",
        label: "Commercial Station TIN",
        condition: JSON.stringify({ variants: ["Commercial Broadcast"] }),
      },
      {
        id: "f-contact-general",
        label: "Primary Phone Number",
        condition: "",
      },
    ];

    const commercialContext: FormEvaluationContext = {
      variantName: "Commercial Broadcast",
      formValues: {},
    };

    const amateurContext: FormEvaluationContext = {
      variantName: "Amateur Radio",
      formValues: {},
    };

    const commercialVisible = fields.filter((f) =>
      evaluateVisibilityCondition(f.condition, commercialContext)
    );
    expect(commercialVisible.length).toBe(2);
    expect(commercialVisible.map((f) => f.id)).toEqual(["f-tax-commercial", "f-contact-general"]);

    const amateurVisible = fields.filter((f) =>
      evaluateVisibilityCondition(f.condition, amateurContext)
    );
    expect(amateurVisible.length).toBe(2);
    expect(amateurVisible.map((f) => f.id)).toEqual(["f-tax-base", "f-contact-general"]);
  });

  it("dropdown field options parse correctly from direct field.options and validationRules metadata", () => {
    const directOptionsField: FieldDto = {
      id: "f-dropdown-direct",
      label: "Antenna Frequency Band",
      type: "select",
      options: [
        { label: "VHF (30 - 300 MHz)", value: "vhf" },
        { label: "UHF (300 - 3000 MHz)", value: "uhf" },
      ],
    };

    const parsedDirect = parseOptions(directOptionsField);
    expect(parsedDirect).toEqual([
      { label: "VHF (30 - 300 MHz)", value: "vhf" },
      { label: "UHF (300 - 3000 MHz)", value: "uhf" },
    ]);

    const jsonOptionsField: FieldDto = {
      id: "f-dropdown-json",
      label: "Station Class",
      type: "select",
      validationRules: JSON.stringify({
        options: [
          { id: "opt-1", label: "Class A (Commercial)", value: "class-a" },
          { id: "opt-2", label: "Class B (Non-Commercial)", value: "class-b" },
        ],
      }),
    };

    const parsedJson = parseOptions(jsonOptionsField);
    expect(parsedJson).toEqual([
      { label: "Class A (Commercial)", value: "class-a" },
      { label: "Class B (Non-Commercial)", value: "class-b" },
    ]);

    const doubleJsonField: FieldDto = {
      id: "f-dropdown-double-json",
      label: "Power Output",
      type: "select",
      validationRules: JSON.stringify(
        JSON.stringify({
          options: [
            { label: "Low Power (<= 1kW)", value: "low" },
            { label: "High Power (> 1kW)", value: "high" },
          ],
        })
      ),
    };

    const parsedDoubleJson = parseOptions(doubleJsonField);
    expect(parsedDoubleJson).toEqual([
      { label: "Low Power (<= 1kW)", value: "low" },
      { label: "High Power (> 1kW)", value: "high" },
    ]);
  });

  it("variant-customized dropdown reflects updated label and options specifically for the variant", () => {
    const baseDropdownField: FieldDto = {
      id: "f-bandwidth-base",
      label: "Standard Channel Bandwidth",
      type: "select",
      options: [
        { label: "10 kHz Standard", value: "10khz" },
        { label: "20 kHz Standard", value: "20khz" },
      ],
      visibilityCondition: JSON.stringify({
        excludedVariants: ["Commercial Broadcast (New)", "var-commercial-uuid"],
      }),
    };

    const customizedVariantDropdownField: FieldDto = {
      id: "f-bandwidth-customized",
      label: "Commercial Broadcast Modulation & Bandwidth",
      type: "select",
      options: [
        { label: "AM 530 - 1710 kHz (10 kHz)", value: "am" },
        { label: "FM 88 - 108 MHz (200 kHz)", value: "fm" },
        { label: "DTV 6 MHz Channel", value: "dtv" },
      ],
      visibilityCondition: JSON.stringify({
        variants: ["Commercial Broadcast (New)", "var-commercial-uuid"],
      }),
    };

    const fields = [baseDropdownField, customizedVariantDropdownField];

    const commercialContext: FormEvaluationContext = {
      serviceCategory: "Permit",
      variantId: "var-commercial-uuid",
      variantName: "Commercial Broadcast (New)",
      variantDescription: "Commercial Broadcast",
      variantType: "New",
      formValues: {},
    };

    const amateurContext: FormEvaluationContext = {
      serviceCategory: "Permit",
      variantId: "var-amateur-uuid",
      variantName: "Amateur Radio (New)",
      variantDescription: "Amateur Radio",
      variantType: "New",
      formValues: {},
    };

    // Commercial context evaluation
    const commercialVisible = fields.filter((f) =>
      evaluateVisibilityCondition(f.visibilityCondition, commercialContext)
    );
    expect(commercialVisible.length).toBe(1);
    const commercialField = commercialVisible[0];
    expect(commercialField).toBeDefined();
    if (commercialField) {
      expect(commercialField.id).toBe("f-bandwidth-customized");
      expect(commercialField.label).toBe("Commercial Broadcast Modulation & Bandwidth");
      const opts = parseOptions(commercialField);
      expect(opts).toHaveLength(3);
      expect(opts[0]?.label).toBe("AM 530 - 1710 kHz (10 kHz)");
      expect(opts[1]?.label).toBe("FM 88 - 108 MHz (200 kHz)");
      expect(opts[2]?.label).toBe("DTV 6 MHz Channel");
    }

    // Amateur context evaluation
    const amateurVisible = fields.filter((f) =>
      evaluateVisibilityCondition(f.visibilityCondition, amateurContext)
    );
    expect(amateurVisible.length).toBe(1);
    const amateurField = amateurVisible[0];
    expect(amateurField).toBeDefined();
    if (amateurField) {
      expect(amateurField.id).toBe("f-bandwidth-base");
      expect(amateurField.label).toBe("Standard Channel Bandwidth");
      const opts = parseOptions(amateurField);
      expect(opts).toHaveLength(2);
      expect(opts[0]?.label).toBe("10 kHz Standard");
      expect(opts[1]?.label).toBe("20 kHz Standard");
    }
  });

  it("variant form field with scoped variant UUID matches when context provides variantId even with naming discrepancies", () => {
    const variantCondition = JSON.stringify({
      variants: ["c8f2d940-1234-4567-89ab-cdef01234567", "Commercial Broadcast - New"],
    });

    const contextWithDifferentNameFormat: FormEvaluationContext = {
      variantId: "c8f2d940-1234-4567-89ab-cdef01234567",
      variantName: "Commercial Broadcast (New)",
      variantDescription: "Commercial Broadcast",
      variantType: "New",
    };

    expect(evaluateVisibilityCondition(variantCondition, contextWithDifferentNameFormat)).toBe(true);
  });

  it("resolveFieldForContext projects variantOverrides and buildDynamicSections respects excludedVariants & variantOverrides", () => {
    const sharedField: FieldDto = {
      id: "f-station-callsign",
      fieldId: "f-station-callsign",
      label: "Call Sign",
      type: "select",
      isRequired: false,
      validationRules: JSON.stringify({
        options: [{ label: "Standard Band", value: "std" }],
        variantOverrides: {
          "Commercial Broadcast (Renewal)": {
            label: "Existing Broadcast Call Sign",
            required: true,
            options: [{ label: "FM Commercial Band", value: "fm-comm" }],
          },
        },
      }),
    };

    const renewalCtx: FormEvaluationContext = {
      variantName: "Commercial Broadcast (Renewal)",
      variantDescription: "Commercial Broadcast",
      variantType: "Renewal",
    };
    const newCtx: FormEvaluationContext = {
      variantName: "Commercial Broadcast (New)",
      variantDescription: "Commercial Broadcast",
      variantType: "New",
    };

    const resolvedRenewal = resolveFieldForContext(sharedField, renewalCtx);
    expect(resolvedRenewal.label).toBe("Existing Broadcast Call Sign");
    expect(resolvedRenewal.isRequired).toBe(true);
    expect(parseOptions(resolvedRenewal)).toEqual([{ label: "FM Commercial Band", value: "fm-comm" }]);

    const resolvedNew = resolveFieldForContext(sharedField, newCtx);
    expect(resolvedNew.label).toBe("Call Sign");
    expect(resolvedNew.isRequired).toBe(false);
    expect(parseOptions(resolvedNew)).toEqual([{ label: "Standard Band", value: "std" }]);

    // Preview engine respects excludedVariants, __NONE__, and variantOverrides
    const previewSchema = {
      sections: [
        {
          id: "sec-station",
          key: "station",
          title: "Station Particulars",
          fields: [
            {
              fieldId: "f-station-callsign",
              label: "Call Sign",
              validationRules: sharedField.validationRules,
            },
            {
              fieldId: "f-hidden-in-renewal",
              label: "Initial Construction Permit No.",
              visibilityCondition: JSON.stringify({
                excludedVariants: ["Commercial Broadcast (Renewal)"],
              }),
            },
            {
              fieldId: "f-unused",
              label: "Deprecated Field",
              visibilityCondition: JSON.stringify({
                variants: ["__NONE__"],
              }),
            },
          ],
        },
      ],
    };

    const previewResult = buildDynamicSections(
      previewSchema,
      [
        { fieldId: "f-station-callsign", fieldLabel: "Call Sign", value: "DWXX-FM" },
        { fieldId: "f-hidden-in-renewal", fieldLabel: "Initial Construction Permit No.", value: "CP-123" },
        { fieldId: "f-unused", fieldLabel: "Deprecated Field", value: "OLD" },
      ],
      { selectedVariantName: "Commercial Broadcast (Renewal)" }
    );

    expect(previewResult.dynamicSectionsToRender.length).toBe(1);
    const renderedFields = previewResult.dynamicSectionsToRender[0]?.fields ?? [];
    expect(renderedFields.length).toBe(1);
    expect(renderedFields[0]?.label).toBe("Existing Broadcast Call Sign");
    expect(renderedFields[0]?.value).toBe("DWXX-FM");
  });
});
