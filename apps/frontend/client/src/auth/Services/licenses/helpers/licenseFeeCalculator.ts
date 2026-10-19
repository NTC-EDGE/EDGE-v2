import {
  LicenseFeeCalculationInput,
  LicenseFeeCalculationResult,
  LicenseFeeLineItem,
} from "../types/licenseFeeTypes";

const DST_AMOUNT = 30.0;

export enum LicensePowerTier {
  High = "High",
  Medium = "Medium",
  Low = "Low",
}

export function resolvePowerTier(text?: string | null): LicensePowerTier {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return LicensePowerTier.High;
  }
  const upper = text.toUpperCase();
  if (upper.includes("HIGH") || upper.includes(">100") || upper.includes("> 100") || upper.includes("ABOVE 100")) {
    return LicensePowerTier.High;
  }
  if (upper.includes("MEDIUM") || upper.includes("25W-100W") || upper.includes("25W - 100W") || upper.includes("25W UP TO 100W") || upper.includes("ABOVE 25W")) {
    return LicensePowerTier.Medium;
  }
  if (upper.includes("LOW") || upper.includes("BELOW") || upper.includes("<=25W") || upper.includes("25W AND BELOW") || upper.includes("25W & BELOW")) {
    return LicensePowerTier.Low;
  }
  return LicensePowerTier.High;
}

export function calculateSurcharge(
  baseAmount: number,
  expirationDate?: string | Date | null,
  asOfDate?: string | Date | null
): { multiplier: number; amount: number; description: string } {
  if (!expirationDate) {
    return { multiplier: 0, amount: 0, description: "" };
  }

  const exp = typeof expirationDate === "string" ? new Date(expirationDate) : expirationDate;
  const asOf = asOfDate ? (typeof asOfDate === "string" ? new Date(asOfDate) : asOfDate) : new Date();

  if (isNaN(exp.getTime()) || isNaN(asOf.getTime())) {
    return { multiplier: 0, amount: 0, description: "" };
  }

  const diffMs = asOf.getTime() - exp.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { multiplier: 0, amount: 0, description: "" };
  }

  let multiplier = 0;
  let description = "";

  if (diffDays <= 180) {
    multiplier = 0.5;
    description = "Late Renewal Surcharge (50% - Within 6 Months)";
  } else if (diffDays <= 365) {
    multiplier = 1.0;
    description = "Late Renewal Surcharge (100% - 6 to 12 Months)";
  } else {
    const extraPeriods = Math.ceil((diffDays - 365) / 180);
    multiplier = 1.0 + extraPeriods * 0.5;
    description = `Late Renewal Surcharge (${Math.round(multiplier * 100)}% - Over 1 Year Delay)`;
  }

  const amount = Math.round(baseAmount * multiplier * 100) / 100;
  return { multiplier, amount, description };
}

export function calculateLicenseFee(input: LicenseFeeCalculationInput): LicenseFeeCalculationResult {
  const lineItems: LicenseFeeLineItem[] = [];
  const years = Math.max(1, input.validityYears ?? 1);
  const units = Math.max(1, input.noOfUnits ?? 1);
  const copies = Math.max(1, input.noOfCopies ?? 1);
  const channels = Math.max(1, input.noOfChannels ?? 1);
  const asOfDate = input.asOfDate ?? new Date();

  const activity = (input.serviceName || input.serviceCategory || "LICENSE").trim();
  const appType = (input.applicationType || input.variantName || "").trim();
  const element = (input.element || "").trim();

  let formulaApplied = "FEELIC = FF + (LIC)(YR)(UNIT) + DST";

  const upperAct = activity.toUpperCase();
  const upperApp = appType.toUpperCase();
  const isRenewal = upperApp.includes("RENEWAL");
  const isModification = upperApp.includes("MODIFICATION");

  // 1. Copy of Licenses
  if (upperAct.includes("COPY OF LICENSES") || upperApp.includes("COPY OF LICENSE") || upperApp.includes("CERTIFIED TRUE COPY") || upperApp.includes("DUPLICATE COPY")) {
    if (upperApp.includes("CERTIFIED TRUE COPY") || upperApp.includes("CTC")) {
      lineItems.push({
        particular: "Certified True Copy (First Page)",
        itemCode: "FIRST_COPY",
        description: "First copy authentication fee",
        validityYears: 1,
        noOfUnits: 1,
        feeRate: 24.0,
        amount: 24.0,
      });
      if (copies > 1) {
        const extra = copies - 1;
        lineItems.push({
          particular: "Certified True Copy (Succeeding Pages)",
          itemCode: "SUCCEEDING_COPIES",
          description: "Succeeding copies authentication fee",
          validityYears: 1,
          noOfUnits: extra,
          feeRate: 6.0,
          amount: 6.0 * extra,
        });
      }
      formulaApplied = "TOTAL = FC + (SC)(COPY) + DST";
    } else {
      lineItems.push({
        particular: "Duplicate License Copy",
        itemCode: "DUPLICATE",
        description: "Statutory Duplicate Copy Issuance Fee",
        validityYears: 1,
        noOfUnits: 1,
        feeRate: 120.0,
        amount: 120.0,
      });
      formulaApplied = "TOTAL = DUP + DST";
    }
  }
  // 2. TVRO / CATV
  else if (upperAct.includes("TVRO") || upperAct.includes("CATV") || upperApp.includes("TVRO") || upperApp.includes("CATV")) {
    if (upperApp.includes("CATV")) {
      if (isModification) {
        lineItems.push({
          particular: "Modification Fee",
          itemCode: "MODIFICATION",
          description: "CATV License Modification Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 180.0,
          amount: 180.0,
        });
        formulaApplied = "FEEMOD = MOD + DST";
      } else if (isRenewal) {
        const lfTotal = 3600.0 * years;
        lineItems.push({
          particular: "License Fee",
          itemCode: "LICENSE_FEE",
          description: "CATV Station Annual License Fee",
          validityYears: years,
          noOfUnits: 1,
          feeRate: 3600.0,
          amount: lfTotal,
        });
        lineItems.push({
          particular: "Inspection Fee",
          itemCode: "INSPECTION_FEE",
          description: "CATV Station Annual Inspection Fee",
          validityYears: years,
          noOfUnits: 1,
          feeRate: 720.0,
          amount: 720.0 * years,
        });
        const sur = calculateSurcharge(lfTotal, input.expirationDate, asOfDate);
        if (sur.amount > 0) {
          lineItems.push({
            particular: "Surcharge (Late Renewal Penalty)",
            itemCode: "SURCHARGE",
            description: sur.description,
            validityYears: 1,
            noOfUnits: 1,
            feeRate: sur.amount,
            amount: sur.amount,
            isSurcharge: true,
          });
        }
        formulaApplied = "FEECATVRSL = (LF)(YR) + (IF)(YR) + DST + SUR";
      } else {
        lineItems.push({
          particular: "Filing Fee",
          itemCode: "FILING_FEE",
          description: "CATV License Application Filing Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 400.0,
          amount: 400.0,
        });
        lineItems.push({
          particular: "Construction Permit Fee",
          itemCode: "CONSTRUCTION_PERMIT",
          description: "CATV Station Construction Permit Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 1140.0,
          amount: 1140.0,
        });
        lineItems.push({
          particular: "License Fee",
          itemCode: "LICENSE_FEE",
          description: "CATV Station Annual License Fee",
          validityYears: years,
          noOfUnits: 1,
          feeRate: 3600.0,
          amount: 3600.0 * years,
        });
        lineItems.push({
          particular: "Inspection Fee",
          itemCode: "INSPECTION_FEE",
          description: "CATV Station Annual Inspection Fee",
          validityYears: years,
          noOfUnits: 1,
          feeRate: 720.0,
          amount: 720.0 * years,
        });
        formulaApplied = "FEECATVRSL = FF + CPF + (LF)(YR) + (IF)(YR) + DST";
      }
    } else {
      // TVRO
      if (isModification) {
        lineItems.push({
          particular: "Modification Fee",
          itemCode: "MODIFICATION",
          description: "TVRO License Modification Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 120.0,
          amount: 120.0,
        });
        formulaApplied = "FEEMOD = MOD + DST";
      } else if (isRenewal) {
        const lfTotal = 2600.0 * years;
        lineItems.push({
          particular: "License Fee",
          itemCode: "LICENSE_FEE",
          description: "TVRO Station Annual License Fee",
          validityYears: years,
          noOfUnits: 1,
          feeRate: 2600.0,
          amount: lfTotal,
        });
        const sur = calculateSurcharge(lfTotal, input.expirationDate, asOfDate);
        if (sur.amount > 0) {
          lineItems.push({
            particular: "Surcharge (Late Renewal Penalty)",
            itemCode: "SURCHARGE",
            description: sur.description,
            validityYears: 1,
            noOfUnits: 1,
            feeRate: sur.amount,
            amount: sur.amount,
            isSurcharge: true,
          });
        }
        formulaApplied = "FEETVRORSL = (LF)(YR) + DST + SUR";
      } else {
        lineItems.push({
          particular: "License Fee",
          itemCode: "LICENSE_FEE",
          description: "TVRO Station Annual License Fee",
          validityYears: years,
          noOfUnits: 1,
          feeRate: 2600.0,
          amount: 2600.0 * years,
        });
        formulaApplied = "FEETVRORSL = (LF)(YR) + DST";
      }
    }
  }
  // 3. Amateur Service
  else if (upperAct.includes("AMATEUR") || upperApp.includes("AMATEUR")) {
    if (upperApp.includes("LIFETIME") || upperAct.includes("LIFETIME")) {
      if (isModification) {
        lineItems.push({
          particular: "Filing Fee",
          itemCode: "FILING_FEE",
          description: "Amateur Lifetime License Modification Filing Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 60.0,
          amount: 60.0,
        });
        lineItems.push({
          particular: "Modification Fee",
          itemCode: "MODIFICATION",
          description: "Amateur Lifetime License Modification Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 50.0,
          amount: 50.0,
        });
        formulaApplied = "FEEAT-LIFETIME = FF + MOD + DST";
      } else {
        lineItems.push({
          particular: "License Fee",
          itemCode: "LICENSE_FEE",
          description: "Lifetime Amateur Station License Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 50.0,
          amount: 50.0,
        });
        formulaApplied = "FEEAT-LIFETIME = LF + DST";
      }
    } else if (upperApp.includes("CLUB") || upperAct.includes("CLUB")) {
      const isDuplex = element.toUpperCase().includes("DUPLEX") || upperApp.includes("DUPLEX");
      const clubLfRate = isDuplex ? 1320.0 : 700.0;
      const typeLabel = isDuplex ? "Duplex" : "Simplex";

      if (isModification) {
        lineItems.push({
          particular: "Filing Fee",
          itemCode: "FILING_FEE",
          description: "Amateur Club License Modification Filing Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 180.0,
          amount: 180.0,
        });
        lineItems.push({
          particular: "Construction Permit Fee",
          itemCode: "CONSTRUCTION_PERMIT",
          description: "Amateur Club Modification Construction Permit Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 60.0,
          amount: 60.0,
        });
        lineItems.push({
          particular: "Modification Fee",
          itemCode: "MODIFICATION",
          description: "Amateur Club License Modification Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 50.0,
          amount: 50.0,
        });
        formulaApplied = "FEEAT-RSL-CLUB = FF + CPF + MOD + DST";
      } else if (isRenewal) {
        const lfTotal = clubLfRate * years;
        lineItems.push({
          particular: `License Fee (${typeLabel})`,
          itemCode: "LICENSE_FEE",
          description: "Amateur Club Station Annual License Fee",
          validityYears: years,
          noOfUnits: 1,
          feeRate: clubLfRate,
          amount: lfTotal,
        });
        const sur = calculateSurcharge(lfTotal, input.expirationDate, asOfDate);
        if (sur.amount > 0) {
          lineItems.push({
            particular: "Surcharge (Late Renewal Penalty)",
            itemCode: "SURCHARGE",
            description: sur.description,
            validityYears: 1,
            noOfUnits: 1,
            feeRate: sur.amount,
            amount: sur.amount,
            isSurcharge: true,
          });
        }
        formulaApplied = "FEEAT-RSL-CLUB = (LF)(YR) + DST + SUR";
      } else {
        lineItems.push({
          particular: "Filing Fee",
          itemCode: "FILING_FEE",
          description: "Amateur Club License Application Filing Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 180.0,
          amount: 180.0,
        });
        lineItems.push({
          particular: "Construction Permit Fee",
          itemCode: "CONSTRUCTION_PERMIT",
          description: "Amateur Club Construction Permit Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 600.0,
          amount: 600.0,
        });
        lineItems.push({
          particular: `License Fee (${typeLabel})`,
          itemCode: "LICENSE_FEE",
          description: "Amateur Club Station Annual License Fee",
          validityYears: years,
          noOfUnits: 1,
          feeRate: clubLfRate,
          amount: clubLfRate * years,
        });
        formulaApplied = "FEEAT-RSL-CLUB = FF + CPF + (LF)(YR) + DST";
      }
    } else {
      // Standard Amateur Radio Station License
      if (isModification) {
        lineItems.push({
          particular: "Filing Fee",
          itemCode: "FILING_FEE",
          description: "Amateur License Modification Filing Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 60.0,
          amount: 60.0,
        });
        lineItems.push({
          particular: "Modification Fee",
          itemCode: "MODIFICATION",
          description: "Amateur License Modification Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 50.0,
          amount: 50.0,
        });
        formulaApplied = "FEEAT-RSL = FF + MOD + DST";
      } else {
        let classLfRate = 120.0;
        let classLabel = "Class A";
        if (element.includes("Class B")) {
          classLfRate = 132.0;
          classLabel = "Class B";
        } else if (element.includes("Class C")) {
          classLfRate = 144.0;
          classLabel = "Class C";
        } else if (element.includes("Class D")) {
          classLfRate = 144.0;
          classLabel = "Class D";
        }

        if (isRenewal) {
          const lfTotal = classLfRate * years * units;
          lineItems.push({
            particular: `License Fee (${classLabel})`,
            itemCode: "LICENSE_FEE",
            description: `Amateur Station Annual License Fee (${classLabel})`,
            validityYears: years,
            noOfUnits: units,
            feeRate: classLfRate,
            amount: lfTotal,
          });
          const sur = calculateSurcharge(lfTotal, input.expirationDate, asOfDate);
          if (sur.amount > 0) {
            lineItems.push({
              particular: "Surcharge (Late Renewal Penalty)",
              itemCode: "SURCHARGE",
              description: sur.description,
              validityYears: 1,
              noOfUnits: 1,
              feeRate: sur.amount,
              amount: sur.amount,
              isSurcharge: true,
            });
          }
          formulaApplied = "FEEAT-RSL = (LF)(YR) + DST + SUR";
        } else {
          lineItems.push({
            particular: "Filing Fee",
            itemCode: "FILING_FEE",
            description: "Amateur License Application Filing Fee",
            validityYears: 1,
            noOfUnits: 1,
            feeRate: 60.0,
            amount: 60.0,
          });
          lineItems.push({
            particular: `License Fee (${classLabel})`,
            itemCode: "LICENSE_FEE",
            description: `Amateur Station Annual License Fee (${classLabel})`,
            validityYears: years,
            noOfUnits: units,
            feeRate: classLfRate,
            amount: classLfRate * years * units,
          });
          formulaApplied = "FEEAT-RSL = FF + (LF)(YR) + DST";
        }
      }
    }
  }
  // 4. Aeronautical Service
  else if (upperAct.includes("AERONAUTICAL") || upperApp.includes("AERONAUTICAL") || upperApp.includes("AIRCRAFT")) {
    const isAircraft = upperApp.includes("AIRCRAFT");
    const powerTier = resolvePowerTier(element);

    if (isAircraft) {
      const cpfRate = powerTier === LicensePowerTier.High ? 960.0 : powerTier === LicensePowerTier.Medium ? 840.0 : 720.0;
      const lfRate = powerTier === LicensePowerTier.High ? 1320.0 : powerTier === LicensePowerTier.Medium ? 1080.0 : 840.0;

      if (isModification) {
        lineItems.push({
          particular: "Filing Fee",
          itemCode: "FILING_FEE",
          description: "Aircraft Station License Modification Filing Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 180.0,
          amount: 180.0,
        });
        lineItems.push({
          particular: `Construction Permit Fee (${powerTier})`,
          itemCode: "CONSTRUCTION_PERMIT",
          description: "Aircraft Station Construction Permit Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: cpfRate,
          amount: cpfRate,
        });
        lineItems.push({
          particular: "Modification Fee",
          itemCode: "MODIFICATION",
          description: "Aircraft Station License Modification Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 180.0,
          amount: 180.0,
        });
        formulaApplied = "FEEASL = FF + CPF + MOD + DST";
      } else if (isRenewal) {
        const lfTotal = lfRate * years * units;
        lineItems.push({
          particular: `License Fee (${powerTier})`,
          itemCode: "LICENSE_FEE",
          description: `Aircraft Station Annual License Fee (${powerTier})`,
          validityYears: years,
          noOfUnits: units,
          feeRate: lfRate,
          amount: lfTotal,
        });
        lineItems.push({
          particular: "Inspection Fee",
          itemCode: "INSPECTION_FEE",
          description: "Aircraft Station Annual Inspection Fee",
          validityYears: years,
          noOfUnits: units,
          feeRate: 720.0,
          amount: 720.0 * years * units,
        });
        const sur = calculateSurcharge(lfTotal, input.expirationDate, asOfDate);
        if (sur.amount > 0) {
          lineItems.push({
            particular: "Surcharge (Late Renewal Penalty)",
            itemCode: "SURCHARGE",
            description: sur.description,
            validityYears: 1,
            noOfUnits: 1,
            feeRate: sur.amount,
            amount: sur.amount,
            isSurcharge: true,
          });
        }
        formulaApplied = "FEEASL = (LF)(YR) + (IF)(YR) + DST + SUR";
      } else {
        lineItems.push({
          particular: `Construction Permit Fee (${powerTier})`,
          itemCode: "CONSTRUCTION_PERMIT",
          description: "Aircraft Station Construction Permit Fee",
          validityYears: 1,
          noOfUnits: units,
          feeRate: cpfRate,
          amount: cpfRate * units,
        });
        lineItems.push({
          particular: `License Fee (${powerTier})`,
          itemCode: "LICENSE_FEE",
          description: `Aircraft Station Annual License Fee (${powerTier})`,
          validityYears: years,
          noOfUnits: units,
          feeRate: lfRate,
          amount: lfRate * years * units,
        });
        lineItems.push({
          particular: "Inspection Fee",
          itemCode: "INSPECTION_FEE",
          description: "Aircraft Station Annual Inspection Fee",
          validityYears: years,
          noOfUnits: units,
          feeRate: 720.0,
          amount: 720.0 * years * units,
        });
        formulaApplied = "FEEASL = CPF + (LF)(YR) + (IF)(YR) + DST";
      }
    } else {
      // Fixed Aeronautical
      const fixedCpfRate = 120.0;
      const fixedModCpfRate = powerTier === LicensePowerTier.High ? 1080.0 : powerTier === LicensePowerTier.Medium ? 840.0 : 600.0;
      const fixedLfRate = powerTier === LicensePowerTier.High ? 1080.0 : powerTier === LicensePowerTier.Medium ? 960.0 : 840.0;

      if (isModification) {
        lineItems.push({
          particular: "Filing Fee",
          itemCode: "FILING_FEE",
          description: "Fixed Aeronautical License Modification Filing Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 180.0,
          amount: 180.0,
        });
        lineItems.push({
          particular: `Construction Permit Fee (${powerTier})`,
          itemCode: "CONSTRUCTION_PERMIT",
          description: "Fixed Aeronautical Modification Construction Permit Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: fixedModCpfRate,
          amount: fixedModCpfRate,
        });
        lineItems.push({
          particular: "Modification Fee",
          itemCode: "MODIFICATION",
          description: "Fixed Aeronautical License Modification Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 180.0,
          amount: 180.0,
        });
        formulaApplied = "FEERSL = FF + CPF + MOD + DST";
      } else if (isRenewal) {
        const lfTotal = fixedLfRate * years * units;
        lineItems.push({
          particular: `License Fee (${powerTier})`,
          itemCode: "LICENSE_FEE",
          description: `Fixed Aeronautical Station Annual License Fee (${powerTier})`,
          validityYears: years,
          noOfUnits: units,
          feeRate: fixedLfRate,
          amount: lfTotal,
        });
        lineItems.push({
          particular: "Inspection Fee",
          itemCode: "INSPECTION_FEE",
          description: "Fixed Aeronautical Station Annual Inspection Fee",
          validityYears: years,
          noOfUnits: units,
          feeRate: 720.0,
          amount: 720.0 * years * units,
        });
        const sur = calculateSurcharge(lfTotal, input.expirationDate, asOfDate);
        if (sur.amount > 0) {
          lineItems.push({
            particular: "Surcharge (Late Renewal Penalty)",
            itemCode: "SURCHARGE",
            description: sur.description,
            validityYears: 1,
            noOfUnits: 1,
            feeRate: sur.amount,
            amount: sur.amount,
            isSurcharge: true,
          });
        }
        formulaApplied = "FEERSL = (LF)(YR) + (IF)(YR) + DST + SUR";
      } else {
        lineItems.push({
          particular: `Construction Permit Fee (${powerTier})`,
          itemCode: "CONSTRUCTION_PERMIT",
          description: "Fixed Aeronautical Construction Permit Fee",
          validityYears: 1,
          noOfUnits: units,
          feeRate: fixedCpfRate,
          amount: fixedCpfRate * units,
        });
        lineItems.push({
          particular: `License Fee (${powerTier})`,
          itemCode: "LICENSE_FEE",
          description: `Fixed Aeronautical Station Annual License Fee (${powerTier})`,
          validityYears: years,
          noOfUnits: units,
          feeRate: fixedLfRate,
          amount: fixedLfRate * years * units,
        });
        lineItems.push({
          particular: "Inspection Fee",
          itemCode: "INSPECTION_FEE",
          description: "Fixed Aeronautical Station Annual Inspection Fee",
          validityYears: years,
          noOfUnits: units,
          feeRate: 720.0,
          amount: 720.0 * years * units,
        });
        formulaApplied = "FEERSL = CPF + (LF)(YR) + (IF)(YR) + DST";
      }
    }
  }
  // 5. Maritime Service
  else if (upperAct.includes("MARITIME") || upperApp.includes("SHIP STATION") || upperApp.includes("COASTAL")) {
    const isInternational = upperApp.includes("INTERNATIONAL");
    const isPrivateCoastal = upperApp.includes("PRIVATE COASTAL") || (upperApp.includes("PRIVATE") && (upperApp.includes("COAST") || upperApp.includes("COASTAL")));
    const isPublicCoastal = upperApp.includes("PUBLIC COASTAL") || (upperApp.includes("PUBLIC") && (upperApp.includes("COAST") || upperApp.includes("COASTAL")));
    const powerTier = resolvePowerTier(element);

    if (isInternational) {
      if (isModification) {
        const purRate = powerTier === LicensePowerTier.High ? 240.0 : powerTier === LicensePowerTier.Medium ? 180.0 : 96.0;
        const posRate = powerTier === LicensePowerTier.High ? 120.0 : powerTier === LicensePowerTier.Medium ? 96.0 : 60.0;
        lineItems.push({
          particular: "Filing Fee",
          itemCode: "FILING_FEE",
          description: "International Ship Station Modification Filing Fee",
          validityYears: 1,
          noOfUnits: units,
          feeRate: 180.0,
          amount: 180.0 * units,
        });
        lineItems.push({
          particular: `Purchase Permit Fee (${powerTier})`,
          itemCode: "PURCHASE",
          description: "Purchase Permit Fee per Unit",
          validityYears: 1,
          noOfUnits: units,
          feeRate: purRate,
          amount: purRate * units,
        });
        lineItems.push({
          particular: `Possess Permit Fee (${powerTier})`,
          itemCode: "POSSESS",
          description: "Possess Permit Fee per Unit",
          validityYears: 1,
          noOfUnits: units,
          feeRate: posRate,
          amount: posRate * units,
        });
        lineItems.push({
          particular: "Construction Permit Fee",
          itemCode: "CONSTRUCTION_PERMIT",
          description: "International Ship Station Construction Permit Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 1200.0,
          amount: 1200.0,
        });
        lineItems.push({
          particular: "Modification Fee",
          itemCode: "MODIFICATION",
          description: "International Ship Station Modification Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 180.0,
          amount: 180.0,
        });
        formulaApplied = "FEESSL = (FF)(UNIT) + (PUR)(UNIT) + (POS)(UNIT) + CPF + MOD + DST";
      } else {
        const lfTotal = 180.0 * years * units;
        lineItems.push({
          particular: "License Fee",
          itemCode: "LICENSE_FEE",
          description: "International Ship Station Annual License Fee",
          validityYears: years,
          noOfUnits: units,
          feeRate: 180.0,
          amount: lfTotal,
        });
        lineItems.push({
          particular: "Inspection Fee",
          itemCode: "INSPECTION_FEE",
          description: "International Ship Station Annual Inspection Fee",
          validityYears: years,
          noOfUnits: units,
          feeRate: 1200.0,
          amount: 1200.0 * years * units,
        });
        const sur = calculateSurcharge(lfTotal, input.expirationDate, asOfDate);
        if (sur.amount > 0) {
          lineItems.push({
            particular: "Surcharge (Late Renewal Penalty)",
            itemCode: "SURCHARGE",
            description: sur.description,
            validityYears: 1,
            noOfUnits: 1,
            feeRate: sur.amount,
            amount: sur.amount,
            isSurcharge: true,
          });
        }
        formulaApplied = "FEESSL = (LF)(YR) + (IF)(YR) + DST + SUR";
      }
    } else if (isPrivateCoastal) {
      const isTelephony = element.includes("Telephony") || element.includes("HF") || element.includes("VHF") || upperApp.includes("VHF") || upperApp.includes("HF");
      const isVhf = element.includes("VHF") || upperApp.includes("VHF");

      let cpfRate: number;
      let lfRate: number;
      let ifRate: number;

      if (isTelephony) {
        if (isVhf) {
          cpfRate = 480.0;
          lfRate = 480.0;
          ifRate = 480.0;
        } else {
          cpfRate = 480.0;
          lfRate = 720.0;
          ifRate = 720.0;
        }
      } else {
        cpfRate = powerTier === LicensePowerTier.High ? 1320.0 : powerTier === LicensePowerTier.Medium ? 960.0 : 600.0;
        lfRate = powerTier === LicensePowerTier.High ? 1440.0 : powerTier === LicensePowerTier.Medium ? 1200.0 : 1080.0;
        ifRate = 720.0;
      }

      if (isModification) {
        lineItems.push({
          particular: "Filing Fee",
          itemCode: "FILING_FEE",
          description: "Private Coastal Station Modification Filing Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 180.0,
          amount: 180.0,
        });
        lineItems.push({
          particular: "Construction Permit Fee",
          itemCode: "CONSTRUCTION_PERMIT",
          description: "Private Coastal Station Construction Permit Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: cpfRate,
          amount: cpfRate,
        });
        lineItems.push({
          particular: "Modification Fee",
          itemCode: "MODIFICATION",
          description: "Private Coastal Station Modification Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 180.0,
          amount: 180.0,
        });
        formulaApplied = "FEEPRI-COASTAL = FF + CPF + MOD + DST";
      } else if (isRenewal) {
        const lfTotal = lfRate * years * units;
        lineItems.push({
          particular: "License Fee",
          itemCode: "LICENSE_FEE",
          description: "Private Coastal Station Annual License Fee",
          validityYears: years,
          noOfUnits: units,
          feeRate: lfRate,
          amount: lfTotal,
        });
        lineItems.push({
          particular: "Inspection Fee",
          itemCode: "INSPECTION_FEE",
          description: "Private Coastal Station Annual Inspection Fee",
          validityYears: years,
          noOfUnits: units,
          feeRate: ifRate,
          amount: ifRate * years * units,
        });
        const sur = calculateSurcharge(lfTotal, input.expirationDate, asOfDate);
        if (sur.amount > 0) {
          lineItems.push({
            particular: "Surcharge (Late Renewal Penalty)",
            itemCode: "SURCHARGE",
            description: sur.description,
            validityYears: 1,
            noOfUnits: 1,
            feeRate: sur.amount,
            amount: sur.amount,
            isSurcharge: true,
          });
        }
        formulaApplied = "FEEPRI-COASTAL = (LF)(YR) + (IF)(YR) + DST + SUR";
      } else {
        lineItems.push({
          particular: "Construction Permit Fee",
          itemCode: "CONSTRUCTION_PERMIT",
          description: "Private Coastal Station Construction Permit Fee",
          validityYears: 1,
          noOfUnits: units,
          feeRate: cpfRate,
          amount: cpfRate * units,
        });
        lineItems.push({
          particular: "License Fee",
          itemCode: "LICENSE_FEE",
          description: "Private Coastal Station Annual License Fee",
          validityYears: years,
          noOfUnits: units,
          feeRate: lfRate,
          amount: lfRate * years * units,
        });
        lineItems.push({
          particular: "Inspection Fee",
          itemCode: "INSPECTION_FEE",
          description: "Private Coastal Station Annual Inspection Fee",
          validityYears: years,
          noOfUnits: units,
          feeRate: ifRate,
          amount: ifRate * years * units,
        });
        formulaApplied = "FEEPRI-COASTAL = CPF + (LF)(YR) + (IF)(YR) + DST";
      }
    } else if (isPublicCoastal) {
      const isTelephony = element.includes("Telephony") || element.includes("HF") || element.includes("VHF") || upperApp.includes("VHF") || upperApp.includes("HF");
      const isVhf = element.includes("VHF") || upperApp.includes("VHF");

      let cpfRate: number;
      let lfRate: number;
      let ifRate: number;

      if (isTelephony) {
        if (isVhf) {
          cpfRate = 480.0;
          lfRate = 1200.0;
          ifRate = 480.0;
        } else {
          cpfRate = 480.0;
          lfRate = powerTier === LicensePowerTier.High ? 1560.0 : powerTier === LicensePowerTier.Medium ? 1080.0 : 480.0;
          ifRate = 720.0;
        }
      } else {
        cpfRate = powerTier === LicensePowerTier.High ? 1200.0 : powerTier === LicensePowerTier.Medium ? 840.0 : 480.0;
        lfRate = powerTier === LicensePowerTier.High ? 2160.0 : powerTier === LicensePowerTier.Medium ? 1680.0 : 1200.0;
        ifRate = 840.0;
      }

      if (isModification) {
        lineItems.push({
          particular: "Filing Fee",
          itemCode: "FILING_FEE",
          description: "Public Coastal Station Modification Filing Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 180.0,
          amount: 180.0,
        });
        lineItems.push({
          particular: "Construction Permit Fee",
          itemCode: "CONSTRUCTION_PERMIT",
          description: "Public Coastal Station Construction Permit Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: cpfRate,
          amount: cpfRate,
        });
        lineItems.push({
          particular: "Modification Fee",
          itemCode: "MODIFICATION",
          description: "Public Coastal Station Modification Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 180.0,
          amount: 180.0,
        });
        formulaApplied = "FEEPUB-COASTAL = FF + CPF + MOD + DST";
      } else if (isRenewal) {
        const lfTotal = lfRate * years * units;
        lineItems.push({
          particular: "License Fee",
          itemCode: "LICENSE_FEE",
          description: "Public Coastal Station Annual License Fee",
          validityYears: years,
          noOfUnits: units,
          feeRate: lfRate,
          amount: lfTotal,
        });
        lineItems.push({
          particular: "Inspection Fee",
          itemCode: "INSPECTION_FEE",
          description: "Public Coastal Station Annual Inspection Fee",
          validityYears: years,
          noOfUnits: units,
          feeRate: ifRate,
          amount: ifRate * years * units,
        });
        const sur = calculateSurcharge(lfTotal, input.expirationDate, asOfDate);
        if (sur.amount > 0) {
          lineItems.push({
            particular: "Surcharge (Late Renewal Penalty)",
            itemCode: "SURCHARGE",
            description: sur.description,
            validityYears: 1,
            noOfUnits: 1,
            feeRate: sur.amount,
            amount: sur.amount,
            isSurcharge: true,
          });
        }
        formulaApplied = "FEEPUB-COASTAL = (LF)(YR) + (IF)(YR) + DST + SUR";
      } else {
        lineItems.push({
          particular: "Construction Permit Fee",
          itemCode: "CONSTRUCTION_PERMIT",
          description: "Public Coastal Station Construction Permit Fee",
          validityYears: 1,
          noOfUnits: units,
          feeRate: cpfRate,
          amount: cpfRate * units,
        });
        lineItems.push({
          particular: "License Fee",
          itemCode: "LICENSE_FEE",
          description: "Public Coastal Station Annual License Fee",
          validityYears: years,
          noOfUnits: units,
          feeRate: lfRate,
          amount: lfRate * years * units,
        });
        lineItems.push({
          particular: "Inspection Fee",
          itemCode: "INSPECTION_FEE",
          description: "Public Coastal Station Annual Inspection Fee",
          validityYears: years,
          noOfUnits: units,
          feeRate: ifRate,
          amount: ifRate * years * units,
        });
        formulaApplied = "FEEPUB-COASTAL = CPF + (LF)(YR) + (IF)(YR) + DST";
      }
    } else {
      // Domestic Ship Station
      const domCpfRate = powerTier === LicensePowerTier.High ? 720.0 : powerTier === LicensePowerTier.Medium ? 600.0 : 480.0;
      const domLfRate = powerTier === LicensePowerTier.High ? 840.0 : powerTier === LicensePowerTier.Medium ? 720.0 : 600.0;

      if (isModification) {
        lineItems.push({
          particular: "Filing Fee",
          itemCode: "FILING_FEE",
          description: "Ship Station Domestic Modification Filing Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 180.0,
          amount: 180.0,
        });
        lineItems.push({
          particular: `Construction Permit Fee (${powerTier})`,
          itemCode: "CONSTRUCTION_PERMIT",
          description: "Ship Station Construction Permit Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: domCpfRate,
          amount: domCpfRate,
        });
        lineItems.push({
          particular: "Modification Fee",
          itemCode: "MODIFICATION",
          description: "Ship Station Modification Fee",
          validityYears: 1,
          noOfUnits: 1,
          feeRate: 180.0,
          amount: 180.0,
        });
        formulaApplied = "FEESSL = FF + CPF + MOD + DST";
      } else if (isRenewal) {
        const lfTotal = domLfRate * years * units;
        lineItems.push({
          particular: `License Fee (${powerTier})`,
          itemCode: "LICENSE_FEE",
          description: `Ship Station Domestic Annual License Fee (${powerTier})`,
          validityYears: years,
          noOfUnits: units,
          feeRate: domLfRate,
          amount: lfTotal,
        });
        lineItems.push({
          particular: "Inspection Fee",
          itemCode: "INSPECTION_FEE",
          description: "Ship Station Domestic Annual Inspection Fee",
          validityYears: years,
          noOfUnits: units,
          feeRate: 720.0,
          amount: 720.0 * years * units,
        });
        const sur = calculateSurcharge(lfTotal, input.expirationDate, asOfDate);
        if (sur.amount > 0) {
          lineItems.push({
            particular: "Surcharge (Late Renewal Penalty)",
            itemCode: "SURCHARGE",
            description: sur.description,
            validityYears: 1,
            noOfUnits: 1,
            feeRate: sur.amount,
            amount: sur.amount,
            isSurcharge: true,
          });
        }
        formulaApplied = "FEESSL = (LF)(YR) + (IF)(YR) + DST + SUR";
      } else {
        const withOriginalEquip = upperApp.includes("WITH ORIGINALLY") || upperApp.includes("ORIGINALLY0");
        if (withOriginalEquip) {
          const purRate = powerTier === LicensePowerTier.High ? 240.0 : powerTier === LicensePowerTier.Medium ? 180.0 : 96.0;
          const posRate = powerTier === LicensePowerTier.High ? 120.0 : powerTier === LicensePowerTier.Medium ? 96.0 : 60.0;

          lineItems.push({
            particular: "Filing Fee",
            itemCode: "FILING_FEE",
            description: "Ship Station Domestic Application Filing Fee",
            validityYears: 1,
            noOfUnits: units,
            feeRate: 180.0,
            amount: 180.0 * units,
          });
          lineItems.push({
            particular: `Purchase Permit Fee (${powerTier})`,
            itemCode: "PURCHASE",
            description: "Purchase Permit Fee per Unit",
            validityYears: 1,
            noOfUnits: units,
            feeRate: purRate,
            amount: purRate * units,
          });
          lineItems.push({
            particular: `Possess Permit Fee (${powerTier})`,
            itemCode: "POSSESS",
            description: "Possess Permit Fee per Unit",
            validityYears: 1,
            noOfUnits: units,
            feeRate: posRate,
            amount: posRate * units,
          });
          lineItems.push({
            particular: `Construction Permit Fee (${powerTier})`,
            itemCode: "CONSTRUCTION_PERMIT",
            description: "Ship Station Construction Permit Fee",
            validityYears: 1,
            noOfUnits: 1,
            feeRate: domCpfRate,
            amount: domCpfRate,
          });
          lineItems.push({
            particular: `License Fee (${powerTier})`,
            itemCode: "LICENSE_FEE",
            description: `Ship Station Domestic Annual License Fee (${powerTier})`,
            validityYears: years,
            noOfUnits: units,
            feeRate: domLfRate,
            amount: domLfRate * years * units,
          });
          lineItems.push({
            particular: "Inspection Fee",
            itemCode: "INSPECTION_FEE",
            description: "Ship Station Domestic Annual Inspection Fee",
            validityYears: years,
            noOfUnits: units,
            feeRate: 720.0,
            amount: 720.0 * years * units,
          });
          formulaApplied = "FEESSL = (FF)(UNIT) + (PUR)(UNIT) + (POS)(UNIT) + CPF + (LF)(YR) + (IF)(YR) + DST";
        } else {
          lineItems.push({
            particular: `Construction Permit Fee (${powerTier})`,
            itemCode: "CONSTRUCTION_PERMIT",
            description: "Ship Station Construction Permit Fee",
            validityYears: 1,
            noOfUnits: 1,
            feeRate: domCpfRate,
            amount: domCpfRate,
          });
          lineItems.push({
            particular: `License Fee (${powerTier})`,
            itemCode: "LICENSE_FEE",
            description: `Ship Station Domestic Annual License Fee (${powerTier})`,
            validityYears: years,
            noOfUnits: units,
            feeRate: domLfRate,
            amount: domLfRate * years * units,
          });
          lineItems.push({
            particular: "Inspection Fee",
            itemCode: "INSPECTION_FEE",
            description: "Ship Station Domestic Annual Inspection Fee",
            validityYears: years,
            noOfUnits: units,
            feeRate: 720.0,
            amount: 720.0 * years * units,
          });
          formulaApplied = "FEESSL = CPF + (LF)(YR) + (IF)(YR) + DST";
        }
      }
    }
  }
  // 6. Other Radio Stations (Microwave, VSAT, Public Trunked, BWA, BTS)
  else if (
    upperAct.includes("OTHER RADIO") ||
    upperApp.includes("MICROWAVE") ||
    upperApp.includes("VSAT") ||
    upperApp.includes("PUBLIC TRUNKED") ||
    upperApp.includes("BWA") ||
    upperApp.includes("BTS")
  ) {
    if (upperApp.includes("BTS") && isModification) {
      lineItems.push({
        particular: "Filing Fee",
        itemCode: "FILING_FEE",
        description: "BTS Modification Filing Fee",
        validityYears: 1,
        noOfUnits: 1,
        feeRate: 180.0,
        amount: 180.0,
      });
      lineItems.push({
        particular: "Construction Permit Fee",
        itemCode: "CONSTRUCTION_PERMIT",
        description: "BTS Construction Permit Fee per Channel",
        validityYears: 1,
        noOfUnits: channels,
        feeRate: 360.0,
        amount: 360.0 * channels,
      });
      lineItems.push({
        particular: "Modification Fee",
        itemCode: "MODIFICATION",
        description: "BTS Modification Fee",
        validityYears: 1,
        noOfUnits: 1,
        feeRate: 180.0,
        amount: 180.0,
      });
      formulaApplied = "FEERSL = FF + (CPF)(CH_UNIT) + MOD + DST";
    } else {
      let lfRate = 480.0;
      let ifRate = 480.0;
      if (upperApp.includes("MICROWAVE")) {
        lfRate = 480.0;
        ifRate = 480.0;
      } else if (upperApp.includes("VSAT")) {
        lfRate = 360.0;
        ifRate = 420.0;
      } else if (upperApp.includes("PUBLIC TRUNKED")) {
        lfRate = 1680.0;
        ifRate = 360.0;
      } else if (upperApp.includes("BWA")) {
        lfRate = 480.0;
        ifRate = 480.0;
      } else if (upperApp.includes("WDN")) {
        lfRate = 480.0;
        ifRate = 480.0;
      } else if (upperApp.includes("BTS")) {
        lfRate = 480.0;
        ifRate = 480.0;
      }

      const lfTotal = lfRate * channels * units * years;
      lineItems.push({
        particular: "License Fee",
        itemCode: "LICENSE_FEE",
        description: "Radio Station Annual License Fee per Channel/Unit",
        validityYears: years,
        noOfUnits: channels * units,
        feeRate: lfRate,
        amount: lfTotal,
      });
      lineItems.push({
        particular: "Inspection Fee",
        itemCode: "INSPECTION_FEE",
        description: "Radio Station Annual Inspection Fee per Channel/Unit",
        validityYears: years,
        noOfUnits: channels * units,
        feeRate: ifRate,
        amount: ifRate * channels * units * years,
      });

      if (isRenewal) {
        const sur = calculateSurcharge(lfTotal, input.expirationDate, asOfDate);
        if (sur.amount > 0) {
          lineItems.push({
            particular: "Surcharge (Late Renewal Penalty)",
            itemCode: "SURCHARGE",
            description: sur.description,
            validityYears: 1,
            noOfUnits: 1,
            feeRate: sur.amount,
            amount: sur.amount,
            isSurcharge: true,
          });
        }
      }
      formulaApplied = "FEERSL = (LF)(CH_UNIT)(YR) + (IF)(CH_UNIT)(YR) + (SUF)(YR) + DST + SUR";
    }
  }
  // 7. Fixed and Land Mobile (FLM)
  else {
    const isPortable = element.includes("PORTABLE") || element.includes("(P)") || element.includes(" P ");
    const isRepeater = element.includes("REPEATER") || element.includes("(RT)");
    const isLandBase = element.includes("LAND BASE") || element.includes("(FB)");
    const isLandMobile = element.includes("LAND MOBILE") || element.includes("(ML)");
    const isFixed = !isPortable && !isRepeater && !isLandBase && !isLandMobile;

    const isDuplex = element.includes("DUPLEX");
    const isWdn = element.includes("WDN") || element.includes("WIRELESS DATA NETWORK");
    const powerTier = resolvePowerTier(element);

    const cpfRate = isPortable ? 0.0 : isRepeater ? 600.0 : 240.0;

    let lfRate = 480.0;
    let ifRate = 240.0;

    if (isWdn) {
      lfRate = isFixed ? 480.0 : 240.0;
      ifRate = isFixed ? 480.0 : 240.0;
    } else if (isDuplex) {
      if (isRepeater) {
        lfRate = 1320.0;
        ifRate = 480.0;
      } else if (isFixed) {
        lfRate = powerTier === LicensePowerTier.High ? 1200.0 : powerTier === LicensePowerTier.Medium ? 960.0 : 720.0;
        ifRate = 480.0;
      } else if (isLandBase) {
        lfRate = powerTier === LicensePowerTier.High ? 1440.0 : powerTier === LicensePowerTier.Medium ? 1200.0 : 960.0;
        ifRate = 480.0;
      } else if (isLandMobile) {
        lfRate = powerTier === LicensePowerTier.High ? 960.0 : powerTier === LicensePowerTier.Medium ? 720.0 : 960.0;
        ifRate = powerTier === LicensePowerTier.Low ? 480.0 : 240.0;
      } else {
        // Portable Duplex
        lfRate = powerTier === LicensePowerTier.High ? 960.0 : 480.0;
        ifRate = 240.0;
      }
    } else {
      // Simplex
      if (isFixed) {
        lfRate = powerTier === LicensePowerTier.High ? 600.0 : powerTier === LicensePowerTier.Medium ? 480.0 : 360.0;
        ifRate = 480.0;
      } else if (isLandBase) {
        lfRate = powerTier === LicensePowerTier.High ? 720.0 : powerTier === LicensePowerTier.Medium ? 600.0 : 480.0;
        ifRate = 480.0;
      } else if (isLandMobile) {
        lfRate = powerTier === LicensePowerTier.High ? 480.0 : powerTier === LicensePowerTier.Medium ? 360.0 : 240.0;
        ifRate = powerTier === LicensePowerTier.High ? 480.0 : 240.0;
      } else {
        // Portable Simplex
        lfRate = powerTier === LicensePowerTier.High ? 480.0 : powerTier === LicensePowerTier.Medium ? 360.0 : 240.0;
        ifRate = 240.0;
      }
    }

    if (isModification) {
      if (isPortable) {
        lineItems.push({
          particular: "Modification Fee",
          itemCode: "MODIFICATION",
          description: "Portable Station Modification Fee",
          validityYears: 1,
          noOfUnits: units,
          feeRate: 180.0,
          amount: 180.0 * units,
        });
        formulaApplied = "FEERSL = MOD + DST";
      } else {
        lineItems.push({
          particular: "Filing Fee",
          itemCode: "FILING_FEE",
          description: "Station Modification Filing Fee",
          validityYears: 1,
          noOfUnits: units,
          feeRate: 180.0,
          amount: 180.0 * units,
        });
        lineItems.push({
          particular: "Construction Permit Fee",
          itemCode: "CONSTRUCTION_PERMIT",
          description: "Station Construction Permit Fee",
          validityYears: 1,
          noOfUnits: units,
          feeRate: cpfRate,
          amount: cpfRate * units,
        });
        lineItems.push({
          particular: "Modification Fee",
          itemCode: "MODIFICATION",
          description: "Station Modification Fee",
          validityYears: 1,
          noOfUnits: units,
          feeRate: 180.0,
          amount: 180.0 * units,
        });
        formulaApplied = "FEERSL = (FF)(UNIT) + (CPF)(UNIT) + (MOD)(UNIT) + DST";
      }
    } else if (isRenewal) {
      const lfTotal = lfRate * channels * units * years;
      lineItems.push({
        particular: "License Fee",
        itemCode: "LICENSE_FEE",
        description: "Radio Station Annual License Fee per Channel/Unit",
        validityYears: years,
        noOfUnits: channels * units,
        feeRate: lfRate,
        amount: lfTotal,
      });
      lineItems.push({
        particular: "Inspection Fee",
        itemCode: "INSPECTION_FEE",
        description: "Radio Station Annual Inspection Fee per Unit",
        validityYears: years,
        noOfUnits: units,
        feeRate: ifRate,
        amount: ifRate * units * years,
      });
      const sur = calculateSurcharge(lfTotal, input.expirationDate, asOfDate);
      if (sur.amount > 0) {
        lineItems.push({
          particular: "Surcharge (Late Renewal Penalty)",
          itemCode: "SURCHARGE",
          description: sur.description,
          validityYears: 1,
          noOfUnits: 1,
          feeRate: sur.amount,
          amount: sur.amount,
          isSurcharge: true,
        });
      }
      formulaApplied = "FEERSL = (LF)(CH_UNIT)(YR) + (IF)(UNIT)(YR) + (SUF)(CH_UNIT)(YR) + DST + SUR";
    } else {
      // New FLM
      if (cpfRate > 0) {
        lineItems.push({
          particular: "Construction Permit Fee",
          itemCode: "CONSTRUCTION_PERMIT",
          description: "Radio Station Construction Permit Fee per Unit",
          validityYears: 1,
          noOfUnits: units,
          feeRate: cpfRate,
          amount: cpfRate * units,
        });
      }
      lineItems.push({
        particular: "License Fee",
        itemCode: "LICENSE_FEE",
        description: "Radio Station Annual License Fee per Channel/Unit",
        validityYears: years,
        noOfUnits: channels * units,
        feeRate: lfRate,
        amount: lfRate * channels * units * years,
      });
      lineItems.push({
        particular: "Inspection Fee",
        itemCode: "INSPECTION_FEE",
        description: "Radio Station Annual Inspection Fee per Unit",
        validityYears: years,
        noOfUnits: units,
        feeRate: ifRate,
        amount: ifRate * units * years,
      });
      formulaApplied = "FEERSL = (CPF)(UNIT) + (LF)(CH_UNIT)(YR) + (IF)(UNIT)(YR) + (SUF)(CH_UNIT)(YR) + DST";
    }
  }

  // Statutory Documentary Stamp Tax (DST)
  lineItems.push({
    particular: "Documentary Stamp Tax (DST)",
    itemCode: "DST",
    description: "Statutory Documentary Stamp Tax",
    validityYears: 1,
    noOfUnits: 1,
    feeRate: DST_AMOUNT,
    amount: DST_AMOUNT,
    isTax: true,
  });

  const subTotal = lineItems
    .filter((li) => !li.isSurcharge && !li.isTax)
    .reduce((sum, li) => sum + li.amount, 0);
  const surchargeAmount = lineItems
    .filter((li) => Boolean(li.isSurcharge))
    .reduce((sum, li) => sum + li.amount, 0);
  const taxAmount = lineItems
    .filter((li) => Boolean(li.isTax))
    .reduce((sum, li) => sum + li.amount, 0);
  const totalAmount = lineItems.reduce((sum, li) => sum + li.amount, 0);

  return {
    activity,
    applicationType: appType,
    element: element.length > 0 ? element : null,
    formulaApplied,
    subTotal,
    surchargeAmount,
    taxAmount,
    totalAmount,
    lineItems,
  };
}
