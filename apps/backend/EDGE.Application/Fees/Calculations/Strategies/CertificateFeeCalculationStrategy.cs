using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Constants;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations.Strategies;

/// <summary>
/// Dedicated statutory fee calculation strategy for Certificates (ROC, Amateur, VAS, RFID/SRD/WDN, TVRO, CTC).
/// </summary>
public class CertificateFeeCalculationStrategy : IFeeCalculationStrategy
{
    public const decimal DST_AMOUNT = FeeConstants.Amounts.DocumentaryStampTax;

    public ServiceCategoryType Category => ServiceCategoryType.Certificate;

    public bool CanHandle(ServiceCategoryType? category, string? activity, string? applicationType)
    {
        if (category.HasValue)
        {
            return category.Value == ServiceCategoryType.Certificate;
        }

        return activity.SafeContainsAny("CERTIFICATE", "RADIO OPERATOR", "AMATEUR", "RFID", "SRD", "WDN", "TVRO", "VAS")
            || applicationType.SafeContainsAny("Certificate", "Certified True Copy", "Duplicate Copy");
    }

    public FeeCalculationResultDto Calculate(FeeCalculationRequest request)
    {
        var lineItems = new List<CalculatedFeeLineItemDto>();
        var years = Math.Max(1, request.ValidityYears);
        var units = Math.Max(1, request.NoOfUnits);
        var asOfDate = request.AsOfDate ?? DateTime.UtcNow;

        var activity = request.Activity.SafeTrim();
        var appType = request.ApplicationType.SafeTrim();
        var element = request.Element.SafeTrim();

        string formulaApplied;

        if (activity.SafeContains("COPY OF CERTIFICATES") || appType.SafeContainsAny("Certified True Copy", "Duplicate Copy"))
        {
            formulaApplied = CalculateCopyOfCertificates(appType, request.NoOfCopies, lineItems);
        }
        else if (activity.SafeContains("TVRO REGISTRATION") || appType.SafeContains("TVRO"))
        {
            formulaApplied = CalculateTvroRegistration(appType, lineItems);
        }
        else if (activity.SafeContainsAny("RFID", "SRD", "WDN", "DEVICES") || appType.SafeContainsAny("For Dealers", "For Non-Dealers"))
        {
            formulaApplied = CalculateRfidSrdWdn(appType, element, units, lineItems);
        }
        else if (activity.SafeContainsAny("VALUE-ADDED SERVICE", "VAS") || appType.SafeContains("VAS"))
        {
            formulaApplied = CalculateVasRenewal(request.AdditionalServicesCount, years, request.ExpirationDate, asOfDate, lineItems);
        }
        else if (activity.SafeContains("AMATEUR SERVICE") || appType.SafeContains("Amateur"))
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
            ItemCode: FeeConstants.Codes.Dst,
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
        var isRenewal = appType.SafeContains("RENEWAL");
        var isModification = appType.SafeContains("MODIFICATION");

        // Modification fee
        if (isModification)
        {
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Modification Fee",
                ItemCode: FeeConstants.Codes.Modification,
                Description: "Certificate Modification Fee",
                ValidityYears: 1,
                NoOfUnits: 1,
                FeeRate: FeeConstants.Amounts.CertificateModification,
                Amount: FeeConstants.Amounts.CertificateModification
            ));
            return FeeConstants.Formulas.RocModification;
        }

        // Foreign Pilot
        if (appType.SafeContains("Foreign Pilot"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Temporary Radio Operator Certificate Fee",
                ItemCode: FeeConstants.Codes.Roc,
                Description: "Foreign Pilot Temporary Certificate",
                ValidityYears: 1,
                NoOfUnits: 1,
                FeeRate: FeeConstants.Amounts.ForeignPilotTemporary,
                Amount: FeeConstants.Amounts.ForeignPilotTemporary
            ));
            return FeeConstants.Formulas.RocNew;
        }

        // Government ROC (FF, AF, ROC/yr)
        if (appType.SafeContains("Government"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Administrative Filing Fee", 1, 1, FeeConstants.Amounts.GovFilingFee, FeeConstants.Amounts.GovFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Application Fee", FeeConstants.Codes.ApplicationFee, "Administrative Application Fee", 1, 1, FeeConstants.Amounts.GovApplicationFee, FeeConstants.Amounts.GovApplicationFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Certificate Fee", FeeConstants.Codes.Roc, "Government ROC Fee", years, 1, FeeConstants.Amounts.GovRocAnnualRate, FeeConstants.Amounts.GovRocAnnualRate * years));

            if (isRenewal && expirationDate.HasValue)
            {
                ApplySurcharge(FeeConstants.Amounts.GovRocAnnualRate, expirationDate.Value, asOfDate, lineItems);
                return FeeConstants.Formulas.GovRocRenewal;
            }
            return FeeConstants.Formulas.GovRocNew;
        }

        // Land Mobile Station (FF, AF, ROC/yr)
        if (appType.SafeContains("Land Mobile"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Administrative Filing Fee", 1, 1, FeeConstants.Amounts.GovFilingFee, FeeConstants.Amounts.GovFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Application Fee", FeeConstants.Codes.ApplicationFee, "Administrative Application Fee", 1, 1, FeeConstants.Amounts.GovApplicationFee, FeeConstants.Amounts.GovApplicationFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Certificate Fee", FeeConstants.Codes.Roc, "RROC Land Mobile Station Fee", years, 1, FeeConstants.Amounts.LandMobileRocAnnualRate, FeeConstants.Amounts.LandMobileRocAnnualRate * years));

            if (isRenewal && expirationDate.HasValue)
            {
                ApplySurcharge(FeeConstants.Amounts.LandMobileRocAnnualRate, expirationDate.Value, asOfDate, lineItems);
                return FeeConstants.Formulas.LandMobileRocRenewal;
            }
            return FeeConstants.Formulas.LandMobileRocNew;
        }

        // Special Radio Operator (AF, SEM, ROC/yr)
        if (appType.SafeContains("Special"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Application Fee", FeeConstants.Codes.ApplicationFee, "Administrative Application Fee", 1, 1, FeeConstants.Amounts.GovApplicationFee, FeeConstants.Amounts.GovApplicationFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Seminar Fee", FeeConstants.Codes.Seminar, "Special ROC Seminar Fee", 1, 1, FeeConstants.Amounts.SpecialRocSeminarFee, FeeConstants.Amounts.SpecialRocSeminarFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Certificate Fee", FeeConstants.Codes.Roc, "Special Radio Operator Certificate Fee", years, 1, FeeConstants.Amounts.SpecialRocAnnualRate, FeeConstants.Amounts.SpecialRocAnnualRate * years));

            if (isRenewal && expirationDate.HasValue)
            {
                ApplySurcharge(FeeConstants.Amounts.SpecialRocAnnualRate, expirationDate.Value, asOfDate, lineItems);
                return FeeConstants.Formulas.SpecialRocRenewal;
            }
            return FeeConstants.Formulas.SpecialRocNew;
        }

        // Aircraft (ROC/yr)
        if (appType.SafeContains("Aircraft"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Certificate Fee", FeeConstants.Codes.Roc, "RROC Aircraft Certificate Fee", years, 1, FeeConstants.Amounts.AircraftRocAnnualRate, FeeConstants.Amounts.AircraftRocAnnualRate * years));
            if (isRenewal && expirationDate.HasValue)
            {
                ApplySurcharge(FeeConstants.Amounts.AircraftRocAnnualRate, expirationDate.Value, asOfDate, lineItems);
                return FeeConstants.Formulas.RocRenewal;
            }
            return FeeConstants.Formulas.RocNew;
        }

        // Commercial Radio Operator (1RTG, 2RTG, 3RTG, 1PHN, 2PHN, 3PHN)
        var rocRate = ResolveRocRateByElement(element);
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: $"Certificate Fee ({element})",
            ItemCode: FeeConstants.Codes.Roc,
            Description: $"Commercial Radio Operator Certificate Fee ({element})",
            ValidityYears: years,
            NoOfUnits: 1,
            FeeRate: rocRate,
            Amount: rocRate * years
        ));

        if (isRenewal && expirationDate.HasValue)
        {
            ApplySurcharge(rocRate, expirationDate.Value, asOfDate, lineItems);
            return FeeConstants.Formulas.RocRenewal;
        }

        return FeeConstants.Formulas.RocNew;
    }

    private static string CalculateAmateurCertificates(
        string appType,
        string element,
        int years,
        DateTime? expirationDate,
        DateTime asOfDate,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        if (appType.SafeContains("Lifetime") || element.SafeContains("Lifetime"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Amateur Lifetime Filing Fee", 1, 1, FeeConstants.Amounts.AmateurLifetimeFilingFee, FeeConstants.Amounts.AmateurLifetimeFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Amateur Lifetime Modification Fee", 1, 1, FeeConstants.Amounts.AmateurLifetimeModificationFee, FeeConstants.Amounts.AmateurLifetimeModificationFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Possess Permit Fee", FeeConstants.Codes.PossessPermit, "Possess Permit Fee", 1, 1, FeeConstants.Amounts.AmateurLifetimePossessPermitFee, FeeConstants.Amounts.AmateurLifetimePossessPermitFee));
            return FeeConstants.Formulas.AmateurLifetime;
        }

        if (appType.SafeContains("MODIFICATION"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Amateur Certificate Modification Fee", 1, 1, FeeConstants.Amounts.AmateurModificationFee, FeeConstants.Amounts.AmateurModificationFee));
            return FeeConstants.Formulas.AmateurModification;
        }

        // Standard Amateur ROC (₱60/yr)
        lineItems.Add(new CalculatedFeeLineItemDto("Certificate Fee", FeeConstants.Codes.Roc, "Amateur Radio Operator Certificate Fee", years, 1, FeeConstants.Amounts.AmateurRocAnnualRate, FeeConstants.Amounts.AmateurRocAnnualRate * years));

        if (appType.SafeContains("RENEWAL") && expirationDate.HasValue)
        {
            ApplySurcharge(FeeConstants.Amounts.AmateurRocAnnualRate, expirationDate.Value, asOfDate, lineItems);
            return FeeConstants.Formulas.AmateurRocRenewal;
        }

        return FeeConstants.Formulas.AmateurRocNew;
    }

    private static string CalculateRfidSrdWdn(
        string appType,
        string element,
        int units,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        lineItems.Add(new CalculatedFeeLineItemDto("Application Fee", FeeConstants.Codes.ApplicationFee, "Application Evaluation Fee", 1, 1, FeeConstants.Amounts.RfidApplicationFee, FeeConstants.Amounts.RfidApplicationFee));

        decimal regRate;
        string desc;

        if (element.SafeContains("Low Power"))
        {
            regRate = FeeConstants.Amounts.RfidLowPowerUnitRate;
            desc = "RFID Low Power Registration Fee";
        }
        else if (element.SafeContainsAny("SRD", "WDN"))
        {
            regRate = FeeConstants.Amounts.SrdWdnUnitRate;
            desc = "SRD/WDN Devices - Indoor Registration Fee";
        }
        else
        {
            // Default: RFID High Power
            regRate = FeeConstants.Amounts.RfidHighPowerUnitRate;
            desc = "RFID High Power Registration Fee (per Unit)";
        }

        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: desc,
            ItemCode: FeeConstants.Codes.Registration,
            Description: $"{desc} ({units} unit(s))",
            ValidityYears: 1,
            NoOfUnits: units,
            FeeRate: regRate,
            Amount: regRate * units
        ));

        return FeeConstants.Formulas.RfidRegistration;
    }

    private static string CalculateTvroRegistration(
        string appType,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: "TVRO Registration Fee",
            ItemCode: FeeConstants.Codes.Registration,
            Description: "TVRO Registration Certificate Fee (Per Service Area)",
            ValidityYears: 1,
            NoOfUnits: 1,
            FeeRate: FeeConstants.Amounts.TvroRegistrationRate,
            Amount: FeeConstants.Amounts.TvroRegistrationRate
        ));

        return FeeConstants.Formulas.TvroRegistration;
    }

    private static string CalculateVasRenewal(
        int additionalServicesCount,
        int years,
        DateTime? expirationDate,
        DateTime asOfDate,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Administrative Filing Fee", 1, 1, FeeConstants.Amounts.VasFilingFee, FeeConstants.Amounts.VasFilingFee));

        // ARF1 (first 5 services)
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: "Annual Registration Fee 1 (ARF1 - Base 5 Services)",
            ItemCode: FeeConstants.Codes.AnnualRegistration1,
            Description: "Annual Registration Fee for the first 5 services",
            ValidityYears: years,
            NoOfUnits: 1,
            FeeRate: FeeConstants.Amounts.VasAnnualBaseRate,
            Amount: FeeConstants.Amounts.VasAnnualBaseRate * years
        ));

        // ARF2 per excess service
        var nas = Math.Max(0, additionalServicesCount);
        decimal excessAmount = 0;
        if (nas > 0)
        {
            excessAmount = FeeConstants.Amounts.VasAnnualExcessRate * nas * years;
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Annual Registration Fee 2 (ARF2 - Additional Services)",
                ItemCode: FeeConstants.Codes.AnnualRegistration2,
                Description: $"Annual Registration Fee for {nas} additional service(s)",
                ValidityYears: years,
                NoOfUnits: nas,
                FeeRate: FeeConstants.Amounts.VasAnnualExcessRate,
                Amount: excessAmount
            ));
        }

        if (expirationDate.HasValue)
        {
            var baseArfAnnual = FeeConstants.Amounts.VasAnnualBaseRate + (FeeConstants.Amounts.VasAnnualExcessRate * nas);
            ApplySurcharge(baseArfAnnual, expirationDate.Value, asOfDate, lineItems);
            return FeeConstants.Formulas.VasRenewalWithSurcharge;
        }

        return FeeConstants.Formulas.VasRenewal;
    }

    private static string CalculateCopyOfCertificates(
        string appType,
        int copies,
        List<CalculatedFeeLineItemDto> lineItems)
    {
        if (appType.SafeContains("Duplicate"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Duplicate Fee", FeeConstants.Codes.Duplicate, "Duplicate Copy Certificate Fee", 1, 1, FeeConstants.Amounts.DuplicateCopyRate, FeeConstants.Amounts.DuplicateCopyRate));
            return FeeConstants.Formulas.DuplicateCopy;
        }

        // Certified True Copy: FC, SC
        var totalCopies = Math.Max(1, copies);
        lineItems.Add(new CalculatedFeeLineItemDto("First Copy Fee", FeeConstants.Codes.FirstCopy, "Certified True Copy - First Copy", 1, 1, FeeConstants.Amounts.CertifiedTrueCopyFirstPage, FeeConstants.Amounts.CertifiedTrueCopyFirstPage));

        if (totalCopies > 1)
        {
            var succeeding = totalCopies - 1;
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Succeeding Copies Fee",
                ItemCode: FeeConstants.Codes.SucceedingCopies,
                Description: $"Certified True Copy - {succeeding} succeeding page(s)/copy",
                ValidityYears: 1,
                NoOfUnits: succeeding,
                FeeRate: FeeConstants.Amounts.CertifiedTrueCopySucceedingPage,
                Amount: FeeConstants.Amounts.CertifiedTrueCopySucceedingPage * succeeding
            ));
        }

        return FeeConstants.Formulas.CertifiedTrueCopy;
    }

    private static decimal ResolveRocRateByElement(string element)
    {
        var e = element.SafeTrim().ToUpperInvariant();
        if (e.SafeContains("1RTG")) return FeeConstants.Amounts.Roc1RtgAnnualRate;
        if (e.SafeContains("2RTG")) return FeeConstants.Amounts.Roc2RtgAnnualRate;
        if (e.SafeContains("3RTG")) return FeeConstants.Amounts.Roc3RtgAnnualRate;
        if (e.SafeContains("1PHN")) return FeeConstants.Amounts.Roc1PhnAnnualRate;
        if (e.SafeContains("2PH"))  return FeeConstants.Amounts.Roc2PhnAnnualRate;
        if (e.SafeContains("3PHN")) return FeeConstants.Amounts.Roc3PhnAnnualRate;

        return FeeConstants.Amounts.RocDefaultAnnualRate;
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
                ItemCode: FeeConstants.Codes.Surcharge,
                Description: description,
                ValidityYears: 1,
                NoOfUnits: 1,
                FeeRate: surchargeAmount,
                Amount: surchargeAmount,
                IsSurcharge: true
            ));
        }
    }
}
