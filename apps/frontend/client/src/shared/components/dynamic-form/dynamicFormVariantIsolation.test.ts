import { evaluateVisibilityCondition, FormEvaluationContext } from "./dynamicFormUtils";

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
});
