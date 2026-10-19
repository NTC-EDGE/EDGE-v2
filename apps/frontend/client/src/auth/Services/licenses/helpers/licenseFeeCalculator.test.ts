import { calculateLicenseFee, resolvePowerTier, calculateSurcharge, LicensePowerTier } from "./licenseFeeCalculator";

describe("LicenseFeeCalculator (Statutory Formulas & Spreadsheets)", () => {
  describe("resolvePowerTier helper", () => {
    it("correctly identifies High, Medium, and Low tiers", () => {
      expect(resolvePowerTier("High Powered (> 100W)")).toBe(LicensePowerTier.High);
      expect(resolvePowerTier("Medium Powered (25W-100W)")).toBe(LicensePowerTier.Medium);
      expect(resolvePowerTier("Low Powered (<= 25W)")).toBe(LicensePowerTier.Low);
      expect(resolvePowerTier(null)).toBe(LicensePowerTier.High);
    });
  });

  describe("calculateSurcharge helper", () => {
    it("returns zero surcharge if not expired or no expiry date", () => {
      expect(calculateSurcharge(1000, null).amount).toBe(0);
      const future = new Date();
      future.setDate(future.getDate() + 30);
      expect(calculateSurcharge(1000, future).amount).toBe(0);
    });

    it("applies 50% surcharge if expired within 180 days", () => {
      const exp = new Date("2026-01-01");
      const asOf = new Date("2026-03-01"); // ~59 days
      const sur = calculateSurcharge(1000, exp, asOf);
      expect(sur.multiplier).toBe(0.5);
      expect(sur.amount).toBe(500);
    });

    it("applies 100% surcharge if expired between 181 and 365 days", () => {
      const exp = new Date("2025-01-01");
      const asOf = new Date("2025-10-01"); // ~273 days
      const sur = calculateSurcharge(1000, exp, asOf);
      expect(sur.multiplier).toBe(1.0);
      expect(sur.amount).toBe(1000);
    });

    it("applies incremental surcharge if expired over 1 year", () => {
      const exp = new Date("2024-01-01");
      const asOf = new Date("2025-09-01"); // ~609 days (365 + 244 -> extra 2 periods of 180d)
      const sur = calculateSurcharge(1000, exp, asOf);
      expect(sur.multiplier).toBe(2.0); // 1.0 + 2 * 0.5
      expect(sur.amount).toBe(2000);
    });
  });

  describe("Amateur Station Licenses", () => {
    it("computes New Class A License for 3 years (FF + LF*YR + DST)", () => {
      const res = calculateLicenseFee({
        serviceName: "LICENSES IN THE AMATEUR SERVICE",
        applicationType: "New Amateur Radio Station License",
        element: "Class A",
        validityYears: 3,
      });

      // FF = 60, LF = 120 * 3 = 360, DST = 30 -> subtotal 420, total 450
      expect(res.subTotal).toBe(420);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(450);
      expect(res.formulaApplied).toBe("FEEAT-RSL = FF + (LF)(YR) + DST");
    });

    it("computes New Class B License for 1 year", () => {
      const res = calculateLicenseFee({
        serviceName: "LICENSES IN THE AMATEUR SERVICE",
        applicationType: "New Amateur Radio Station License",
        element: "Class B",
        validityYears: 1,
      });

      // FF = 60, LF = 132 * 1 = 132, DST = 30 -> subtotal 192, total 222
      expect(res.subTotal).toBe(192);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(222);
    });

    it("computes Renewal Class C License with late penalty", () => {
      const exp = new Date("2026-01-01");
      const asOf = new Date("2026-03-01"); // ~59 days late -> 50%
      const res = calculateLicenseFee({
        serviceName: "LICENSES IN THE AMATEUR SERVICE",
        applicationType: "Renewal Amateur Radio Station License",
        element: "Class C",
        validityYears: 1,
        expirationDate: exp,
        asOfDate: asOf,
      });

      // LF = 144, surcharge = 50% of 144 = 72, DST = 30 -> total = 144 + 72 + 30 = 246
      expect(res.subTotal).toBe(144);
      expect(res.surchargeAmount).toBe(72);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(246);
      expect(res.formulaApplied).toBe("FEEAT-RSL = (LF)(YR) + DST + SUR");
    });

    it("computes Modification Amateur License (FF + MOD + DST)", () => {
      const res = calculateLicenseFee({
        serviceName: "LICENSES IN THE AMATEUR SERVICE",
        applicationType: "Modification of Amateur Radio Station License",
      });

      // FF = 60, MOD = 50, DST = 30 -> subtotal 110, total 140
      expect(res.subTotal).toBe(110);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(140);
      expect(res.formulaApplied).toBe("FEEAT-RSL = FF + MOD + DST");
    });

    it("computes Lifetime Amateur License (LF + DST)", () => {
      const res = calculateLicenseFee({
        serviceName: "Lifetime Amateur Radio Station License",
        applicationType: "New",
      });

      // LF = 50, DST = 30 -> total 80
      expect(res.subTotal).toBe(50);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(80);
      expect(res.formulaApplied).toBe("FEEAT-LIFETIME = LF + DST");
    });

    it("computes Amateur Club Simplex Station (FF + CPF + LF*YR + DST)", () => {
      const res = calculateLicenseFee({
        serviceName: "Amateur Club Station License",
        applicationType: "New",
        element: "Simplex",
        validityYears: 3,
      });

      // FF = 180, CPF = 600, LF = 700 * 3 = 2100, DST = 30 -> subtotal 2880, total 2910
      expect(res.subTotal).toBe(2880);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(2910);
    });

    it("computes Amateur Club Duplex Station (FF + CPF + LF*YR + DST)", () => {
      const res = calculateLicenseFee({
        serviceName: "Amateur Club Station License",
        applicationType: "New",
        element: "Duplex (Repeater)",
        validityYears: 3,
      });

      // FF = 180, CPF = 600, LF = 1320 * 3 = 3960, DST = 30 -> subtotal 4740, total 4770
      expect(res.subTotal).toBe(4740);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(4770);
    });
  });

  describe("Aeronautical Station Licenses", () => {
    it("computes Fixed Aeronautical Station New High Powered (CPF + LF*YR + IF*YR + DST)", () => {
      const res = calculateLicenseFee({
        serviceName: "LICENSES IN THE AERONAUTICAL SERVICE",
        applicationType: "Fixed Aeronautical Station License (NEW)",
        powerOutput: "High Powered (> 100W)",
        validityYears: 3,
      });

      // CPF = 120, LF = 1080 * 3 = 3240, IF = 720 * 3 = 2160, DST = 30
      // subtotal = 120 + 3240 + 2160 = 5520, total = 5550
      expect(res.subTotal).toBe(5520);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(5550);
      expect(res.formulaApplied).toBe("FEERSL = CPF + (LF)(YR) + (IF)(YR) + DST");
    });

    it("computes Aircraft Station New High Powered (CPF + LF*YR + IF*YR + DST)", () => {
      const res = calculateLicenseFee({
        serviceName: "LICENSES IN THE AERONAUTICAL SERVICE",
        applicationType: "Aircraft Station License (NEW)",
        powerOutput: "High Powered (> 100W)",
        validityYears: 1,
      });

      // CPF = 960, LF = 1320, IF = 720, DST = 30 -> subtotal 3000, total 3030
      expect(res.subTotal).toBe(3000);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(3030);
      expect(res.formulaApplied).toBe("FEEASL = CPF + (LF)(YR) + (IF)(YR) + DST");
    });
  });

  describe("Maritime Station Licenses", () => {
    it("computes Ship International Renewal (LF*YR + IF*YR + DST)", () => {
      const res = calculateLicenseFee({
        serviceName: "LICENSES IN THE MARITIME SERVICE",
        applicationType: "Ship Radio Station License International (RENEWAL)",
        validityYears: 1,
      });

      // LF = 180, IF = 1200, DST = 30 -> subtotal 1380, total 1410
      expect(res.subTotal).toBe(1380);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(1410);
      expect(res.formulaApplied).toBe("FEESSL = (LF)(YR) + (IF)(YR) + DST + SUR");
    });

    it("computes Ship Domestic New High Powered (CPF + LF*YR + IF*YR + DST)", () => {
      const res = calculateLicenseFee({
        serviceName: "LICENSES IN THE MARITIME SERVICE",
        applicationType: "Ship Radio Station License Domestic (NEW)",
        powerOutput: "High Powered (> 100W)",
        validityYears: 1,
      });

      // CPF = 720, LF = 840, IF = 720, DST = 30 -> subtotal 2280, total 2310
      expect(res.subTotal).toBe(2280);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(2310);
    });

    it("computes Coastal Station Private VHF New (CPF + LF*YR + IF*YR + DST)", () => {
      const res = calculateLicenseFee({
        serviceName: "LICENSES IN THE MARITIME SERVICE",
        applicationType: "Coast Radio Station License Private VHF (NEW)",
        validityYears: 1,
      });

      // CPF = 480, LF = 480, IF = 480, DST = 30 -> subtotal 1440, total 1470
      expect(res.subTotal).toBe(1440);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(1470);
    });
  });

  describe("Fixed and Land Mobile Service (FLM)", () => {
    it("computes Base / Fixed Station New (CPF + LF*YR + IF*YR + DST)", () => {
      const res = calculateLicenseFee({
        serviceName: "LICENSES TO RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE",
        applicationType: "Base / Fixed Station License (NEW)",
        validityYears: 1,
        noOfUnits: 1,
      });

      // CPF = 240, LF = 600, IF = 480, DST = 30 -> subtotal 1320, total 1350
      expect(res.subTotal).toBe(1320);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(1350);
      expect(res.formulaApplied).toBe("FEERSL = (CPF)(UNIT) + (LF)(CH_UNIT)(YR) + (IF)(UNIT)(YR) + (SUF)(CH_UNIT)(YR) + DST");
    });

    it("computes Portable Station New (CPF is 0)", () => {
      const res = calculateLicenseFee({
        serviceName: "LICENSES TO RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE",
        applicationType: "Land Mobile Portable Station License (NEW)",
        element: "PORTABLE (P)",
        validityYears: 1,
        noOfUnits: 1,
      });

      // CPF = 0, LF = 480, IF = 240, DST = 30 -> subtotal 720, total 750
      expect(res.subTotal).toBe(720);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(750);
    });

    it("computes Repeater Station New (Simplex)", () => {
      const res = calculateLicenseFee({
        serviceName: "LICENSES TO RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE",
        applicationType: "Repeater Station License (NEW)",
        element: "REPEATER (RT)",
        validityYears: 1,
        noOfUnits: 1,
      });

      // CPF = 600, LF = 480, IF = 240, DST = 30 -> subtotal 1320, total 1350
      expect(res.subTotal).toBe(1320);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(1350);
    });

    it("computes Repeater Station New (Duplex)", () => {
      const res = calculateLicenseFee({
        serviceName: "LICENSES TO RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE",
        applicationType: "Repeater Station License (NEW)",
        element: "REPEATER (RT) DUPLEX",
        validityYears: 1,
        noOfUnits: 1,
      });

      // CPF = 600, LF = 1320, IF = 480, DST = 30 -> subtotal 2400, total 2430
      expect(res.subTotal).toBe(2400);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(2430);
    });
  });

  describe("Other Radio Station Licenses", () => {
    it("computes Microwave Link Station New with 2 channels", () => {
      const res = calculateLicenseFee({
        serviceName: "LICENSES TO OTHER RADIO STATIONS AND SERVICES",
        applicationType: "Microwave Link Station License (NEW)",
        validityYears: 1,
        noOfChannels: 2,
        noOfUnits: 1,
      });

      // LF = 480 * 2 = 960, IF = 480 * 2 = 960, DST = 30 -> subtotal 1920, total 1950
      expect(res.subTotal).toBe(1920);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(1950);
    });
  });

  describe("TVRO & CATV Licenses", () => {
    it("computes TVRO Station New (LF*YR + DST)", () => {
      const res = calculateLicenseFee({
        serviceName: "LICENSES FOR TVRO AND CATV",
        applicationType: "TVRO Station License (NEW)",
        validityYears: 1,
      });

      // LF = 2600, DST = 30 -> subtotal 2600, total 2630
      expect(res.subTotal).toBe(2600);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(2630);
      expect(res.formulaApplied).toBe("FEETVRORSL = (LF)(YR) + DST");
    });

    it("computes CATV Station New (FF + CPF + LF*YR + IF*YR + DST)", () => {
      const res = calculateLicenseFee({
        serviceName: "LICENSES FOR TVRO AND CATV",
        applicationType: "CATV Station License (NEW)",
        validityYears: 1,
      });

      // FF = 400, CPF = 1140, LF = 3600, IF = 720, DST = 30 -> subtotal 5860, total 5890
      expect(res.subTotal).toBe(5860);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(5890);
      expect(res.formulaApplied).toBe("FEECATVRSL = FF + CPF + (LF)(YR) + (IF)(YR) + DST");
    });
  });

  describe("Copy of Licenses", () => {
    it("computes Certified True Copy for 1 page (First Page 24 + DST 30)", () => {
      const res = calculateLicenseFee({
        serviceName: "COPY OF LICENSES",
        applicationType: "Certified True Copy",
        noOfCopies: 1,
      });

      // First Page = 24, DST = 30 -> subtotal 24, total 54
      expect(res.subTotal).toBe(24);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(54);
      expect(res.formulaApplied).toBe("TOTAL = FC + (SC)(COPY) + DST");
    });

    it("computes Certified True Copy for 3 pages (24 + 2*6 + DST 30)", () => {
      const res = calculateLicenseFee({
        serviceName: "COPY OF LICENSES",
        applicationType: "Certified True Copy",
        noOfCopies: 3,
      });

      // First Page = 24, Succeeding = 2 * 6 = 12, DST = 30 -> subtotal 36, total 66
      expect(res.subTotal).toBe(36);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(66);
    });

    it("computes Duplicate Copy of License (120 + DST 30)", () => {
      const res = calculateLicenseFee({
        serviceName: "COPY OF LICENSES",
        applicationType: "Duplicate Copy of License",
        noOfCopies: 1,
      });

      // Duplicate = 120, DST = 30 -> subtotal 120, total 150
      expect(res.subTotal).toBe(120);
      expect(res.taxAmount).toBe(30);
      expect(res.totalAmount).toBe(150);
      expect(res.formulaApplied).toBe("TOTAL = DUP + DST");
    });
  });
});
