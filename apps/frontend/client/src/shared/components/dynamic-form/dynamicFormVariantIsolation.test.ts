import { evaluateVisibilityCondition, FormEvaluationContext, parseOptions } from "./dynamicFormUtils";
import { FieldDto } from "./dynamicFormTypes";

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
});
