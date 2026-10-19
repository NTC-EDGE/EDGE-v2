import {
  PermitFeeComputationParams,
  PermitFeeComputationResult,
  PermitFeeLineItem,
} from "../types/permitFeeTypes";

const DST_AMOUNT = 30;

function calculateSurcharge(
  basePermitFee: number,
  expirationDate?: string | Date | null,
  asOfDate?: string | Date | null
): { surchargeAmount: number; description: string } {
  if (!expirationDate) return { surchargeAmount: 0, description: "" };

  const exp = typeof expirationDate === "string" ? new Date(expirationDate) : expirationDate;
  const asOf = asOfDate ? (typeof asOfDate === "string" ? new Date(asOfDate) : asOfDate) : new Date();

  if (isNaN(exp.getTime()) || isNaN(asOf.getTime())) {
    return { surchargeAmount: 0, description: "" };
  }

  const diffMs = asOf.getTime() - exp.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return { surchargeAmount: 0, description: "" };

  let multiplier = 0;
  let tierDesc = "";

  if (diffDays <= 180) {
    multiplier = 0.5;
    tierDesc = "Late Renewal Surcharge (1-180 days: 50%)";
  } else if (diffDays <= 365) {
    multiplier = 1.0;
    tierDesc = "Late Renewal Surcharge (181-365 days: 100%)";
  } else if (diffDays <= 545) {
    multiplier = 1.5;
    tierDesc = "Late Renewal Surcharge (366-545 days: 150%)";
  } else {
    multiplier = 2.0;
    tierDesc = "Late Renewal Surcharge (>545 days: 200%)";
  }

  return {
    surchargeAmount: basePermitFee * multiplier,
    description: tierDesc,
  };
}

function resolvePowerRates(element: string, appType: string) {
  const combined = `${element} ${appType}`.toUpperCase();

  if (
    combined.includes("HIGH") ||
    combined.includes("ABOVE 100W") ||
    combined.includes("> 100W") ||
    combined.includes(">100W")
  ) {
    return { pur: 240, pos: 120, stf: 240, desc: "High Powered >100W" };
  }
  if (
    combined.includes("MEDIUM") ||
    combined.includes("UP TO 100W") ||
    combined.includes("25W-100W") ||
    combined.includes("25W - 100W") ||
    combined.includes("25 TO 100")
  ) {
    return { pur: 120, pos: 96, stf: 120, desc: "Medium Powered >25W-100W" };
  }
  if (
    combined.includes("LOW") ||
    combined.includes("25W AND BELOW") ||
    combined.includes("25W BELOW") ||
    combined.includes("<= 25W") ||
    combined.includes("≤ 25W") ||
    combined.includes("25W & BELOW")
  ) {
    return { pur: 96, pos: 60, stf: 96, desc: "Low Powered ≤25W" };
  }

  return { pur: 240, pos: 120, stf: 240, desc: "High Powered >100W" };
}

function calculateCopyOfPermits(
  appType: string,
  copies: number,
  lineItems: PermitFeeLineItem[]
): string {
  if (appType.toUpperCase().includes("DUPLICATE")) {
    lineItems.push({
      particular: "Duplicate Copy Fee",
      itemCode: "DUP",
      description: "Duplicate Permit Re-issuance Fee",
      validityYears: 1,
      noOfUnits: 1,
      feeRate: 120,
      amount: 120,
    });
    return "TOTAL = DUP + DST";
  }

  const totalCopies = Math.max(1, copies);
  lineItems.push({
    particular: "First Copy Fee",
    itemCode: "FC",
    description: "Permit Certified True Copy - First Copy",
    validityYears: 1,
    noOfUnits: 1,
    feeRate: 24,
    amount: 24,
  });

  if (totalCopies > 1) {
    const succeeding = totalCopies - 1;
    lineItems.push({
      particular: "Succeeding Copies Fee",
      itemCode: "SC",
      description: `Permit Certified True Copy - ${succeeding} succeeding page(s)/copy`,
      validityYears: 1,
      noOfUnits: succeeding,
      feeRate: 6,
      amount: 6 * succeeding,
    });
  }

  return "TOTAL = FC + (SC)(COPY) + DST";
}

function calculateMobilePhonePermits(
  appTypeUpper: string,
  elementUpper: string,
  years: number,
  expirationDate: string | Date | null | undefined,
  asOfDate: string | Date | null | undefined,
  lineItems: PermitFeeLineItem[]
): string {
  const isRenewal = appTypeUpper.includes("RENEWAL");
  const isModification = appTypeUpper.includes("MODIFICATION");
  const isBranch = elementUpper.includes("BRANCH") || appTypeUpper.includes("BRANCH");

  if (appTypeUpper.includes("SERVICE CENTER")) {
    if (isModification) {
      lineItems.push({
        particular: "Modification Fee",
        itemCode: "MOD",
        description: "Mobile Phone Service Center Modification",
        validityYears: 1,
        noOfUnits: 1,
        feeRate: 120,
        amount: 120,
      });
      return "FEEMPSCP = MOD + DST";
    }

    const pf = 1200;
    const iF = 720;
    if (!isRenewal) {
      lineItems.push({
        particular: "Filing Fee",
        itemCode: "FF",
        description: "Administrative Filing Fee",
        validityYears: 1,
        noOfUnits: 1,
        feeRate: 180,
        amount: 180,
      });
    }

    lineItems.push({
      particular: "Permit Fee",
      itemCode: "PF",
      description: "Mobile Phone Service Center Permit Fee",
      validityYears: years,
      noOfUnits: 1,
      feeRate: pf,
      amount: pf * years,
    });
    lineItems.push({
      particular: "Inspection Fee",
      itemCode: "IF",
      description: "Mobile Phone Service Center Inspection Fee",
      validityYears: years,
      noOfUnits: 1,
      feeRate: iF,
      amount: iF * years,
    });

    if (isRenewal && expirationDate) {
      const { surchargeAmount, description } = calculateSurcharge(pf, expirationDate, asOfDate);
      if (surchargeAmount > 0) {
        lineItems.push({
          particular: "Surcharge (Late Renewal Penalty)",
          itemCode: "SUR",
          description,
          validityYears: 1,
          noOfUnits: 1,
          feeRate: surchargeAmount,
          amount: surchargeAmount,
          isSurcharge: true,
        });
      }
      return "FEEMPSCP = (PF)(YR) + (IF)(YR) + DST + SUR";
    }
    return "FEEMPSCP = FF + (PF)(YR) + (IF)(YR) + DST";
  }

  if (appTypeUpper.includes("RETAILER") || appTypeUpper.includes("RESELLER")) {
    if (isModification) {
      lineItems.push({
        particular: "Modification Fee",
        itemCode: "MOD",
        description: "Mobile Phone Retailer/Reseller Modification",
        validityYears: 1,
        noOfUnits: 1,
        feeRate: 120,
        amount: 120,
      });
      return "FEEMPRRP = MOD + DST";
    }

    const pf = 1500;
    const iF = 1500;
    if (!isRenewal) {
      lineItems.push({
        particular: "Filing Fee",
        itemCode: "FF",
        description: "Administrative Filing Fee",
        validityYears: 1,
        noOfUnits: 1,
        feeRate: 500,
        amount: 500,
      });
    }

    lineItems.push({
      particular: "Permit Fee",
      itemCode: "PF",
      description: "Mobile Phone Retailer/Reseller Permit Fee",
      validityYears: years,
      noOfUnits: 1,
      feeRate: pf,
      amount: pf * years,
    });
    lineItems.push({
      particular: "Inspection Fee",
      itemCode: "IF",
      description: "Mobile Phone Retailer/Reseller Inspection Fee",
      validityYears: years,
      noOfUnits: 1,
      feeRate: iF,
      amount: iF * years,
    });

    if (isRenewal && expirationDate) {
      const { surchargeAmount, description } = calculateSurcharge(pf, expirationDate, asOfDate);
      if (surchargeAmount > 0) {
        lineItems.push({
          particular: "Surcharge (Late Renewal Penalty)",
          itemCode: "SUR",
          description,
          validityYears: 1,
          noOfUnits: 1,
          feeRate: surchargeAmount,
          amount: surchargeAmount,
          isSurcharge: true,
        });
      }
      return "FEEMPRRP = (PF)(YR) + (IF)(YR) + DST + SUR";
    }
    return "FEEMPRRP = FF + (PF)(YR) + (IF)(YR) + DST";
  }

  // Dealer Permit (Main / Branch)
  if (isModification) {
    lineItems.push({
      particular: "Modification Fee",
      itemCode: "MOD",
      description: "Mobile Phone Dealer Modification",
      validityYears: 1,
      noOfUnits: 1,
      feeRate: 120,
      amount: 120,
    });
    return "FEEMPDP = MOD + DST";
  }

  const dealerPf = isBranch ? 1500 : 2500;
  const dealerIf = 1500;
  const dealerDesc = isBranch ? "Mobile Phone Dealer (Branch) Permit Fee" : "Mobile Phone Dealer (Main) Permit Fee";

  if (!isRenewal) {
    lineItems.push({
      particular: "Filing Fee",
      itemCode: "FF",
      description: "Administrative Filing Fee",
      validityYears: 1,
      noOfUnits: 1,
      feeRate: 500,
      amount: 500,
    });
  }

  lineItems.push({
    particular: "Permit Fee",
    itemCode: "PF",
    description: dealerDesc,
    validityYears: years,
    noOfUnits: 1,
    feeRate: dealerPf,
    amount: dealerPf * years,
  });
  lineItems.push({
    particular: "Inspection Fee",
    itemCode: "IF",
    description: "Mobile Phone Dealer Inspection Fee",
    validityYears: years,
    noOfUnits: 1,
    feeRate: dealerIf,
    amount: dealerIf * years,
  });

  if (isRenewal && expirationDate) {
    const { surchargeAmount, description } = calculateSurcharge(dealerPf, expirationDate, asOfDate);
    if (surchargeAmount > 0) {
      lineItems.push({
        particular: "Surcharge (Late Renewal Penalty)",
        itemCode: "SUR",
        description,
        validityYears: 1,
        noOfUnits: 1,
        feeRate: surchargeAmount,
        amount: surchargeAmount,
        isSurcharge: true,
      });
    }
    return "FEEMPDP = (PF)(YR) + (IF)(YR) + DST + SUR";
  }

  return "FEEMPDP = FF + (PF)(YR) + (IF)(YR) + DST";
}

function calculateRadioEquipmentPermits(
  appTypeUpper: string,
  units: number,
  years: number,
  expirationDate: string | Date | null | undefined,
  asOfDate: string | Date | null | undefined,
  lineItems: PermitFeeLineItem[]
): string {
  if (appTypeUpper.includes("TRANSPORT")) {
    lineItems.push({
      particular: "Permit to Transport Fee",
      itemCode: "PTR",
      description: `Radio Communications Equipment Permit to Transport (${units} unit(s))`,
      validityYears: 1,
      noOfUnits: units,
      feeRate: 85,
      amount: 85 * units,
    });
    return "FEEPTR = (PTR)(UNIT) + DST";
  }

  const isRenewal = appTypeUpper.includes("RENEWAL");
  const isModification = appTypeUpper.includes("MODIFICATION");

  if (isModification) {
    lineItems.push({
      particular: "Modification Fee",
      itemCode: "MOD",
      description: "Radio Equipment Permit Modification",
      validityYears: 1,
      noOfUnits: 1,
      feeRate: 120,
      amount: 120,
    });
    return "FEEDP = MOD + DST";
  }

  let pf = 1200;
  const iF = 720;
  let desc = "Radio Communication Equipment Dealer";

  if (appTypeUpper.includes("MANUFACTURER")) {
    pf = 1760;
    desc = "Radio Communication Equipment Manufacturer";
  } else if (appTypeUpper.includes("SERVICE CENTER")) {
    pf = 720;
    desc = "Radio Communication Equipment Service Center";
  }

  if (!isRenewal) {
    lineItems.push({
      particular: "Filing Fee",
      itemCode: "FF",
      description: "Administrative Filing Fee",
      validityYears: 1,
      noOfUnits: 1,
      feeRate: 180,
      amount: 180,
    });
  }

  lineItems.push({
    particular: "Permit Fee",
    itemCode: "PF",
    description: `${desc} Permit Fee`,
    validityYears: years,
    noOfUnits: 1,
    feeRate: pf,
    amount: pf * years,
  });
  lineItems.push({
    particular: "Inspection Fee",
    itemCode: "IF",
    description: `${desc} Inspection Fee`,
    validityYears: years,
    noOfUnits: 1,
    feeRate: iF,
    amount: iF * years,
  });

  if (isRenewal && expirationDate) {
    const { surchargeAmount, description } = calculateSurcharge(pf, expirationDate, asOfDate);
    if (surchargeAmount > 0) {
      lineItems.push({
        particular: "Surcharge (Late Renewal Penalty)",
        itemCode: "SUR",
        description,
        validityYears: 1,
        noOfUnits: 1,
        feeRate: surchargeAmount,
        amount: surchargeAmount,
        isSurcharge: true,
      });
    }
    return "FEEDP = (PF)(YR) + (IF)(YR) + DST + SUR";
  }

  return "FEEDP = FF + (PF)(YR) + (IF)(YR) + DST";
}

function calculateAmateurPermits(
  appTypeUpper: string,
  elementUpper: string,
  units: number,
  years: number,
  lineItems: PermitFeeLineItem[]
): string {
  if (appTypeUpper.includes("FOREIGN VISITOR") || appTypeUpper.includes("TEMPORARY PERMIT TO OPERATE")) {
    let lfRate = 120;
    let className = "Class A";
    if (elementUpper.includes("CLASS B")) {
      lfRate = 132;
      className = "Class B";
    } else if (elementUpper.includes("CLASS C")) {
      lfRate = 144;
      className = "Class C";
    }

    lineItems.push({
      particular: "Filing Fee",
      itemCode: "FF",
      description: "Foreign Visitor Amateur Filing Fee",
      validityYears: 1,
      noOfUnits: 1,
      feeRate: 60,
      amount: 60,
    });
    lineItems.push({
      particular: "Certificate Fee",
      itemCode: "ROC",
      description: "Foreign Visitor Certificate Fee",
      validityYears: 1,
      noOfUnits: 1,
      feeRate: 60,
      amount: 60,
    });
    lineItems.push({
      particular: `License Fee (${className})`,
      itemCode: "LF",
      description: `Foreign Visitor Amateur License Fee (${className})`,
      validityYears: 1,
      noOfUnits: 1,
      feeRate: lfRate,
      amount: lfRate,
    });

    return "FEEAT-TEMPORARY = FF + (PUR)(UNIT) + (POS)(UNIT) + (ROC)(YR) + (LF)(YR) + DST";
  }

  if (appTypeUpper.includes("VANITY CALL SIGN") || appTypeUpper.includes("VANITY")) {
    lineItems.push({
      particular: "Special Permit Fee",
      itemCode: "SP",
      description: "Vanity Call Sign Special Permit Fee",
      validityYears: years,
      noOfUnits: 1,
      feeRate: 1000,
      amount: 1000 * years,
    });
    return "FEEVANITY-AT = (SP)(YR) + DST";
  }

  if (appTypeUpper.includes("SPECIAL EVENT")) {
    lineItems.push({
      particular: "Special Permit Fee",
      itemCode: "SP",
      description: "Special Event Call Sign Special Permit Fee",
      validityYears: 1,
      noOfUnits: 1,
      feeRate: 120,
      amount: 120,
    });
    return "FEESPECIAL EVENT-AT = SP + DST";
  }

  if (
    appTypeUpper.includes("PURCHASE/POSSESS") ||
    appTypeUpper.includes("PURCHASE / POSSESS") ||
    appTypeUpper.includes("PURCHASE AND POSSESS") ||
    appTypeUpper.includes("PURCHASE TO POSSESS")
  ) {
    lineItems.push({
      particular: "Purchase Permit Fee",
      itemCode: "PUR",
      description: "Amateur Station Permit to Purchase",
      validityYears: 1,
      noOfUnits: units,
      feeRate: 50,
      amount: 50 * units,
    });
    lineItems.push({
      particular: "Possess Permit Fee",
      itemCode: "POS",
      description: "Amateur Station Permit to Possess",
      validityYears: 1,
      noOfUnits: units,
      feeRate: 50,
      amount: 50 * units,
    });
    return "FEEPUR/POS = (PUR)(UNIT) + (POS)(UNIT) + DST";
  }

  if (appTypeUpper.includes("SELL") || appTypeUpper.includes("TRANSFER")) {
    lineItems.push({
      particular: "Sell/Transfer Fee",
      itemCode: "STF",
      description: "Amateur Station Permit to Sell/Transfer",
      validityYears: 1,
      noOfUnits: units,
      feeRate: 50,
      amount: 50 * units,
    });
    return "FEESTF = (STF)(UNIT) + DST";
  }

  if (appTypeUpper.includes("POSSESS") || appTypeUpper.includes("STORAGE")) {
    lineItems.push({
      particular: "Possess Fee",
      itemCode: "POS",
      description: "Amateur Station Permit to Possess/Storage",
      validityYears: 1,
      noOfUnits: units,
      feeRate: 50,
      amount: 50 * units,
    });
    return "TOTAL = (POS)(UNIT) + DST";
  }

  // Default Purchase
  lineItems.push({
    particular: "Purchase Permit Fee",
    itemCode: "PUR",
    description: "Amateur Station Permit to Purchase",
    validityYears: 1,
    noOfUnits: units,
    feeRate: 50,
    amount: 50 * units,
  });
  return "TOTAL = (PUR)(UNIT) + DST";
}

function calculatePowerStationPermits(
  element: string,
  appType: string,
  units: number,
  lineItems: PermitFeeLineItem[]
): string {
  const { pur, pos, stf, desc } = resolvePowerRates(element, appType);
  const appUpper = appType.toUpperCase();

  if (
    appUpper.includes("PURCHASE/POSSESS") ||
    appUpper.includes("PURCHASE / POSSESS") ||
    appUpper.includes("PURCHASE AND POSSESS")
  ) {
    lineItems.push({
      particular: "Filing Fee",
      itemCode: "FF",
      description: "Station Application Filing Fee",
      validityYears: 1,
      noOfUnits: units,
      feeRate: 180,
      amount: 180 * units,
    });
    lineItems.push({
      particular: `Purchase Fee (${desc})`,
      itemCode: "PUR",
      description: `Permit to Purchase (${desc})`,
      validityYears: 1,
      noOfUnits: units,
      feeRate: pur,
      amount: pur * units,
    });
    lineItems.push({
      particular: `Possess Fee (${desc})`,
      itemCode: "POS",
      description: `Permit to Possess (${desc})`,
      validityYears: 1,
      noOfUnits: units,
      feeRate: pos,
      amount: pos * units,
    });
    return "FEEPUR/POS = (FF)(UNIT) + (PUR)(UNIT) + (POS)(UNIT) + DST";
  }

  if (appUpper.includes("SELL") || appUpper.includes("TRANSFER")) {
    lineItems.push({
      particular: `Sell/Transfer Fee (${desc})`,
      itemCode: "STF",
      description: `Permit to Sell/Transfer (${desc})`,
      validityYears: 1,
      noOfUnits: units,
      feeRate: stf,
      amount: stf * units,
    });
    return "FEESTF = (STF)(UNIT) + DST";
  }

  if (appUpper.includes("POSSESS") || appUpper.includes("STORAGE")) {
    lineItems.push({
      particular: `Possess Fee (${desc})`,
      itemCode: "POS",
      description: `Permit to Possess (${desc})`,
      validityYears: 1,
      noOfUnits: units,
      feeRate: pos,
      amount: pos * units,
    });
    return "TOTAL = (POS)(UNIT) + DST";
  }

  lineItems.push({
    particular: `Purchase Fee (${desc})`,
    itemCode: "PUR",
    description: `Permit to Purchase (${desc})`,
    validityYears: 1,
    noOfUnits: units,
    feeRate: pur,
    amount: pur * units,
  });
  return "TOTAL = (PUR)(UNIT) + DST";
}

export function computePermitFees(params: PermitFeeComputationParams): PermitFeeComputationResult {
  const lineItems: PermitFeeLineItem[] = [];
  const years = Math.max(1, params.validityYears ?? 1);
  const units = Math.max(1, params.noOfUnits ?? 1);
  const copies = Math.max(1, params.noOfCopies ?? 1);

  const activityUpper = (params.activity ?? "").trim().toUpperCase();
  const appTypeUpper = (params.applicationType ?? "").trim().toUpperCase();
  const elementUpper = (params.element ?? "").trim().toUpperCase();

  let formulaApplied = "";

  if (
    activityUpper.includes("COPY OF PERMITS") ||
    appTypeUpper.includes("CERTIFIED TRUE COPY") ||
    appTypeUpper.includes("DUPLICATE COPY")
  ) {
    formulaApplied = calculateCopyOfPermits(appTypeUpper, copies, lineItems);
  } else if (activityUpper.includes("MOBILE PHONE") || appTypeUpper.includes("MOBILE PHONE")) {
    formulaApplied = calculateMobilePhonePermits(
      appTypeUpper,
      elementUpper,
      years,
      params.expirationDate,
      params.asOfDate,
      lineItems
    );
  } else if (
    activityUpper.includes("RADIO COMMUNICATIONS EQUIPMENT") ||
    appTypeUpper.includes("DEALER PERMIT") ||
    appTypeUpper.includes("MANUFACTURER PERMIT") ||
    appTypeUpper.includes("SERVICE CENTER PERMIT") ||
    appTypeUpper.includes("PERMIT TO TRANSPORT")
  ) {
    formulaApplied = calculateRadioEquipmentPermits(
      appTypeUpper,
      units,
      years,
      params.expirationDate,
      params.asOfDate,
      lineItems
    );
  } else if (
    activityUpper.includes("DEMONSTRATE") ||
    appTypeUpper.includes("DEMONSTRATE") ||
    appTypeUpper.includes("DEMO")
  ) {
    const channels = Math.max(1, params.additionalServicesCount ?? units);
    lineItems.push({
      particular: "Filing Fee",
      itemCode: "FF",
      description: "Demo Application Filing Fee",
      validityYears: 1,
      noOfUnits: units,
      feeRate: 180,
      amount: 180 * units,
    });
    lineItems.push({
      particular: "Demo/Propagate Fee",
      itemCode: "DEMO",
      description: `Temporary Demo and Propagate Fee (${channels} channel(s))`,
      validityYears: 1,
      noOfUnits: channels,
      feeRate: 85,
      amount: 85 * channels,
    });
    formulaApplied = "FEEDEMO = (FF)(UNIT) + (DEMO)(CH_UNIT) + DST";
  } else if (activityUpper.includes("AMATEUR") || appTypeUpper.includes("AMATEUR")) {
    formulaApplied = calculateAmateurPermits(appTypeUpper, elementUpper, units, years, lineItems);
  } else {
    formulaApplied = calculatePowerStationPermits(elementUpper, appTypeUpper, units, lineItems);
  }

  // Mandatory Documentary Stamp Tax (DST)
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
    .filter((li) => li.isSurcharge === true)
    .reduce((sum, li) => sum + li.amount, 0);
  const taxAmount = lineItems
    .filter((li) => li.isTax === true)
    .reduce((sum, li) => sum + li.amount, 0);
  const totalAmount = lineItems.reduce((sum, li) => sum + li.amount, 0);

  return {
    formulaApplied,
    subTotal,
    surchargeAmount,
    taxAmount,
    totalAmount,
    lineItems,
  };
}
