using System;
using System.Linq;
using FluentAssertions;
using Xunit;
using EDGE.Application.Fees.Calculations;
using EDGE.Application.Fees.Calculations.Strategies;
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
    [InlineData(60, 0.50, 90.00, 300.00)]   // 2 months late -> 50%
    [InlineData(200, 1.00, 180.00, 390.00)] // 6.5 months late -> 100%
    [InlineData(400, 1.50, 270.00, 480.00)] // 13 months late -> 150%
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
    public void Calculate_PermitCategory_ShouldRouteToPermitStrategy()
    {
        var request = new FeeCalculationRequest(
            Activity: "PERMIT TO PURCHASE AND POSSESS",
            ApplicationType: "Purchase Permit",
            NoOfUnits: 2,
            Category: ServiceCategoryType.Permit
        );

        var result = _engine.Calculate(request);

        result.Category.Should().Be(ServiceCategoryType.Permit);
        result.FormulaApplied.Should().Be("FEEPERMIT = FF + (PERMIT)(UNIT) + DST");
        // FF = 100, PERMIT = 300 * 2 = 600, SubTotal = 700, Total = 730
        result.SubTotal.Should().Be(700.00m);
        result.TotalAmount.Should().Be(730.00m);
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

    #endregion
}


