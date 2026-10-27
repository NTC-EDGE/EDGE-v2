import { evaluateVisibilityCondition, FormEvaluationContext } from "./dynamicFormUtils";

describe("Dynamic Form Conditional Visibility Engine", () => {
  it("Option 1 reveals 5 dependent fields while Option 2 reveals 2 dependent fields", () => {
    // 5 fields depending on Option 1
    const option1Fields = [
      { id: "f-opt1-1", condition: JSON.stringify({ dependsOn: { fieldId: "field-option-selector", operator: "equals", value: "Option 1" } }) },
      { id: "f-opt1-2", condition: JSON.stringify({ dependsOn: { fieldId: "field-option-selector", operator: "equals", value: "Option 1" } }) },
      { id: "f-opt1-3", condition: JSON.stringify({ dependsOn: { fieldId: "field-option-selector", operator: "equals", value: "Option 1" } }) },
      { id: "f-opt1-4", condition: JSON.stringify({ dependsOn: { fieldId: "field-option-selector", operator: "equals", value: "Option 1" } }) },
      { id: "f-opt1-5", condition: JSON.stringify({ dependsOn: { fieldId: "field-option-selector", operator: "equals", value: "Option 1" } }) },
    ];

    // 2 fields depending on Option 2
    const option2Fields = [
      { id: "f-opt2-1", condition: JSON.stringify({ dependsOn: { fieldId: "field-option-selector", operator: "equals", value: "Option 2" } }) },
      { id: "f-opt2-2", condition: JSON.stringify({ dependsOn: { fieldId: "field-option-selector", operator: "equals", value: "Option 2" } }) },
    ];

    // Scenario A: User selects "Option 1"
    const contextOption1: FormEvaluationContext = {
      formValues: {
        "field-option-selector": "Option 1",
      },
    };

    const visibleInScenarioA_Opt1 = option1Fields.filter((f) => evaluateVisibilityCondition(f.condition, contextOption1));
    const visibleInScenarioA_Opt2 = option2Fields.filter((f) => evaluateVisibilityCondition(f.condition, contextOption1));

    expect(visibleInScenarioA_Opt1.length).toBe(5);
    expect(visibleInScenarioA_Opt2.length).toBe(0);

    // Scenario B: User switches selection to "Option 2"
    const contextOption2: FormEvaluationContext = {
      formValues: {
        "field-option-selector": "Option 2",
      },
    };

    const visibleInScenarioB_Opt1 = option1Fields.filter((f) => evaluateVisibilityCondition(f.condition, contextOption2));
    const visibleInScenarioB_Opt2 = option2Fields.filter((f) => evaluateVisibilityCondition(f.condition, contextOption2));

    expect(visibleInScenarioB_Opt1.length).toBe(0);
    expect(visibleInScenarioB_Opt2.length).toBe(2);
  });

  it("evaluates parent fields by fieldLabel or fieldKey case-insensitively", () => {
    const conditionByLabel = JSON.stringify({
      dependsOn: { fieldLabel: "Service Category", operator: "equals", value: "Radio" },
    });

    const contextWithLabel: FormEvaluationContext = {
      formValues: {
        "Service Category": "Radio",
      },
    };

    expect(evaluateVisibilityCondition(conditionByLabel, contextWithLabel)).toBe(true);

    const contextMismatch: FormEvaluationContext = {
      formValues: {
        "Service Category": "Television",
      },
    };

    expect(evaluateVisibilityCondition(conditionByLabel, contextMismatch)).toBe(false);
  });

  it("handles operators: notEquals, in, notEmpty, and contains", () => {
    const notEqualsCond = JSON.stringify({
      dependsOn: { fieldId: "status", operator: "notEquals", value: "Archived" },
    });
    expect(evaluateVisibilityCondition(notEqualsCond, { formValues: { status: "Active" } })).toBe(true);
    expect(evaluateVisibilityCondition(notEqualsCond, { formValues: { status: "Archived" } })).toBe(false);

    const inCond = JSON.stringify({
      dependsOn: { fieldId: "tier", operator: "in", value: ["Gold", "Platinum"] },
    });
    expect(evaluateVisibilityCondition(inCond, { formValues: { tier: "Gold" } })).toBe(true);
    expect(evaluateVisibilityCondition(inCond, { formValues: { tier: "Silver" } })).toBe(false);

    const notEmptyCond = JSON.stringify({
      dependsOn: { fieldId: "remarks", operator: "notEmpty" },
    });
    expect(evaluateVisibilityCondition(notEmptyCond, { formValues: { remarks: "Sample note" } })).toBe(true);
    expect(evaluateVisibilityCondition(notEmptyCond, { formValues: { remarks: "" } })).toBe(false);
    expect(evaluateVisibilityCondition(notEmptyCond, { formValues: {} })).toBe(false);

    const containsCond = JSON.stringify({
      dependsOn: { fieldId: "description", operator: "contains", value: "special" },
    });
    expect(evaluateVisibilityCondition(containsCond, { formValues: { description: "Needs special handling" } })).toBe(true);
    expect(evaluateVisibilityCondition(containsCond, { formValues: { description: "Regular item" } })).toBe(false);
  });

  it("supports multiple dependency conditions in array form (AND logic)", () => {
    const multiCond = JSON.stringify({
      dependsOn: [
        { fieldId: "planType", operator: "equals", value: "Enterprise" },
        { fieldId: "billingCycle", operator: "equals", value: "Annual" },
      ],
    });

    expect(
      evaluateVisibilityCondition(multiCond, {
        formValues: { planType: "Enterprise", billingCycle: "Annual" },
      })
    ).toBe(true);

    expect(
      evaluateVisibilityCondition(multiCond, {
        formValues: { planType: "Enterprise", billingCycle: "Monthly" },
      })
    ).toBe(false);
  });
});
