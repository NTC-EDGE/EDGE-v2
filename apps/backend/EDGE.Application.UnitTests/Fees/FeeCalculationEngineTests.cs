using System;
using System.Linq;
using FluentAssertions;
using Xunit;
using EDGE.Application.Fees.Calculations;
using EDGE.Application.Fees.Calculations.Strategies;
using EDGE.Domain.Constants;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Fees;

public class FeeCalculationEngineTests
{
    private readonly FeeCalculationEngine _engine = new(new IFeeCalculationStrategy[]
    {
        new CertificateFeeCalculationStrategy(),
        new LicenseFeeCalculationStrategy(),
        new PermitFeeCalculationStrategy(),
        new ExamFeeCalculationStrategy(),
        new AccreditationFeeCalculationStrategy(),
        new RequestsAndComplaintsFeeCalculationStrategy(),
        new DefaultFeeCalculationStrategy()
    });

    #region Certificates Category Tests (Spreadsheet Coverage)

    [Theory]
    [InlineData("1RTG", 1, 180, 210)]
    [InlineData("1RTG", 3, 540, 570)]
    [InlineData("2RTG", 1, 120, 150)]
    [InlineData("3RTG", 1, 60, 90)]
    [InlineData("1PHN", 1, 120, 150)]
    [InlineData("2PH",  1, 100, 130)]
    [InlineData("3PHN", 1, 60, 90)]
    public void Calculate_CommercialRocNew_ShouldReturnCorrectSubtotalAndTotal(string element, int years, decimal expectedSubtotal, decimal expectedTotal)
    {
        var request = new FeeCalculationRequest(
            Activity: "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC",
            ApplicationType: "Commercial Radio Operator Certificate (NEW)",
            Element: element,
            ValidityYears: years,
            Category: ServiceCategoryType.Certificate
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(expectedSubtotal);
        result.TaxAmount.Should().Be(30.00m);
        result.SurchargeAmount.Should().Be(0m);
        result.TotalAmount.Should().Be(expectedTotal);
        result.Category.Should().Be(ServiceCategoryType.Certificate);
        result.FormulaApplied.Should().Be("FEEROC = (ROC)(YR) + DST");
    }

    [Fact]
    public void Calculate_CommercialRocRenewal_OnTime_ShouldHaveZeroSurcharge()
    {
        var asOf = new DateTime(2026, 6, 1);
        var expiration = new DateTime(2026, 6, 15);

        var request = new FeeCalculationRequest(
            Activity: "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC",
            ApplicationType: "Commercial Radio Operator Certificate (RENEWAL)",
            Element: "1RTG",
            ValidityYears: 1,
            ExpirationDate: expiration,
            AsOfDate: asOf,
            Category: ServiceCategoryType.Certificate
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(180.00m);
        result.SurchargeAmount.Should().Be(0m);
        result.TotalAmount.Should().Be(210.00m);
    }

    [Theory]
    [InlineData(1, 0.50, 90.00, 300.00)]     // 1 day late -> 50%
    [InlineData(180, 0.50, 90.00, 300.00)]   // Exact 180 days -> 50%
    [InlineData(181, 1.00, 180.00, 390.00)]  // 181 days (Tier 2 entry) -> 100%
    [InlineData(365, 1.00, 180.00, 390.00)]  // Exact 365 days -> 100%
    [InlineData(366, 1.50, 270.00, 480.00)]  // 366 days (Tier 3 entry) -> 150%
    [InlineData(545, 1.50, 270.00, 480.00)]  // 545 days -> 150%
    [InlineData(546, 2.00, 360.00, 570.00)]  // 546 days (Tier 4 entry) -> 200%
    public void Calculate_CommercialRocRenewal_WithSurcharge_ShouldCalculateCorrectSurchargeTier(int daysLate, decimal expectedMultiplier, decimal expectedSurcharge, decimal expectedTotal)
    {
        var expiration = new DateTime(2026, 1, 1);
        var asOf = expiration.AddDays(daysLate);

        var request = new FeeCalculationRequest(
            Activity: "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC",
            ApplicationType: "Commercial Radio Operator Certificate (RENEWAL)",
            Element: "1RTG",
            ValidityYears: 1,
            ExpirationDate: expiration,
            AsOfDate: asOf,
            Category: ServiceCategoryType.Certificate
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(180.00m);
        result.SurchargeAmount.Should().Be(expectedSurcharge);
        result.TotalAmount.Should().Be(expectedTotal);
        result.FormulaApplied.Should().Be("FEEROC = (ROC)(YR) + DST + SUR");
        result.LineItems.First(li => li.IsSurcharge).Description.Should().Contain($"{expectedMultiplier:P0}");
    }

    [Fact]
    public void Calculate_CommercialRocRenewal_SameDateDifferentTimes_ShouldHaveZeroSurcharge()
    {
        var expiration = new DateTime(2026, 6, 15, 08, 00, 00, DateTimeKind.Utc);
        var asOf = new DateTime(2026, 6, 15, 23, 59, 59, DateTimeKind.Utc);

        var request = new FeeCalculationRequest(
            Activity: "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC",
            ApplicationType: "Commercial Radio Operator Certificate (RENEWAL)",
            Element: "1RTG",
            ValidityYears: 1,
            ExpirationDate: expiration,
            AsOfDate: asOf,
            Category: ServiceCategoryType.Certificate
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(180.00m);
        result.SurchargeAmount.Should().Be(0m);
        result.TotalAmount.Should().Be(210.00m);
    }


    [Fact]
    public void Calculate_CommercialRocModification_ShouldCharge120PlusDst()
    {
        var request = new FeeCalculationRequest(
            Activity: "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC",
            ApplicationType: "Commercial Radio Operator Certificate (MODIFICATION)",
            Element: "1RTG",
            Category: ServiceCategoryType.Certificate
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(120.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(150.00m);
    }

    [Fact]
    public void Calculate_GovernmentRocNew_ShouldIncludeFilingAppCertificateAndDst()
    {
        var request = new FeeCalculationRequest(
            Activity: "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC",
            ApplicationType: "Government Radio Operator Certificate (NEW)",
            ValidityYears: 2,
            Category: ServiceCategoryType.Certificate
        );

        var result = _engine.Calculate(request);

        // FF = 10, AF = 20, ROC = 60 * 2 = 120, DST = 30 -> Total = 180
        result.SubTotal.Should().Be(150.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(180.00m);
        result.FormulaApplied.Should().Be("FEEROC = FF + AF + (ROC)(YR) + DST");
    }

    [Fact]
    public void Calculate_LandMobileRocNew_ShouldIncludeFilingAppCertificateAndDst()
    {
        var request = new FeeCalculationRequest(
            Activity: "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC",
            ApplicationType: "Restricted Radiotelephone Operatpr's Certificate for Land Mobile Station (NEW)",
            ValidityYears: 1,
            Category: ServiceCategoryType.Certificate
        );

        var result = _engine.Calculate(request);

        // FF = 10, AF = 20, ROC = 30, DST = 30 -> Total = 90
        result.SubTotal.Should().Be(60.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(90.00m);
    }

    [Fact]
    public void Calculate_SpecialRocNew_ShouldIncludeAppSeminarCertificateAndDst()
    {
        var request = new FeeCalculationRequest(
            Activity: "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC",
            ApplicationType: "Special Radio Operator Certificate (NEW)",
            ValidityYears: 1,
            Category: ServiceCategoryType.Certificate
        );

        var result = _engine.Calculate(request);

        // AF = 20, SEM = 20, ROC = 60, DST = 30 -> Total = 130
        result.SubTotal.Should().Be(100.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(130.00m);
    }

    [Fact]
    public void Calculate_AmateurRocLifetimeModification_ShouldChargeFfModPossessAndDst()
    {
        var request = new FeeCalculationRequest(
            Activity: "CERTIFICATES IN THE AMATEUR SERVICE",
            ApplicationType: "Lifetime Amateur Radio Station Supplementary Certificate (MODIFICATION)",
            Category: ServiceCategoryType.Certificate
        );

        var result = _engine.Calculate(request);

        // FF = 60, MOD = 50, POSS_PERMIT = 50, DST = 30 -> Total = 190
        result.SubTotal.Should().Be(160.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(190.00m);
    }

    [Theory]
    [InlineData("RFID High Power", 2, 180, 600, 810)]
    [InlineData("RFID Low Power", 3, 180, 300, 510)]
    [InlineData("SRD/WDN Devices - Indoor", 4, 180, 200, 410)]
    public void Calculate_RfidSrdWdnRegistration_ShouldComputeCorrectUnits(string element, int units, decimal expectedAf, decimal expectedReg, decimal expectedTotal)
    {
        var request = new FeeCalculationRequest(
            Activity: "CERTIFICATE OF REGISTRATION FOR RFID, SRD, WDN, DEVICES- INDOOR",
            ApplicationType: "For Dealers",
            Element: element,
            NoOfUnits: units,
            Category: ServiceCategoryType.Certificate
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(expectedAf + expectedReg);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(expectedTotal);
    }

    [Fact]
    public void Calculate_TvroRegistration_ShouldCharge6500PlusDst()
    {
        var request = new FeeCalculationRequest(
            Activity: "TVRO REGISTRATION CERTIFICATE",
            ApplicationType: "TVRO Registration Certificate (Commercial)",
            Category: ServiceCategoryType.Certificate
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(6500.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(6530.00m);
    }

    [Fact]
    public void Calculate_VasProviderRenewal_WithExcessServicesAndSurcharge_ShouldCalculateCorrectly()
    {
        var expiration = new DateTime(2026, 1, 1);
        var asOf = expiration.AddDays(60); // 2 months late -> 50%

        var request = new FeeCalculationRequest(
            Activity: "CERTIFICATE OF REGISTRATION AS A VALUE-ADDED SERVICE (VAS) PROVIDER",
            ApplicationType: "Renewal",
            ValidityYears: 1,
            AdditionalServicesCount: 3,
            ExpirationDate: expiration,
            AsOfDate: asOf,
            Category: ServiceCategoryType.Certificate
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(9300.00m);
        result.SurchargeAmount.Should().Be(4500.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(13830.00m);
    }

    [Theory]
    [InlineData(1, 6.00, 36.00)]
    [InlineData(4, 13.50, 43.50)] // 6.00 + (3 * 2.50 = 7.50) = 13.50 + 30 = 43.50
    public void Calculate_CertifiedTrueCopy_ShouldCalculatePagesCorrectly(int copies, decimal expectedSubtotal, decimal expectedTotal)
    {
        var request = new FeeCalculationRequest(
            Activity: "COPY OF CERTIFICATES",
            ApplicationType: "Certified True Copy",
            NoOfCopies: copies,
            Category: ServiceCategoryType.Certificate
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(expectedSubtotal);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(expectedTotal);
    }

    [Fact]
    public void Calculate_DuplicateCopy_ShouldCharge120PlusDst()
    {
        var request = new FeeCalculationRequest(
            Activity: "COPY OF CERTIFICATES",
            ApplicationType: "Duplicate Copy",
            Category: ServiceCategoryType.Certificate
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(120.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(150.00m);
    }

    #endregion

    #region Permits Category Tests (Spreadsheet Coverage)

    [Theory]
    [InlineData("Amateur Radio Station Permit to Purchase", 2, 100.00, 130.00, "TOTAL = (PUR)(UNIT) + DST")]
    [InlineData("Amateur Radio Station Permit to Possess for Storage", 3, 150.00, 180.00, "TOTAL = (POS)(UNIT) + DST")]
    [InlineData("Amateur Radio Station Permit to Purchase/Possess", 2, 200.00, 230.00, "FEEPUR/POS = (PUR)(UNIT) + (POS)(UNIT) + DST")]
    [InlineData("Amateur Radio Station Permit to Sell/Transfer", 1, 50.00, 80.00, "FEESTF = (STF)(UNIT) + DST")]
    public void Calculate_AmateurPermits_ShouldComputeCorrectAmounts(string appType, int units, decimal expectedSubtotal, decimal expectedTotal, string expectedFormula)
    {
        var request = new FeeCalculationRequest(
            Activity: "PERMITS IN THE AMATEUR SERVICE",
            ApplicationType: appType,
            NoOfUnits: units,
            Category: ServiceCategoryType.Permit
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(expectedSubtotal);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(expectedTotal);
        result.FormulaApplied.Should().Be(expectedFormula);
    }

    [Theory]
    [InlineData("Class A", 120.00, 240.00, 270.00)]
    [InlineData("Class B", 132.00, 252.00, 282.00)]
    [InlineData("Class C", 144.00, 264.00, 294.00)]
    public void Calculate_AmateurForeignVisitorPermit_ShouldCalculateClassRates(string element, decimal expectedLf, decimal expectedSubtotal, decimal expectedTotal)
    {
        var request = new FeeCalculationRequest(
            Activity: "PERMITS IN THE AMATEUR SERVICE",
            ApplicationType: "Temporary Permit to Operate an Amateur Radio Station - Foreign Visitor",
            Element: element,
            ValidityYears: 1,
            Category: ServiceCategoryType.Permit
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(expectedSubtotal); // FF (60) + ROC (60) + LF
        result.TotalAmount.Should().Be(expectedTotal);
        result.LineItems.Any(li => li.ItemCode == "LF" && li.FeeRate == expectedLf).Should().BeTrue();
    }

    [Fact]
    public void Calculate_AmateurVanityCallSign_ShouldMultiplyByYears()
    {
        var request = new FeeCalculationRequest(
            Activity: "PERMITS IN THE AMATEUR SERVICE",
            ApplicationType: "Special Permit for Use of Vanity Call Sign",
            ValidityYears: 3,
            Category: ServiceCategoryType.Permit
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(3000.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(3030.00m);
        result.FormulaApplied.Should().Be("FEEVANITY-AT = (SP)(YR) + DST");
    }

    [Fact]
    public void Calculate_AmateurSpecialEventCallSign_ShouldChargeFlat120PlusDst()
    {
        var request = new FeeCalculationRequest(
            Activity: "PERMITS IN THE AMATEUR SERVICE",
            ApplicationType: "Special Permit for the Use of Special Event Call Sign",
            Category: ServiceCategoryType.Permit
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(120.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(150.00m);
        result.FormulaApplied.Should().Be("FEESPECIAL EVENT-AT = SP + DST");
    }

    [Theory]
    [InlineData("High Powered (> 100W)", 2, 1080.00, 1110.00)] // (180*2=360) + (240*2=480) + (120*2=240) = 1080
    [InlineData("Medium Powered (25W-100W)", 1, 396.00, 426.00)] // 180 + 120 + 96 = 396
    [InlineData("Low Powered (<= 25W)", 1, 336.00, 366.00)] // 180 + 96 + 60 = 336
    public void Calculate_PowerRatedStationPurchasePossess_ShouldComputePowerTiers(string element, int units, decimal expectedSubtotal, decimal expectedTotal)
    {
        var request = new FeeCalculationRequest(
            Activity: "PERMITS IN THE AERONAUTICAL SERVICE",
            ApplicationType: "Aeronautical Station Permit to Purchase/Possess",
            Element: element,
            NoOfUnits: units,
            Category: ServiceCategoryType.Permit
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(expectedSubtotal);
        result.TotalAmount.Should().Be(expectedTotal);
        result.FormulaApplied.Should().Be("FEEPUR/POS = (FF)(UNIT) + (PUR)(UNIT) + (POS)(UNIT) + DST");
    }

    [Fact]
    public void Calculate_DemoAndPropagate_ShouldComputeChannelsAndStations()
    {
        var request = new FeeCalculationRequest(
            Activity: "PERMITS TO GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE",
            ApplicationType: "Temporary Permit to Demonstrate and Propagate",
            NoOfUnits: 2,
            AdditionalServicesCount: 4, // 4 channels
            Category: ServiceCategoryType.Permit
        );

        var result = _engine.Calculate(request);

        // FF = 180 * 2 = 360, DEMO = 85 * 4 = 340, Total = 700 + 30 = 730
        result.SubTotal.Should().Be(700.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(730.00m);
    }

    [Fact]
    public void Calculate_PermitToTransport_ShouldMultiplyUnitsBy85()
    {
        var request = new FeeCalculationRequest(
            Activity: "PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT",
            ApplicationType: "Permit to Transport",
            NoOfUnits: 5,
            Category: ServiceCategoryType.Permit
        );

        var result = _engine.Calculate(request);

        // PTR = 85 * 5 = 425 + 30 = 455
        result.SubTotal.Should().Be(425.00m);
        result.TotalAmount.Should().Be(455.00m);
        result.FormulaApplied.Should().Be("FEEPTR = (PTR)(UNIT) + DST");
    }

    [Fact]
    public void Calculate_RadioEquipmentDealerNew_ShouldComputeFilingPermitInspection()
    {
        var request = new FeeCalculationRequest(
            Activity: "PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT",
            ApplicationType: "Dealer Permit (NEW)",
            ValidityYears: 2,
            Category: ServiceCategoryType.Permit
        );

        var result = _engine.Calculate(request);

        // FF = 180, PF = 1200 * 2 = 2400, IF = 720 * 2 = 1440, Total = 4020 + 30 = 4050
        result.SubTotal.Should().Be(4020.00m);
        result.TotalAmount.Should().Be(4050.00m);
        result.FormulaApplied.Should().Be("FEEDP = FF + (PF)(YR) + (IF)(YR) + DST");
    }

    [Fact]
    public void Calculate_RadioEquipmentDealerRenewal_WithSurcharge_ShouldApplySurchargeOnPermitFee()
    {
        var expiration = new DateTime(2026, 1, 1);
        var asOf = expiration.AddDays(60); // 50% surcharge on PF (1200) -> 600

        var request = new FeeCalculationRequest(
            Activity: "PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT",
            ApplicationType: "Dealer Permit (RENEWAL)",
            ValidityYears: 1,
            ExpirationDate: expiration,
            AsOfDate: asOf,
            Category: ServiceCategoryType.Permit
        );

        var result = _engine.Calculate(request);

        // PF = 1200, IF = 720, SubTotal = 1920, SUR = 600, Total = 2520 + 30 = 2550
        result.SubTotal.Should().Be(1920.00m);
        result.SurchargeAmount.Should().Be(600.00m);
        result.TotalAmount.Should().Be(2550.00m);
    }

    [Fact]
    public void Calculate_MobilePhoneDealerMainNew_ShouldCompute500FfAnd2500Pf()
    {
        var request = new FeeCalculationRequest(
            Activity: "PERMITS FOR MOBILE PHONE",
            ApplicationType: "Dealer Permit (NEW)",
            Element: "MAIN",
            ValidityYears: 1,
            Category: ServiceCategoryType.Permit
        );

        var result = _engine.Calculate(request);

        // FF = 500, PF = 2500, IF = 1500, Total = 4500 + 30 = 4530
        result.SubTotal.Should().Be(4500.00m);
        result.TotalAmount.Should().Be(4530.00m);
        result.FormulaApplied.Should().Be("FEEMPDP = FF + (PF)(YR) + (IF)(YR) + DST");
    }

    [Fact]
    public void Calculate_MobilePhoneDealerBranchNew_ShouldCompute500FfAnd1500Pf()
    {
        var request = new FeeCalculationRequest(
            Activity: "PERMITS FOR MOBILE PHONE",
            ApplicationType: "Dealer Permit (NEW)",
            Element: "BRANCH",
            ValidityYears: 1,
            Category: ServiceCategoryType.Permit
        );

        var result = _engine.Calculate(request);

        // FF = 500, PF = 1500, IF = 1500, Total = 3500 + 30 = 3530
        result.SubTotal.Should().Be(3500.00m);
        result.TotalAmount.Should().Be(3530.00m);
    }

    [Fact]
    public void Calculate_PermitCertifiedTrueCopy_ShouldCharge24FirstAnd6Succeeding()
    {
        var request = new FeeCalculationRequest(
            Activity: "COPY OF PERMITS",
            ApplicationType: "Certified True Copy",
            NoOfCopies: 3,
            Category: ServiceCategoryType.Permit
        );

        var result = _engine.Calculate(request);

        // FC = 24, SC = 6 * 2 = 12, SubTotal = 36, Total = 36 + 30 = 66
        result.SubTotal.Should().Be(36.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(66.00m);
        result.FormulaApplied.Should().Be("TOTAL = FC + (SC)(COPY) + DST");
    }

    [Fact]
    public void Calculate_PermitDuplicateCopy_ShouldCharge120PlusDst()
    {
        var request = new FeeCalculationRequest(
            Activity: "COPY OF PERMITS",
            ApplicationType: "Duplicate Copy",
            Category: ServiceCategoryType.Permit
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(120.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(150.00m);
        result.FormulaApplied.Should().Be("TOTAL = DUP + DST");
    }

    #endregion

    #region Category Strategy Isolation Tests

    [Fact]
    public void Calculate_LicenseCategory_ShouldRouteToLicenseStrategy()
    {
        var request = new FeeCalculationRequest(
            Activity: "RADIO STATION LICENSES",
            ApplicationType: "New Station License",
            ValidityYears: 2,
            NoOfUnits: 3,
            Category: ServiceCategoryType.License
        );

        var result = _engine.Calculate(request);

        result.Category.Should().Be(ServiceCategoryType.License);
        result.FormulaApplied.Should().Be("FEELIC = FF + (LIC)(YR)(UNIT) + DST");
        // FF = 180, LIC = 500 * 2 * 3 = 3000, SubTotal = 3180, Total = 3210
        result.SubTotal.Should().Be(3180.00m);
        result.TotalAmount.Should().Be(3210.00m);
    }


    [Fact]
    public void Calculate_ExamCategory_ShouldRouteToExamStrategy()
    {
        var request = new FeeCalculationRequest(
            Activity: "RADIO OPERATORS EXAMINATION",
            ApplicationType: "Commercial Exam Admission",
            Category: ServiceCategoryType.Exam
        );

        var result = _engine.Calculate(request);

        result.Category.Should().Be(ServiceCategoryType.Exam);
        result.FormulaApplied.Should().Be("FEEEXAM = AF + EXAM + DST");
        // AF = 50, EXAM = 100, SubTotal = 150, Total = 180
        result.SubTotal.Should().Be(150.00m);
        result.TotalAmount.Should().Be(180.00m);
    }

    [Fact]
    public void Calculate_AccreditationCategory_ShouldRouteToAccreditationStrategy()
    {
        var request = new FeeCalculationRequest(
            Activity: "RADIO SERVICE CENTER ACCREDITATION",
            ApplicationType: "New Accreditation",
            ValidityYears: 3,
            Category: ServiceCategoryType.Accreditation
        );

        var result = _engine.Calculate(request);

        result.Category.Should().Be(ServiceCategoryType.Accreditation);
        result.FormulaApplied.Should().Be("FEEACCRED = FF + (ACCRED)(YR) + DST");
        // FF = 300, ACCRED = 1200 * 3 = 3600, SubTotal = 3900, Total = 3930
        result.SubTotal.Should().Be(3900.00m);
        result.TotalAmount.Should().Be(3930.00m);
    }

    [Fact]
    public void Calculate_RequestsCategory_ShouldRouteToRequestsStrategy()
    {
        var request = new FeeCalculationRequest(
            Activity: "SPECIAL REQUESTS AND COMPLAINTS",
            ApplicationType: "Verification of License Record",
            Category: ServiceCategoryType.RequestsAndComplaints
        );

        var result = _engine.Calculate(request);

        result.Category.Should().Be(ServiceCategoryType.RequestsAndComplaints);
        result.FormulaApplied.Should().Be("FEEREQ = REQ_FEE + DST");
        // REQ_FEE = 150, Total = 180
        result.SubTotal.Should().Be(150.00m);
        result.TotalAmount.Should().Be(180.00m);
    }

    #endregion

    #region Null Safety & Edge Case Tests

    [Fact]
    public void Calculate_WithNullActivityAndAppType_ShouldFallbackSafelyWithoutThrowing()
    {
        var request = new FeeCalculationRequest(
            Activity: null!,
            ApplicationType: null!,
            Element: null,
            Category: null
        );

        var result = _engine.Calculate(request);

        result.Should().NotBeNull();
        result.TotalAmount.Should().BeGreaterThan(0);
        result.LineItems.Should().NotBeEmpty();
    }

    [Fact]
    public void Calculate_WithUntrimmedAndMixedCaseInput_ShouldMatchCorrectly()
    {
        var request = new FeeCalculationRequest(
            Activity: "  radio operator certificates (roc) excluding amateur roc  ",
            ApplicationType: "  commercial radio operator certificate (new)  ",
            Element: "  1rtg  ",
            ValidityYears: 2,
            Category: ServiceCategoryType.Certificate
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(360.00m);
        result.TotalAmount.Should().Be(390.00m);
        result.Element.Should().Be("1rtg");
    }

    #endregion

    #region Licenses Category Tests (Spreadsheet Coverage)

    [Theory]
    [InlineData("Class A", 1, 120.00, 180.00, 210.00, FeeConstants.Formulas.LicenseAmateurNew)]
    [InlineData("Class B", 1, 132.00, 192.00, 222.00, FeeConstants.Formulas.LicenseAmateurNew)]
    [InlineData("Class C", 1, 144.00, 204.00, 234.00, FeeConstants.Formulas.LicenseAmateurNew)]
    [InlineData("Class D", 2, 144.00, 348.00, 378.00, FeeConstants.Formulas.LicenseAmateurNew)]
    public void Calculate_AmateurLicense_New_ShouldComputeCorrectAmounts(string element, int years, decimal expectedLf, decimal expectedSubtotal, decimal expectedTotal, string expectedFormula)
    {
        var request = new FeeCalculationRequest(
            Activity: "LICENSE IN THE AMATEUR SERVICE",
            ApplicationType: "Amateur Radio Station License (New)",
            Element: element,
            ValidityYears: years,
            Category: ServiceCategoryType.License
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(expectedSubtotal);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(expectedTotal);
        result.FormulaApplied.Should().Be(expectedFormula);
        result.LineItems.Should().Contain(li => li.ItemCode == FeeConstants.Codes.LicenseFee && li.FeeRate == expectedLf);
    }

    [Fact]
    public void Calculate_AmateurLicense_RenewalWithSurcharge_ShouldApplyTierMultiplier()
    {
        var expiration = new DateTime(2025, 1, 1);
        var asOfDate = new DateTime(2025, 4, 1); // 90 days delay (Tier 1: 50%)

        var request = new FeeCalculationRequest(
            Activity: "LICENSE IN THE AMATEUR SERVICE",
            ApplicationType: "Amateur Radio Station License (RENEWAL)",
            Element: "Class A",
            ValidityYears: 1,
            ExpirationDate: expiration,
            AsOfDate: asOfDate,
            Category: ServiceCategoryType.License
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(120.00m); // LF = 120
        result.SurchargeAmount.Should().Be(60.00m); // 50% of 120
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(210.00m);
        result.FormulaApplied.Should().Be(FeeConstants.Formulas.LicenseAmateurRenewal);
    }

    [Fact]
    public void Calculate_AmateurLicense_Modification_ShouldComputeCorrectAmounts()
    {
        var request = new FeeCalculationRequest(
            Activity: "LICENSE IN THE AMATEUR SERVICE",
            ApplicationType: "Amateur Radio Station License (MODIFICATION)",
            Category: ServiceCategoryType.License
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(110.00m); // FF=60, MOD=50
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(140.00m);
        result.FormulaApplied.Should().Be(FeeConstants.Formulas.LicenseAmateurModification);
    }

    [Fact]
    public void Calculate_AmateurLifetimeLicense_ShouldComputeCorrectAmounts()
    {
        var newReq = new FeeCalculationRequest(
            Activity: "LICENSE IN THE AMATEUR SERVICE",
            ApplicationType: "Lifetime Amateur Radio Station License for Class A (NEW)",
            Category: ServiceCategoryType.License
        );

        var newResult = _engine.Calculate(newReq);
        newResult.SubTotal.Should().Be(50.00m);
        newResult.TotalAmount.Should().Be(80.00m);

        var modReq = new FeeCalculationRequest(
            Activity: "LICENSE IN THE AMATEUR SERVICE",
            ApplicationType: "Lifetime Amateur Radio Station License for Class A (MODIFICATION)",
            Category: ServiceCategoryType.License
        );

        var modResult = _engine.Calculate(modReq);
        modResult.SubTotal.Should().Be(110.00m);
        modResult.TotalAmount.Should().Be(140.00m);
    }

    [Fact]
    public void Calculate_AmateurClubLicense_ShouldComputeSimplexAndDuplex()
    {
        var simplexReq = new FeeCalculationRequest(
            Activity: "LICENSE IN THE AMATEUR SERVICE",
            ApplicationType: "Amateur Club Radio Station License (NEW)",
            Element: "Simplex",
            ValidityYears: 1,
            Category: ServiceCategoryType.License
        );

        var simplexResult = _engine.Calculate(simplexReq);
        simplexResult.SubTotal.Should().Be(1480.00m); // FF=180 + CPF=600 + LF=700
        simplexResult.TotalAmount.Should().Be(1510.00m);

        var duplexReq = new FeeCalculationRequest(
            Activity: "LICENSE IN THE AMATEUR SERVICE",
            ApplicationType: "Amateur Club Radio Station License (NEW)",
            Element: "Duplex",
            ValidityYears: 1,
            Category: ServiceCategoryType.License
        );

        var duplexResult = _engine.Calculate(duplexReq);
        duplexResult.SubTotal.Should().Be(2100.00m); // FF=180 + CPF=600 + LF=1320
        duplexResult.TotalAmount.Should().Be(2130.00m);

        var modReq = new FeeCalculationRequest(
            Activity: "LICENSE IN THE AMATEUR SERVICE",
            ApplicationType: "Amateur Club Radio Station License (MODIFICATION)",
            Category: ServiceCategoryType.License
        );

        var modResult = _engine.Calculate(modReq);
        modResult.SubTotal.Should().Be(290.00m); // FF=180 + CPF=60 + MOD=50
        modResult.TotalAmount.Should().Be(320.00m);
    }

    [Theory]
    [InlineData("High Powered (>100W)", 120.00, 1080.00, 720.00, 1920.00, 1950.00)]
    [InlineData("Medium Powered (25W-100W)", 120.00, 960.00, 720.00, 1800.00, 1830.00)]
    [InlineData("Low Powered (<=25W)", 120.00, 840.00, 720.00, 1680.00, 1710.00)]
    public void Calculate_AeronauticalFixedLicense_New_ShouldComputePowerTiers(string element, decimal expectedCpf, decimal expectedLf, decimal expectedIf, decimal expectedSubtotal, decimal expectedTotal)
    {
        var request = new FeeCalculationRequest(
            Activity: "LICENSE IN THE AERONAUTICAL SERVICE",
            ApplicationType: "Fixed Aeronautical Station License (NEW)",
            Element: element,
            ValidityYears: 1,
            Category: ServiceCategoryType.License
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(expectedSubtotal);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(expectedTotal);
        result.FormulaApplied.Should().Be(FeeConstants.Formulas.LicenseAeroFixedNew);
        result.LineItems.Should().Contain(li => li.ItemCode == FeeConstants.Codes.ConstructionPermit && li.FeeRate == expectedCpf);
        result.LineItems.Should().Contain(li => li.ItemCode == FeeConstants.Codes.LicenseFee && li.FeeRate == expectedLf);
        result.LineItems.Should().Contain(li => li.ItemCode == FeeConstants.Codes.InspectionFee && li.FeeRate == expectedIf);
    }

    [Fact]
    public void Calculate_AeronauticalAircraftLicense_Modification_ShouldComputeAmounts()
    {
        var request = new FeeCalculationRequest(
            Activity: "LICENSE IN THE AERONAUTICAL SERVICE",
            ApplicationType: "Aircraft Station License (MODIFICATION)",
            Element: "High Powered (>100W)",
            Category: ServiceCategoryType.License
        );

        var result = _engine.Calculate(request);

        result.SubTotal.Should().Be(1320.00m); // FF=180 + CPF=960 + MOD=180
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(1350.00m);
        result.FormulaApplied.Should().Be(FeeConstants.Formulas.LicenseAeroAircraftModification);
    }

    [Fact]
    public void Calculate_MaritimeDomesticShipStation_WithOriginalEquip_ShouldComputeCorrectAmounts()
    {
        var request = new FeeCalculationRequest(
            Activity: "LICENSE IN THE MARITIME SERVICE",
            ApplicationType: "Ship Station License Domestic trade (With Originally0installed equipment) NEW",
            Element: "High Powered (>100W)",
            ValidityYears: 1,
            NoOfUnits: 1,
            Category: ServiceCategoryType.License
        );

        var result = _engine.Calculate(request);

        // FF=180, PUR=240, POS=120, CPF=720, LF=840, IF=720 -> SubTotal = 2820.00
        result.SubTotal.Should().Be(2820.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(2850.00m);
        result.FormulaApplied.Should().Be(FeeConstants.Formulas.LicenseMaritimeDomesticWithEquipNew);
    }

    [Fact]
    public void Calculate_MaritimeCoastalStation_RadiotelephonyVhf_ShouldComputeCorrectAmounts()
    {
        var request = new FeeCalculationRequest(
            Activity: "LICENSE IN THE MARITIME SERVICE",
            ApplicationType: "Private Coastal Station License (NEW)",
            Element: "Radiotelephony Very High Frequency (VHF)",
            ValidityYears: 1,
            Category: ServiceCategoryType.License
        );

        var result = _engine.Calculate(request);

        // CPF=480, LF=480, IF=480 -> SubTotal = 1440.00
        result.SubTotal.Should().Be(1440.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(1470.00m);
        result.FormulaApplied.Should().Be(FeeConstants.Formulas.LicenseMaritimePrivateCoastalNew);
    }

    [Fact]
    public void Calculate_FlmLicense_Portable_ShouldNotChargeConstructionPermit()
    {
        var newReq = new FeeCalculationRequest(
            Activity: "LICENSES FOR GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE",
            ApplicationType: "Radio Station License (NEW)",
            Element: "Simplex Portable (P) Low Powered",
            ValidityYears: 1,
            NoOfUnits: 1,
            Category: ServiceCategoryType.License
        );

        var newResult = _engine.Calculate(newReq);
        // CPF=0, LF=240, IF=240 -> SubTotal = 480.00
        newResult.SubTotal.Should().Be(480.00m);
        newResult.TotalAmount.Should().Be(510.00m);

        var modReq = new FeeCalculationRequest(
            Activity: "LICENSES FOR GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE",
            ApplicationType: "Radio Station License (MODIFICATION)",
            Element: "Portable (P)",
            NoOfUnits: 1,
            Category: ServiceCategoryType.License
        );

        var modResult = _engine.Calculate(modReq);
        // MOD=180, DST=30
        modResult.SubTotal.Should().Be(180.00m);
        modResult.TotalAmount.Should().Be(210.00m);
        modResult.FormulaApplied.Should().Be(FeeConstants.Formulas.LicenseFlmPortableModification);
    }

    [Fact]
    public void Calculate_TvroAndCatvLicense_ShouldComputeCorrectAmounts()
    {
        var tvroReq = new FeeCalculationRequest(
            Activity: "TVRO/CATV STATION LICENSE",
            ApplicationType: "TVRO Station License (NEW)",
            ValidityYears: 1,
            Category: ServiceCategoryType.License
        );

        var tvroResult = _engine.Calculate(tvroReq);
        tvroResult.SubTotal.Should().Be(2600.00m);
        tvroResult.TotalAmount.Should().Be(2630.00m);
        tvroResult.FormulaApplied.Should().Be(FeeConstants.Formulas.LicenseTvroNew);

        var catvReq = new FeeCalculationRequest(
            Activity: "TVRO/CATV STATION LICENSE",
            ApplicationType: "CATV Station License (NEW)",
            ValidityYears: 1,
            Category: ServiceCategoryType.License
        );

        var catvResult = _engine.Calculate(catvReq);
        // FF=400 + CPF=1140 + LF=3600 + IF=720 = 5860.00
        catvResult.SubTotal.Should().Be(5860.00m);
        catvResult.TotalAmount.Should().Be(5890.00m);
        catvResult.FormulaApplied.Should().Be(FeeConstants.Formulas.LicenseCatvNew);
    }

    [Fact]
    public void Calculate_LicenseCopies_ShouldComputeCorrectAmounts()
    {
        var ctcReq = new FeeCalculationRequest(
            Activity: "COPY OF LICENSES",
            ApplicationType: "Certified True Copy",
            NoOfCopies: 3,
            Category: ServiceCategoryType.License
        );

        var ctcResult = _engine.Calculate(ctcReq);
        // 1st copy = 24 + 2 * 6 = 36.00 + 30 DST = 66.00
        ctcResult.SubTotal.Should().Be(36.00m);
        ctcResult.TaxAmount.Should().Be(30.00m);
        ctcResult.TotalAmount.Should().Be(66.00m);

        var dupReq = new FeeCalculationRequest(
            Activity: "COPY OF LICENSES",
            ApplicationType: "Duplicate Copy",
            Category: ServiceCategoryType.License
        );

        var dupResult = _engine.Calculate(dupReq);
        dupResult.SubTotal.Should().Be(120.00m);
        dupResult.TaxAmount.Should().Be(30.00m);
        dupResult.TotalAmount.Should().Be(150.00m);
    }

    #endregion

    [Fact]
    public void StrategyRegistry_ShouldHaveDedicatedStrategyForEveryServiceCategoryEnum()
    {
        // Enforce tight synchronization: every value in ServiceCategoryType must be handled by a dedicated strategy
        var allCategoryEnumValues = Enum.GetValues<ServiceCategoryType>();

        foreach (var category in allCategoryEnumValues)
        {
            var request = new FeeCalculationRequest(
                Activity: "Generic Activity",
                ApplicationType: "Generic Type",
                Category: category
            );

            var result = _engine.Calculate(request);

            result.Should().NotBeNull();
            result.Category.Should().Be(category, $"Category {category} must be handled by its dedicated strategy");
            result.FormulaApplied.Should().NotBe("FEE = (RATE)(YR)(UNIT) + DST", $"Category {category} should have a dedicated statutory formula, not default fallback");
        }
    }
}


