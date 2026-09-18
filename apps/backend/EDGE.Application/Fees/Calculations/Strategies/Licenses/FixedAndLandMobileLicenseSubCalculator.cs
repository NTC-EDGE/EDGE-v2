using System;
using System.Collections.Generic;
using EDGE.Domain.Constants;

namespace EDGE.Application.Fees.Calculations.Strategies.Licenses;

public class FixedAndLandMobileLicenseSubCalculator : ILicenseSubCategoryCalculator
{
    public bool CanHandle(string activity, string applicationType)
    {
        return activity.SafeContains("FIXED AND LAND MOBILE") ||
               activity.SafeContains("FLM") ||
               applicationType.SafeContains("Radio Station License");
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

        var isPortable = element.SafeContains("PORTABLE") || element.SafeContains("(P)") || element.SafeContains(" P ");
        var isRepeater = element.SafeContains("REPEATER") || element.SafeContains("(RT)");
        var isLandBase = element.SafeContains("LAND BASE") || element.SafeContains("(FB)");
        var isLandMobile = element.SafeContains("LAND MOBILE") || element.SafeContains("(ML)");
        var isFixed = !isPortable && !isRepeater && !isLandBase && !isLandMobile; // Default FX

        var isDuplex = element.SafeContains("DUPLEX");
        var isWdn = element.SafeContains("WDN") || element.SafeContains("WIRELESS DATA NETWORK");
        var powerTier = LicenseCalculationHelper.ResolvePowerTier(element);

        // Resolve CPF Rate (0 for Portable, 600 for Repeater, 240 for other station types)
        decimal cpfRate = isPortable ? 0m : (isRepeater ? FeeConstants.Amounts.FlmCpfRepeater : FeeConstants.Amounts.FlmCpfStandard);

        // Resolve LF Rate & IF Rate
        decimal lfRate, ifRate;
        if (isWdn)
        {
            lfRate = isFixed ? 480.00m : 240.00m;
            ifRate = isFixed ? 480.00m : 240.00m;
        }
        else if (isDuplex)
        {
            if (isRepeater)
            {
                lfRate = 1320.00m;
                ifRate = 480.00m;
            }
            else if (isFixed)
            {
                lfRate = powerTier == LicensePowerTier.High ? 1200.00m : (powerTier == LicensePowerTier.Medium ? 960.00m : 720.00m);
                ifRate = 480.00m;
            }
            else if (isLandBase)
            {
                lfRate = powerTier == LicensePowerTier.High ? 1440.00m : (powerTier == LicensePowerTier.Medium ? 1200.00m : 960.00m);
                ifRate = 480.00m;
            }
            else if (isLandMobile)
            {
                lfRate = powerTier == LicensePowerTier.High ? 960.00m : (powerTier == LicensePowerTier.Medium ? 720.00m : 960.00m);
                ifRate = powerTier == LicensePowerTier.Low ? 480.00m : 240.00m;
            }
            else // Portable
            {
                lfRate = powerTier == LicensePowerTier.High ? 960.00m : 480.00m;
                ifRate = 240.00m;
            }
        }
        else // Simplex
        {
            if (isFixed)
            {
                lfRate = powerTier == LicensePowerTier.High ? 600.00m : (powerTier == LicensePowerTier.Medium ? 480.00m : 360.00m);
                ifRate = 480.00m;
            }
            else if (isLandBase)
            {
                lfRate = powerTier == LicensePowerTier.High ? 720.00m : (powerTier == LicensePowerTier.Medium ? 600.00m : 480.00m);
                ifRate = 480.00m;
            }
            else if (isLandMobile)
            {
                lfRate = powerTier == LicensePowerTier.High ? 480.00m : (powerTier == LicensePowerTier.Medium ? 360.00m : 240.00m);
                ifRate = powerTier == LicensePowerTier.High ? 480.00m : 240.00m;
            }
            else // Portable
            {
                lfRate = powerTier == LicensePowerTier.High ? 480.00m : (powerTier == LicensePowerTier.Medium ? 360.00m : 240.00m);
                ifRate = 240.00m;
            }
        }

        if (isModification)
        {
            if (isPortable)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Portable Station Modification Fee", 1, units, FeeConstants.Amounts.FlmModificationFee, FeeConstants.Amounts.FlmModificationFee * units));
                return FeeConstants.Formulas.LicenseFlmPortableModification;
            }

            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Station Modification Filing Fee", 1, units, FeeConstants.Amounts.FlmFilingFee, FeeConstants.Amounts.FlmFilingFee * units));
            lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "Station Construction Permit Fee", 1, units, cpfRate, cpfRate * units));
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "Station Modification Fee", 1, units, FeeConstants.Amounts.FlmModificationFee, FeeConstants.Amounts.FlmModificationFee * units));
            return FeeConstants.Formulas.LicenseFlmModification;
        }

        if (isRenewal)
        {
            var lfTotal = lfRate * channels * units * years;
            lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "Radio Station Annual License Fee per Channel/Unit", years, channels * units, lfRate, lfTotal));
            lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Radio Station Annual Inspection Fee per Unit", years, units, ifRate, ifRate * units * years));
            LicenseCalculationHelper.ApplySurcharge(lineItems, lfTotal, request.ExpirationDate, asOfDate);
            return FeeConstants.Formulas.LicenseFlmRenewal;
        }

        // New FLM License
        if (cpfRate > 0)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "Radio Station Construction Permit Fee per Unit", 1, units, cpfRate, cpfRate * units));
        }
        lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "Radio Station Annual License Fee per Channel/Unit", years, channels * units, lfRate, lfRate * channels * units * years));
        lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Radio Station Annual Inspection Fee per Unit", years, units, ifRate, ifRate * units * years));
        return FeeConstants.Formulas.LicenseFlmNew;
    }
}
