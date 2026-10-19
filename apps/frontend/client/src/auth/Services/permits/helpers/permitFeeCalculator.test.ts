import { computePermitFees } from "./permitFeeCalculator";

describe("PermitFeeCalculator (Statutory Formulas & Spreadsheets)", () => {
  describe("Amateur Service Permits", () => {
    it("computes Permit to Purchase for 2 units correctly (PPur(Unit) + DST)", () => {
      const res = computePermitFees({
        activity: "PERMITS IN THE AMATEUR SERVICE",
        applicationType: "Permit to Purchase",
        noOfUnits: 2,
      });

      expect(res.subTotal).toBe(100);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(130);
      expect(res.formulaApplied).toBe("TOTAL = (PUR)(UNIT) + DST");
    });

    it("computes Permit to Possess for storage for 1 unit (POS(Unit) + DST)", () => {
      const res = computePermitFees({
        activity: "PERMITS IN THE AMATEUR SERVICE",
        applicationType: "Possess for storage",
        noOfUnits: 1,
      });

      expect(res.subTotal).toBe(50);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(80);
      expect(res.formulaApplied).toBe("TOTAL = (POS)(UNIT) + DST");
    });

    it("computes Combined Purchase/Possess for 3 units (PUR(Unit) + POS(Unit) + DST)", () => {
      const res = computePermitFees({
        activity: "PERMITS IN THE AMATEUR SERVICE",
        applicationType: "Purchase/Possess",
        noOfUnits: 3,
      });

      expect(res.subTotal).toBe(300); // (50*3) + (50*3)
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(330);
      expect(res.formulaApplied).toBe("FEEPUR/POS = (PUR)(UNIT) + (POS)(UNIT) + DST");
    });

    it("computes Permit to Sell/Transfer for 2 units (STF(Unit) + DST)", () => {
      const res = computePermitFees({
        activity: "PERMITS IN THE AMATEUR SERVICE",
        applicationType: "Permit to Sell/Transfer",
        noOfUnits: 2,
      });

      expect(res.subTotal).toBe(100);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(130);
      expect(res.formulaApplied).toBe("FEESTF = (STF)(UNIT) + DST");
    });

    it("computes Foreign Visitor Temporary Permit for Class A", () => {
      const res = computePermitFees({
        activity: "PERMITS IN THE AMATEUR SERVICE",
        applicationType: "Temporary Permit to Operate (Foreign Visitor)",
        element: "Class A",
      });

      // FF = 60, ROC = 60, LF = 120, DST = 30 -> 240 + 30 = 270
      expect(res.subTotal).toBe(240);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(270);
    });

    it("computes Special Permit Vanity Call Sign for 3 years ((SP)(Yr) + DST)", () => {
      const res = computePermitFees({
        activity: "PERMITS IN THE AMATEUR SERVICE",
        applicationType: "Special Permit - Vanity Call Sign",
        validityYears: 3,
      });

      // SP = 1000 * 3 = 3000 + 30 = 3030
      expect(res.subTotal).toBe(3000);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(3030);
      expect(res.formulaApplied).toBe("FEEVANITY-AT = (SP)(YR) + DST");
    });

    it("computes Special Event Call Sign (SP + DST)", () => {
      const res = computePermitFees({
        activity: "PERMITS IN THE AMATEUR SERVICE",
        applicationType: "Special Permit - Special Event Call Sign",
      });

      // SP = 120 + 30 = 150
      expect(res.subTotal).toBe(120);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(150);
      expect(res.formulaApplied).toBe("FEESPECIAL EVENT-AT = SP + DST");
    });
  });

  describe("Power-Rated Station Permits", () => {
    it("computes Aeronautical Station High Powered Purchase/Possess for 2 units", () => {
      const res = computePermitFees({
        activity: "PERMITS IN THE AERONAUTICAL SERVICE",
        applicationType: "Aeronautical Station Permit to Purchase/Possess",
        element: "High Powered (> 100W)",
        noOfUnits: 2,
      });

      // (180*2) + (240*2) + (120*2) = 360 + 480 + 240 = 1080 + 30 = 1110
      expect(res.subTotal).toBe(1080);
      expect(res.totalAmount).toBe(1110);
      expect(res.formulaApplied).toBe("FEEPUR/POS = (FF)(UNIT) + (PUR)(UNIT) + (POS)(UNIT) + DST");
    });

    it("computes Maritime Station Medium Powered Purchase/Possess for 1 unit", () => {
      const res = computePermitFees({
        activity: "PERMITS IN THE MARITIME SERVICE",
        applicationType: "Ship Station Permit to Purchase/Possess",
        element: "Medium Powered (25W-100W)",
        noOfUnits: 1,
      });

      // 180 + 120 + 96 = 396 + 30 = 426
      expect(res.subTotal).toBe(396);
      expect(res.totalAmount).toBe(426);
    });

    it("computes Low Powered Sell/Transfer for 1 unit", () => {
      const res = computePermitFees({
        activity: "PERMITS TO GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE",
        applicationType: "Permit to Sell/Transfer",
        element: "Low Powered (<= 25W)",
        noOfUnits: 1,
      });

      // STF = 96 + 30 = 126
      expect(res.subTotal).toBe(96);
      expect(res.totalAmount).toBe(126);
      expect(res.formulaApplied).toBe("FEESTF = (STF)(UNIT) + DST");
    });
  });

  describe("Radio Communications Equipment Permits", () => {
    it("computes Permit to Transport for 5 units", () => {
      const res = computePermitFees({
        activity: "PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT",
        applicationType: "Permit to Transport",
        noOfUnits: 5,
      });

      // PTR = 85 * 5 = 425 + 30 = 455
      expect(res.subTotal).toBe(425);
      expect(res.totalAmount).toBe(455);
      expect(res.formulaApplied).toBe("FEEPTR = (PTR)(UNIT) + DST");
    });

    it("computes Dealer Permit (NEW) for 2 years", () => {
      const res = computePermitFees({
        activity: "PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT",
        applicationType: "Dealer Permit (NEW)",
        validityYears: 2,
      });

      // FF = 180, PF = 1200 * 2 = 2400, IF = 720 * 2 = 1440 -> 4020 + 30 = 4050
      expect(res.subTotal).toBe(4020);
      expect(res.totalAmount).toBe(4050);
      expect(res.formulaApplied).toBe("FEEDP = FF + (PF)(YR) + (IF)(YR) + DST");
    });

    it("computes Manufacturer Permit (NEW) for 1 year", () => {
      const res = computePermitFees({
        activity: "PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT",
        applicationType: "Manufacturer Permit (NEW)",
        validityYears: 1,
      });

      // FF = 180, PF = 1760, IF = 720 -> 2660 + 30 = 2690
      expect(res.subTotal).toBe(2660);
      expect(res.totalAmount).toBe(2690);
    });

    it("computes Service Center Permit (MODIFICATION)", () => {
      const res = computePermitFees({
        activity: "PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT",
        applicationType: "Service Center Permit (MODIFICATION)",
      });

      // MOD = 120 + 30 = 150
      expect(res.subTotal).toBe(120);
      expect(res.totalAmount).toBe(150);
      expect(res.formulaApplied).toBe("FEEDP = MOD + DST");
    });
  });

  describe("Mobile Phone Permits", () => {
    it("computes Dealer Main (NEW) for 1 year", () => {
      const res = computePermitFees({
        activity: "PERMITS FOR MOBILE PHONE",
        applicationType: "Dealer Permit (NEW)",
        element: "MAIN",
        validityYears: 1,
      });

      // FF = 500, PF = 2500, IF = 1500 -> 4500 + 30 = 4530
      expect(res.subTotal).toBe(4500);
      expect(res.totalAmount).toBe(4530);
      expect(res.formulaApplied).toBe("FEEMPDP = FF + (PF)(YR) + (IF)(YR) + DST");
    });

    it("computes Dealer Branch (NEW) for 1 year", () => {
      const res = computePermitFees({
        activity: "PERMITS FOR MOBILE PHONE",
        applicationType: "Dealer Permit (NEW)",
        element: "BRANCH",
        validityYears: 1,
      });

      // FF = 500, PF = 1500, IF = 1500 -> 3500 + 30 = 3530
      expect(res.subTotal).toBe(3500);
      expect(res.totalAmount).toBe(3530);
    });

    it("computes Retailer/Reseller (NEW) for 1 year", () => {
      const res = computePermitFees({
        activity: "PERMITS FOR MOBILE PHONE",
        applicationType: "Retailer/Reseller Permit (NEW)",
        validityYears: 1,
      });

      // FF = 500, PF = 1500, IF = 1500 -> 3500 + 30 = 3530
      expect(res.subTotal).toBe(3500);
      expect(res.totalAmount).toBe(3530);
      expect(res.formulaApplied).toBe("FEEMPRRP = FF + (PF)(YR) + (IF)(YR) + DST");
    });

    it("computes Service Center (NEW) for 1 year", () => {
      const res = computePermitFees({
        activity: "PERMITS FOR MOBILE PHONE",
        applicationType: "Service Center Permit (NEW)",
        validityYears: 1,
      });

      // FF = 180, PF = 1200, IF = 720 -> 2100 + 30 = 2130
      expect(res.subTotal).toBe(2100);
      expect(res.totalAmount).toBe(2130);
      expect(res.formulaApplied).toBe("FEEMPSCP = FF + (PF)(YR) + (IF)(YR) + DST");
    });
  });

  describe("Copy of Permits", () => {
    it("computes Certified True Copy for 3 copies", () => {
      const res = computePermitFees({
        activity: "COPY OF PERMITS",
        applicationType: "Certified True Copy",
        noOfCopies: 3,
      });

      // FC = 24, SC = 6 * 2 = 12 -> 36 + 30 = 66
      expect(res.subTotal).toBe(36);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(66);
      expect(res.formulaApplied).toBe("TOTAL = FC + (SC)(COPY) + DST");
    });

    it("computes Duplicate Copy", () => {
      const res = computePermitFees({
        activity: "COPY OF PERMITS",
        applicationType: "Duplicate Copy",
      });

      // DUP = 120 + 30 = 150
      expect(res.subTotal).toBe(120);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(150);
      expect(res.formulaApplied).toBe("TOTAL = DUP + DST");
    });
  });
});
