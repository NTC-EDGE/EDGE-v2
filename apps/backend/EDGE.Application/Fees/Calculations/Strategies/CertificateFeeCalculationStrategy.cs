using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations.Strategies;

/// <summary>
/// Dedicated statutory fee calculation strategy for Certificates (ROC, Amateur, VAS, RFID/SRD/WDN, TVRO, CTC).
/// </summary>
public class CertificateFeeCalculationStrategy : IFeeCalculationStrategy
{
    public const decimal DST_AMOUNT = 30.00m;

    public ServiceCategoryType Category => ServiceCategoryType.Certificate;

    public bool CanHandle(ServiceCategoryType? category, string? activity, string? applicationType)
    {
        if (category.HasValue)
        {
            return category.Value == ServiceCategoryType.Certificate;
        }

        var act = activity ?? string.Empty;
        var app = applicationType ?? string.Empty;

        return act.Contains("CERTIFICATE", StringComparison.OrdinalIgnoreCase)
            || act.Contains("RADIO OPERATOR", StringComparison.OrdinalIgnoreCase)
            || act.Contains("AMATEUR", StringComparison.OrdinalIgnoreCase)
            || act.Contains("RFID", StringComparison.OrdinalIgnoreCase)
            || act.Contains("SRD", StringComparison.OrdinalIgnoreCase)
            || act.Contains("WDN", StringComparison.OrdinalIgnoreCase)
            || act.Contains("TVRO", StringComparison.OrdinalIgnoreCase)
            || act.Contains("VAS", StringComparison.OrdinalIgnoreCase)
            || app.Contains("Certificate", StringComparison.OrdinalIgnoreCase)
            || app.Contains("Certified True Copy", StringComparison.OrdinalIgnoreCase)
            || app.Contains("Duplicate Copy", StringComparison.OrdinalIgnoreCase);
    }

    public FeeCalculationResultDto Calculate(FeeCalculationRequest request)
    {
        var lineItems = new List<CalculatedFeeLineItemDto>();
        var years = Math.Max(1, request.ValidityYears);
        var units = Math.Max(1, request.NoOfUnits);
        var asOfDate = request.AsOfDate ?? DateTime.UtcNow;

        var activity = (request.Activity ?? string.Empty).Trim();
        var appType = (request.ApplicationType ?? string.Empty).Trim();
        var element = (request.Element ?? string.Empty).Trim();

        string formulaApplied;

        if (IsActivity(activity, "COPY OF CERTIFICATES") || IsAppType(appType, "Certified True Copy", "Duplicate Copy"))
        {
            formulaApplied = CalculateCopyOfCertificates(appType, request.NoOfCopies, lineItems);
        }
        else if (IsActivity(activity, "TVRO REGISTRATION") || IsAppType(appType, "TVRO"))
        {
            formulaApplied = CalculateTvroRegistration(appType, lineItems);
        }
        else if (IsActivity(activity, "RFID", "SRD", "WDN", "DEVICES") || IsAppType(appType, "For Dealers", "For Non-Dealers"))
        {
            formulaApplied = CalculateRfidSrdWdn(appType, element, units, lineItems);
        }
        else if (IsActivity(activity, "VALUE-ADDED SERVICE", "VAS") || IsAppType(appType, "VAS"))
        {
            formulaApplied = CalculateVasRenewal(request.AdditionalServicesCount, years, request.ExpirationDate, asOfDate, lineItems);
        }
        else if (IsActivity(activity, "AMATEUR SERVICE") || IsAppType(appType, "Amateur"))
        {
            formulaApplied = CalculateAmateurCertificates(appType, element, years, request.ExpirationDate, asOfDate, lineItems);
        }
        else
        {
            // Default: Commercial / General Radio Operator Certificates (ROC)
            formulaApplied = CalculateRadioOperatorCertificates(appType, element, years, request.ExpirationDate, asOfDate, lineItems);
        }

        // Add mandatory Documentary Stamp Tax (DST)
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: "Documentary Stamp Tax (DST)",
            ItemCode: "DST",
            Description: "Statutory Documentary Stamp Tax",
            ValidityYears: 1,
            NoOfUnits: 1,
            FeeRate: DST_AMOUNT,
            Amount: DST_AMOUNT,
            IsTax: true
        ));

        var subTotal = lineItems.Where(li => !li.IsSurcharge && !li.IsTax).Sum(li => li.Amount);
        var surchargeAmount = lineItems.Where(li => li.IsSurcharge).Sum(li => li.Amount);
        var taxAmount = lineItems.Where(li => li.IsTax).Sum(li => li.Amount);
        var totalAmount = lineItems.Sum(li => li.Amount);

        return new FeeCalculationResultDto(
            Activity: activity,
            ApplicationType: appType,
            Element: string.IsNullOrWhiteSpace(element) ? null : element,
            FormulaApplied: formulaApplied,
            SubTotal: subTotal,
            SurchargeAmount: surchargeAmount,
            TaxAmount: taxAmount,
            TotalAmount: totalAmount,
            LineItems: lineItems,
            Category: ServiceCategoryType.Certificate
        );
    }

    private static string CalculateRadioOperatorCertificates(
        string appType,
        string element,
        int years,
        DateTime? expirationDate,
        DateTime asOfDate,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        var isRenewal = appType.Contains("RENEWAL", StringComparison.OrdinalIgnoreCase);
        var isModification = appType.Contains("MODIFICATION", StringComparison.OrdinalIgnoreCase);

        // Modification fee (flat ₱120.00)
        if (isModification)
        {
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Modification Fee",
                ItemCode: "MOD",
                Description: "Certificate Modification Fee",
                ValidityYears: 1,
                NoOfUnits: 1,
                FeeRate: 120.00m,
                Amount: 120.00m
            ));
            return "FEEROC = MOD + DST";
        }

        // Foreign Pilot (Flat ₱100.00)
        if (appType.Contains("Foreign Pilot", StringComparison.OrdinalIgnoreCase))
        {
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Temporary Radio Operator Certificate Fee",
                ItemCode: "ROC",
                Description: "Foreign Pilot Temporary Certificate",
                ValidityYears: 1,
                NoOfUnits: 1,
                FeeRate: 100.00m,
                Amount: 100.00m
            ));
            return "FEEROC = ROC + DST";
        }

        // Government ROC (FF=10, AF=20, ROC=60/yr)
        if (appType.Contains("Government", StringComparison.OrdinalIgnoreCase))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", "FF", "Administrative Filing Fee", 1, 1, 10.00m, 10.00m));
            lineItems.Add(new CalculatedFeeLineItemDto("Application Fee", "AF", "Administrative Application Fee", 1, 1, 20.00m, 20.00m));
            lineItems.Add(new CalculatedFeeLineItemDto("Certificate Fee", "ROC", "Government ROC Fee", years, 1, 60.00m, 60.00m * years));

            if (isRenewal && expirationDate.HasValue)
            {
                ApplySurcharge(60.00m, expirationDate.Value, asOfDate, lineItems);
                return "FEEROC = FF + AF + (ROC)(YR) + DST + SUR";
            }
            return "FEEROC = FF + AF + (ROC)(YR) + DST";
        }

        // Land Mobile Station (FF=10, AF=20, ROC=30/yr)
        if (appType.Contains("Land Mobile", StringComparison.OrdinalIgnoreCase))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", "FF", "Administrative Filing Fee", 1, 1, 10.00m, 10.00m));
            lineItems.Add(new CalculatedFeeLineItemDto("Application Fee", "AF", "Administrative Application Fee", 1, 1, 20.00m, 20.00m));
            lineItems.Add(new CalculatedFeeLineItemDto("Certificate Fee", "ROC", "RROC Land Mobile Station Fee", years, 1, 30.00m, 30.00m * years));

            if (isRenewal && expirationDate.HasValue)
            {
                ApplySurcharge(30.00m, expirationDate.Value, asOfDate, lineItems);
                return "FEEROC = FF + AF + (ROC)(YR) + DST + SUR";
            }
            return "FEEROC = FF + AF + (ROC)(YR) + DST";
        }

        // Special Radio Operator (AF=20, SEM=20, ROC=60/yr)
        if (appType.Contains("Special", StringComparison.OrdinalIgnoreCase))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Application Fee", "AF", "Administrative Application Fee", 1, 1, 20.00m, 20.00m));
            lineItems.Add(new CalculatedFeeLineItemDto("Seminar Fee", "SEM", "Special ROC Seminar Fee", 1, 1, 20.00m, 20.00m));
            lineItems.Add(new CalculatedFeeLineItemDto("Certificate Fee", "ROC", "Special Radio Operator Certificate Fee", years, 1, 60.00m, 60.00m * years));

            if (isRenewal && expirationDate.HasValue)
            {
                ApplySurcharge(60.00m, expirationDate.Value, asOfDate, lineItems);
                return "FEEROC = AF + SEM + (ROC)(YR) + DST + SUR";
            }
            return "FEEROC = AF + SEM + (ROC)(YR) + DST";
        }

        // Aircraft (ROC=100/yr)
        if (appType.Contains("Aircraft", StringComparison.OrdinalIgnoreCase))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Certificate Fee", "ROC", "RROC Aircraft Certificate Fee", years, 1, 100.00m, 100.00m * years));
            if (isRenewal && expirationDate.HasValue)
            {
                ApplySurcharge(100.00m, expirationDate.Value, asOfDate, lineItems);
                return "FEEROC = (ROC)(YR) + DST + SUR";
            }
            return "FEEROC = (ROC)(YR) + DST";
        }

        // Commercial Radio Operator (1RTG=180, 2RTG=120, 3RTG=60, 1PHN=120, 2PH=100, 3PHN=60)
        var rocRate = ResolveRocRateByElement(element);
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: $"Certificate Fee ({element})",
            ItemCode: "ROC",
            Description: $"Commercial Radio Operator Certificate Fee ({element})",
            ValidityYears: years,
            NoOfUnits: 1,
            FeeRate: rocRate,
            Amount: rocRate * years
        ));

        if (isRenewal && expirationDate.HasValue)
        {
            ApplySurcharge(rocRate, expirationDate.Value, asOfDate, lineItems);
            return "FEEROC = (ROC)(YR) + DST + SUR";
        }

        return "FEEROC = (ROC)(YR) + DST";
    }

    private static string CalculateAmateurCertificates(
        string appType,
        string element,
        int years,
        DateTime? expirationDate,
        DateTime asOfDate,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        if (appType.Contains("Lifetime", StringComparison.OrdinalIgnoreCase) || element.Contains("Lifetime", StringComparison.OrdinalIgnoreCase))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", "FF", "Amateur Lifetime Filing Fee", 1, 1, 60.00m, 60.00m));
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", "MOD", "Amateur Lifetime Modification Fee", 1, 1, 50.00m, 50.00m));
            lineItems.Add(new CalculatedFeeLineItemDto("Possess Permit Fee", "POSS_PERMIT", "Possess Permit Fee", 1, 1, 50.00m, 50.00m));
            return "FEEAT-LIFETIME = FF + MOD + POSS_PERMIT + DST";
        }

        if (appType.Contains("MODIFICATION", StringComparison.OrdinalIgnoreCase))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", "MOD", "Amateur Certificate Modification Fee", 1, 1, 60.00m, 60.00m));
            return "FEEAT-ROC = MOD + DST";
        }

        // Standard Amateur ROC (₱60/yr)
        lineItems.Add(new CalculatedFeeLineItemDto("Certificate Fee", "ROC", "Amateur Radio Operator Certificate Fee", years, 1, 60.00m, 60.00m * years));

        if (appType.Contains("RENEWAL", StringComparison.OrdinalIgnoreCase) && expirationDate.HasValue)
        {
            ApplySurcharge(60.00m, expirationDate.Value, asOfDate, lineItems);
            return "FEEAT-ROC = (ROC)(YR) + DST + SUR";
        }

        return "FEEAT-ROC = (ROC)(YR) + DST";
    }

    private static string CalculateRfidSrdWdn(
        string appType,
        string element,
        int units,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        // AF = 180.00
        lineItems.Add(new CalculatedFeeLineItemDto("Application Fee", "AF", "Application Evaluation Fee", 1, 1, 180.00m, 180.00m));

        decimal regRate;
        string desc;

        if (element.Contains("Low Power", StringComparison.OrdinalIgnoreCase))
        {
            regRate = 100.00m;
            desc = "RFID Low Power Registration Fee";
        }
        else if (element.Contains("SRD", StringComparison.OrdinalIgnoreCase) || element.Contains("WDN", StringComparison.OrdinalIgnoreCase))
        {
            regRate = 50.00m;
            desc = "SRD/WDN Devices - Indoor Registration Fee";
        }
        else
        {
            // Default: RFID High Power
            regRate = 300.00m;
            desc = "RFID High Power Registration Fee (per Unit)";
        }

        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: desc,
            ItemCode: "REG",
            Description: $"{desc} ({units} unit(s))",
            ValidityYears: 1,
            NoOfUnits: units,
            FeeRate: regRate,
            Amount: regRate * units
        ));

        return "FEEREG = AF + (REG)(UNIT) + DST";
    }

    private static string CalculateTvroRegistration(
        string appType,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: "TVRO Registration Fee",
            ItemCode: "REG",
            Description: "TVRO Registration Certificate Fee (Per Service Area)",
            ValidityYears: 1,
            NoOfUnits: 1,
            FeeRate: 6500.00m,
            Amount: 6500.00m
        ));

        return "FEETVROREG = REG + DST";
    }

    private static string CalculateVasRenewal(
        int additionalServicesCount,
        int years,
        DateTime? expirationDate,
        DateTime asOfDate,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        // FF = 300.00
        lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", "FF", "Administrative Filing Fee", 1, 1, 300.00m, 300.00m));

        // ARF1 = 6000.00 (first 5 services)
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: "Annual Registration Fee 1 (ARF1 - Base 5 Services)",
            ItemCode: "ARF1",
            Description: "Annual Registration Fee for the first 5 services",
            ValidityYears: years,
            NoOfUnits: 1,
            FeeRate: 6000.00m,
            Amount: 6000.00m * years
        ));

        // ARF2 = 1000.00 per excess service
        var nas = Math.Max(0, additionalServicesCount);
        decimal excessAmount = 0;
        if (nas > 0)
        {
            excessAmount = 1000.00m * nas * years;
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Annual Registration Fee 2 (ARF2 - Additional Services)",
                ItemCode: "ARF2",
                Description: $"Annual Registration Fee for {nas} additional service(s)",
                ValidityYears: years,
                NoOfUnits: nas,
                FeeRate: 1000.00m,
                Amount: excessAmount
            ));
        }

        if (expirationDate.HasValue)
        {
            var baseArfAnnual = 6000.00m + (1000.00m * nas);
            ApplySurcharge(baseArfAnnual, expirationDate.Value, asOfDate, lineItems);
            return "FEECERT = FF + (ARF1 + (ARF2)(NAS))(YR) + DST + SUR";
        }

        return "FEECERT = FF + (ARF1 + (ARF2)(NAS))(YR) + DST";
    }

    private static string CalculateCopyOfCertificates(
        string appType,
        int copies,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        if (appType.Contains("Duplicate", StringComparison.OrdinalIgnoreCase))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Duplicate Fee", "DUP", "Duplicate Copy Certificate Fee", 1, 1, 120.00m, 120.00m));
            return "FEEDUP = DUP + DST";
        }

        // Certified True Copy: FC = 6, SC = 2.50
        var totalCopies = Math.Max(1, copies);
        lineItems.Add(new CalculatedFeeLineItemDto("First Copy Fee", "FC", "Certified True Copy - First Copy", 1, 1, 6.00m, 6.00m));

        if (totalCopies > 1)
        {
            var succeeding = totalCopies - 1;
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Succeeding Copies Fee",
                ItemCode: "SC",
                Description: $"Certified True Copy - {succeeding} succeeding page(s)/copy",
                ValidityYears: 1,
                NoOfUnits: succeeding,
                FeeRate: 2.50m,
                Amount: 2.50m * succeeding
            ));
        }

        return "FEECTC = FC + (SC)(COPY) + DST";
    }

    private static decimal ResolveRocRateByElement(string element)
    {
        var e = (element ?? string.Empty).ToUpperInvariant().Trim();
        if (e.Contains("1RTG")) return 180.00m;
        if (e.Contains("2RTG")) return 120.00m;
        if (e.Contains("3RTG")) return 60.00m;
        if (e.Contains("1PHN")) return 120.00m;
        if (e.Contains("2PH"))  return 100.00m;
        if (e.Contains("3PHN")) return 60.00m;

        return 180.00m; // Default rate
    }

    private static void ApplySurcharge(
        decimal baseAnnualRate,
        DateTime expirationDate,
        DateTime asOfDate,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        var (multiplier, description) = SurchargeCalculator.CalculateSurchargeTier(expirationDate, asOfDate);
        if (multiplier > 0)
        {
            var surchargeAmount = baseAnnualRate * multiplier;
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Surcharge (Late Renewal Penalty)",
                ItemCode: "SUR",
                Description: description,
                ValidityYears: 1,
                NoOfUnits: 1,
                FeeRate: surchargeAmount,
                Amount: surchargeAmount,
                IsSurcharge: true
            ));
        }
    }

    private static bool IsActivity(string activity, params string[] terms)
    {
        return terms.Any(t => activity.Contains(t, StringComparison.OrdinalIgnoreCase));
    }

    private static bool IsAppType(string appType, params string[] terms)
    {
        return terms.Any(t => appType.Contains(t, StringComparison.OrdinalIgnoreCase));
    }
}
