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

  describe("Amateur Radio Station Permit to Possess for Storage", () => {
    it("buildFormVariantFlags correctly flags Amateur Radio Station Permit to Possess for Storage", () => {
      const flags = buildFormVariantFlags(
        "Permits",
        "PERMITS IN THE AMATEUR SERVICE",
        "var-am-storage",
        [
          {
            id: "var-am-storage",
            name: "Amateur Radio Station Permit to Possess for Storage",
            description: "Amateur Radio Station Permit to Possess for Storage",
            type: "NA",
            fee: 0,
          },
        ]
      );

      expect(flags.isAmateurPermitService).toBe(true);
      expect(flags.isAmateurStorageVariant).toBe(true);
      expect(flags.isAmateurPurchasePossessVariant).toBe(false);
    });

    it("filters station section fields retaining only the 8 operating parameters and particulars", () => {
      const rawFields: FieldDto[] = [
        { id: "fd000000-0000-0000-0000-000000000028", label: "Call Sign", fieldType: "text" },
        { id: "fd000000-0000-0000-0000-000000000102", label: "Points of Comm/Service Area", fieldType: "text" },
        { id: "fd000000-0000-0000-0000-000000000103", label: "Frequency", fieldType: "text" },
        { id: "fd000000-0000-0000-0000-000000000104", label: "Bandwidth", fieldType: "text" },
        { id: "fd000000-0000-0000-0000-000000000260", label: "Unit", fieldType: "select" },
        { id: "fd000000-0000-0000-0000-000000000105", label: "Emission", fieldType: "text" },
        { id: "fd000000-0000-0000-0000-000000000106", label: "Power Output (watts)", fieldType: "text" },
        { id: "fd000000-0000-0000-0000-000000000107", label: "Hours of Operation", fieldType: "text" },
        { id: "fd000000-0000-0000-0000-000000000340", label: "Particulars", fieldType: "repeater" },
        { id: "antennaType", label: "Antenna Type", fieldType: "text" },
        { id: "gain", label: "Antenna Gain", fieldType: "text" },
      ];

      const allowedStorageKeys = [
        "callsign",
        "call_sign",
        "call sign",
        "servicearea",
        "service_area",
        "service area",
        "pointsofcomm",
        "points of comm",
        "frequency",
        "bandwidth",
        "bandwidthunit",
        "bandwidth unit",
        "unit",
        "emission",
        "poweroutput",
        "power_output",
        "power output",
        "power",
        "hoursofoperation",
        "hours_of_operation",
        "hours of operation",
        "hour",
        "particulars",
        "particular",
        "fd000000-0000-0000-0000-000000000028",
        "fd000000-0000-0000-0000-000000000102",
        "fd000000-0000-0000-0000-000000000103",
        "fd000000-0000-0000-0000-000000000104",
        "fd000000-0000-0000-0000-000000000260",
        "fd000000-0000-0000-0000-000000000105",
        "fd000000-0000-0000-0000-000000000106",
        "fd000000-0000-0000-0000-000000000107",
        "fd000000-0000-0000-0000-000000000340",
      ];

      const filtered = rawFields.filter((f) => {
        const rawTargetId = (f.fieldId || f.id || "").toLowerCase();
        const labelLower = (f.label || "").toLowerCase();
        return allowedStorageKeys.some((k) => rawTargetId.includes(k) || labelLower.includes(k));
      });

      expect(filtered.length).toBe(9);
      expect(filtered.map((f) => f.label)).toEqual([
        "Call Sign",
        "Points of Comm/Service Area",
        "Frequency",
        "Bandwidth",
        "Unit",
        "Emission",
        "Power Output (watts)",
        "Hours of Operation",
        "Particulars",
      ]);
    });

    it("sorts visibleFields deterministically in the exact required order for storage variant", () => {
      // Shuffled input fields
      const visibleFields: FieldDto[] = [
        { id: "fd000000-0000-0000-0000-000000000340", label: "Particulars", fieldType: "repeater" },
        { id: "fd000000-0000-0000-0000-000000000107", label: "Hours of Operation", fieldType: "text" },
        { id: "fd000000-0000-0000-0000-000000000105", label: "Emission", fieldType: "text" },
        { id: "fd000000-0000-0000-0000-000000000102", label: "Points of Comm/Service Area", fieldType: "text" },
        { id: "fd000000-0000-0000-0000-000000000028", label: "Call Sign", fieldType: "text" },
        { id: "fd000000-0000-0000-0000-000000000106", label: "Power Output (watts)", fieldType: "text" },
        { id: "fd000000-0000-0000-0000-000000000103", label: "Frequency", fieldType: "text" },
        { id: "fd000000-0000-0000-0000-000000000260", label: "Unit", fieldType: "select" },
        { id: "fd000000-0000-0000-0000-000000000104", label: "Bandwidth", fieldType: "text" },
      ];

      visibleFields.sort((a, b) => {
        const getPriority = (f: FieldDto) => {
          const id = (f.fieldId || f.id || "").toLowerCase();
          const lbl = (f.label || "").toLowerCase();
          if (id.includes("callsign") || id.includes("call_sign") || lbl.includes("call sign") || id === "fd000000-0000-0000-0000-000000000028") return 1;
          if (id.includes("servicearea") || lbl.includes("service area") || lbl.includes("points of comm") || id === "fd000000-0000-0000-0000-000000000102") return 2;
          if (id === "frequency" || (id.includes("frequency") && !id.includes("unit")) || lbl === "frequency" || lbl.includes("authorized amateur band") || id === "fd000000-0000-0000-0000-000000000103") return 3;
          if (((id.includes("bandwidth") && !id.includes("unit")) || (lbl.includes("bandwidth") && !lbl.includes("unit"))) && id !== "bandwidthunit" || id === "fd000000-0000-0000-0000-000000000104") return 4;
          if (id === "bandwidthunit" || id === "unit" || id.includes("unit") || lbl === "unit" || lbl.includes("bandwidth unit") || id === "fd000000-0000-0000-0000-000000000260") return 5;
          if (id.includes("emission") || lbl.includes("emission") || id === "fd000000-0000-0000-0000-000000000105") return 6;
          if (id.includes("power") || lbl.includes("power output") || id === "fd000000-0000-0000-0000-000000000106") return 7;
          if (id.includes("hour") || lbl.includes("hours of operation") || id === "fd000000-0000-0000-0000-000000000107") return 8;
          if (id.includes("particular") || lbl.includes("particular") || id === "fd000000-0000-0000-0000-000000000340") return 9;
          return 10;
        };
        return getPriority(a) - getPriority(b);
      });

      expect(visibleFields[0]?.label).toBe("Call Sign");
      expect(visibleFields[1]?.label).toBe("Points of Comm/Service Area");
      expect(visibleFields[2]?.label).toBe("Frequency");
      expect(visibleFields[3]?.label).toBe("Bandwidth");
      expect(visibleFields[4]?.label).toBe("Unit");
      expect(visibleFields[5]?.label).toBe("Emission");
      expect(visibleFields[6]?.label).toBe("Power Output (watts)");
      expect(visibleFields[7]?.label).toBe("Hours of Operation");
      expect(visibleFields[8]?.label).toBe("Particulars");
    });
  });
});
