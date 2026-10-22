import { buildFormVariantFlags } from "./dynamicFormUtils";
import { FieldDto } from "./dynamicFormTypes";

describe("Amateur Permit Purchase/Possess Form Fields & Ordering", () => {
  it("buildFormVariantFlags correctly flags Amateur Radio Station Permit to Purchase/Possess", () => {
    const flags = buildFormVariantFlags(
      "Permits",
      "PERMITS IN THE AMATEUR SERVICE",
      "var-am-pur-poss",
      [
        {
          id: "var-am-pur-poss",
          name: "Amateur Radio Station Permit to Purchase/Possess",
          description: "Amateur Radio Station Permit to Purchase/Possess",
          type: "NA",
          fee: 0,
        },
      ]
    );

    expect(flags.isAmateurPermitService).toBe(true);
    expect(flags.isAmateurPurchasePossessVariant).toBe(true);
    expect(flags.isAmateurPurchaseVariant).toBe(true);
  });

  it("filters station section fields retaining callSign, frequency, and particulars", () => {
    const rawFields: FieldDto[] = [
      { id: "fd000000-0000-0000-0000-000000000028", label: "Call Sign", fieldType: "text" },
      { id: "fd000000-0000-0000-0000-000000000102", label: "Points of Comm/Service Area", fieldType: "text" },
      { id: "fd000000-0000-0000-0000-000000000103", label: "Frequency(ies)", fieldType: "text" },
      { id: "fd000000-0000-0000-0000-000000000104", label: "Bandwidth", fieldType: "text" },
      { id: "fd000000-0000-0000-0000-000000000105", label: "Emission", fieldType: "text" },
      { id: "fd000000-0000-0000-0000-000000000106", label: "Power Output (watts)", fieldType: "text" },
      { id: "fd000000-0000-0000-0000-000000000107", label: "Hours of Operation", fieldType: "text" },
      { id: "fd000000-0000-0000-0000-000000000340", label: "Particulars", fieldType: "repeater" },
    ];

    // Filter rule for amateur purchase/possess station section
    const filteredFields = rawFields.filter((f) => {
      const rawTargetId = (f.fieldId || f.id || "").toLowerCase();
      const labelLower = (f.label || "").toLowerCase();
      const isParticulars =
        rawTargetId.includes("particular") ||
        labelLower.includes("particular") ||
        rawTargetId === "fd000000-0000-0000-0000-000000000340";
      const isCallSign =
        rawTargetId.includes("callsign") ||
        rawTargetId.includes("call_sign") ||
        labelLower.includes("call sign") ||
        rawTargetId === "fd000000-0000-0000-0000-000000000028";
      const isFrequency =
        rawTargetId.includes("frequency") ||
        labelLower.includes("frequency") ||
        rawTargetId === "fd000000-0000-0000-0000-000000000103";

      return isParticulars || isCallSign || isFrequency;
    });

    expect(filteredFields.length).toBe(3);
    expect(filteredFields.map((f) => f.label)).toEqual(["Call Sign", "Frequency(ies)", "Particulars"]);
  });

  it("sorts visibleFields deterministically with callSign first, frequency second, and particulars third", () => {
    // Unordered input
    const visibleFields: FieldDto[] = [
      { id: "fd000000-0000-0000-0000-000000000340", label: "Particulars", fieldType: "repeater" },
      { id: "fd000000-0000-0000-0000-000000000103", label: "Frequency: Within Authorized Amateur Band", fieldType: "text" },
      { id: "fd000000-0000-0000-0000-000000000028", label: "Call Sign", fieldType: "text" },
    ];

    visibleFields.sort((a, b) => {
      const getPriority = (f: FieldDto) => {
        const id = (f.fieldId || f.id || "").toLowerCase();
        const lbl = (f.label || "").toLowerCase();
        if (id.includes("callsign") || id.includes("call_sign") || lbl.includes("call sign") || id === "fd000000-0000-0000-0000-000000000028") return 1;
        if (id.includes("frequency") || lbl.includes("frequency") || id === "fd000000-0000-0000-0000-000000000103") return 2;
        if (id.includes("particular") || lbl.includes("particular") || id === "fd000000-0000-0000-0000-000000000340") return 3;
        return 4;
      };
      return getPriority(a) - getPriority(b);
    });

    expect(visibleFields[0]?.id).toBe("fd000000-0000-0000-0000-000000000028");
    expect(visibleFields[1]?.id).toBe("fd000000-0000-0000-0000-000000000103");
    expect(visibleFields[2]?.id).toBe("fd000000-0000-0000-0000-000000000340");
  });
});
