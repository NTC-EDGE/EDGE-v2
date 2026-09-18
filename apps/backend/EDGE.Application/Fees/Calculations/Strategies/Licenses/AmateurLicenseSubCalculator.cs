using System;
using System.Collections.Generic;
using EDGE.Domain.Constants;

namespace EDGE.Application.Fees.Calculations.Strategies.Licenses;

public class AmateurLicenseSubCalculator : ILicenseSubCategoryCalculator
{
    public bool CanHandle(string activity, string applicationType)
    {
        return activity.SafeContains("AMATEUR") || applicationType.SafeContains("Amateur");
    }

    public string Calculate(
        List<CalculatedFeeLineItemDto> lineItems,
        FeeCalculationRequest request,
        int years,
        int units,
        int copies,
        int channels,
        DateTime asOfDate)
    {
        var appType = request.ApplicationType.SafeTrim();
        var element = request.Element.SafeTrim();
        var isRenewal = appType.SafeContains("RENEWAL");
        var isModification = appType.SafeContains("MODIFICATION");

        // Lifetime Amateur Radio Station License for Class A
        if (appType.SafeContains("Lifetime"))
        {
            if (isModification)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Amateur Lifetime License Modification Filing Fee", 1, 1, FeeConstants.Amounts.AmateurLicenseFilingFee, FeeConstants.Amounts.AmateurLicenseFilingFee));
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Amateur Lifetime License Modification Fee", 1, 1, FeeConstants.Amounts.AmateurLicenseModificationFee, FeeConstants.Amounts.AmateurLicenseModificationFee));
                return FeeConstants.Formulas.LicenseAmateurLifetimeModification;
            }

            lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "Lifetime Amateur Station License Fee", 1, 1, FeeConstants.Amounts.AmateurLifetimeLicenseFee, FeeConstants.Amounts.AmateurLifetimeLicenseFee));
            return FeeConstants.Formulas.LicenseAmateurLifetimeNew;
        }

        // Amateur Club Radio Station License
        if (appType.SafeContains("Club"))
        {
            var isDuplex = element.SafeContains("DUPLEX") || appType.SafeContains("Duplex");
            var clubLfRate = isDuplex ? FeeConstants.Amounts.AmateurClubDuplexLicenseFee : FeeConstants.Amounts.AmateurClubSimplexLicenseFee;

            if (isModification)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Amateur Club License Modification Filing Fee", 1, 1, FeeConstants.Amounts.AmateurClubFilingFee, FeeConstants.Amounts.AmateurClubFilingFee));
                lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "Amateur Club Modification Construction Permit Fee", 1, 1, FeeConstants.Amounts.AmateurClubModificationCpf, FeeConstants.Amounts.AmateurClubModificationCpf));
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Amateur Club License Modification Fee", 1, 1, FeeConstants.Amounts.AmateurClubModificationFee, FeeConstants.Amounts.AmateurClubModificationFee));
                return FeeConstants.Formulas.LicenseAmateurClubModification;
            }

            if (isRenewal)
            {
                var lfTotal = clubLfRate * years;
                lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({(isDuplex ? "Duplex" : "Simplex")})", FeeConstants.Codes.LicenseFee, "Amateur Club Station Annual License Fee", years, 1, clubLfRate, lfTotal));
                LicenseCalculationHelper.ApplySurcharge(lineItems, lfTotal, request.ExpirationDate, asOfDate);
                return FeeConstants.Formulas.LicenseAmateurClubRenewal;
            }

            // New Club License
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Amateur Club License Application Filing Fee", 1, 1, FeeConstants.Amounts.AmateurClubFilingFee, FeeConstants.Amounts.AmateurClubFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "Amateur Club Construction Permit Fee", 1, 1, FeeConstants.Amounts.AmateurClubConstructionPermitFee, FeeConstants.Amounts.AmateurClubConstructionPermitFee));
            lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({(isDuplex ? "Duplex" : "Simplex")})", FeeConstants.Codes.LicenseFee, "Amateur Club Station Annual License Fee", years, 1, clubLfRate, clubLfRate * years));
            return FeeConstants.Formulas.LicenseAmateurClubNew;
        }

        // Standard Amateur Radio Station License
        if (isModification)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Amateur License Modification Filing Fee", 1, 1, FeeConstants.Amounts.AmateurLicenseFilingFee, FeeConstants.Amounts.AmateurLicenseFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Amateur License Modification Fee", 1, 1, FeeConstants.Amounts.AmateurLicenseModificationFee, FeeConstants.Amounts.AmateurLicenseModificationFee));
            return FeeConstants.Formulas.LicenseAmateurModification;
        }

        decimal classLfRate = element.SafeContains("Class A") ? FeeConstants.Amounts.AmateurLicenseClassARate :
                              element.SafeContains("Class B") ? FeeConstants.Amounts.AmateurLicenseClassBRate :
                              element.SafeContains("Class C") ? FeeConstants.Amounts.AmateurLicenseClassCRate :
                              element.SafeContains("Class D") ? FeeConstants.Amounts.AmateurLicenseClassDRate :
                              FeeConstants.Amounts.AmateurLicenseClassARate;

        var classLabel = string.IsNullOrWhiteSpace(element) ? "Class A" : element;

        if (isRenewal)
        {
            var lfTotal = classLfRate * years * units;
            lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({classLabel})", FeeConstants.Codes.LicenseFee, $"Amateur Station Annual License Fee ({classLabel})", years, units, classLfRate, lfTotal));
            LicenseCalculationHelper.ApplySurcharge(lineItems, lfTotal, request.ExpirationDate, asOfDate);
            return FeeConstants.Formulas.LicenseAmateurRenewal;
        }

        // New Amateur Station License
        lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Amateur License Application Filing Fee", 1, 1, FeeConstants.Amounts.AmateurLicenseFilingFee, FeeConstants.Amounts.AmateurLicenseFilingFee));
        lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({classLabel})", FeeConstants.Codes.LicenseFee, $"Amateur Station Annual License Fee ({classLabel})", years, units, classLfRate, classLfRate * years * units));
        return FeeConstants.Formulas.LicenseAmateurNew;
    }
}
