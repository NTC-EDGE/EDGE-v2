using System;
using System.Collections.Generic;
using EDGE.Domain.Constants;

namespace EDGE.Application.Fees.Calculations.Strategies.Licenses;

public class OtherRadioStationLicenseSubCalculator : ILicenseSubCategoryCalculator
{
    public bool CanHandle(string activity, string applicationType)
    {
        return activity.SafeContains("OTHER RADIO") ||
               applicationType.SafeContains("Microwave") ||
               applicationType.SafeContains("VSAT") ||
               applicationType.SafeContains("Public Trunked") ||
               applicationType.SafeContains("BWA") ||
               applicationType.SafeContains("BTS");
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
        var isRenewal = appType.SafeContains("RENEWAL");
        var isModification = appType.SafeContains("MODIFICATION");

        if (appType.SafeContains("BTS") && isModification)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "BTS Modification Filing Fee", 1, 1, FeeConstants.Amounts.FlmFilingFee, FeeConstants.Amounts.FlmFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "BTS Construction Permit Fee per Channel", 1, channels, FeeConstants.Amounts.OtherBtsCpf, FeeConstants.Amounts.OtherBtsCpf * channels));
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "BTS Modification Fee", 1, 1, FeeConstants.Amounts.FlmModificationFee, FeeConstants.Amounts.FlmModificationFee));
            return FeeConstants.Formulas.LicenseOtherBtsModification;
        }

        decimal lfRate = appType.SafeContains("Microwave") ? FeeConstants.Amounts.OtherMicrowaveLf :
                         appType.SafeContains("VSAT") ? FeeConstants.Amounts.OtherVsatLf :
                         appType.SafeContains("Public Trunked") ? FeeConstants.Amounts.OtherTrunkedLf :
                         appType.SafeContains("BWA") ? FeeConstants.Amounts.OtherBwaLf :
                         appType.SafeContains("WDN") ? FeeConstants.Amounts.OtherWdnLf :
                         appType.SafeContains("BTS") ? FeeConstants.Amounts.OtherBtsLf :
                         FeeConstants.Amounts.OtherMicrowaveLf;

        decimal ifRate = appType.SafeContains("Microwave") ? FeeConstants.Amounts.OtherMicrowaveIf :
                         appType.SafeContains("VSAT") ? FeeConstants.Amounts.OtherVsatIf :
                         appType.SafeContains("Public Trunked") ? FeeConstants.Amounts.OtherTrunkedIf :
                         appType.SafeContains("BWA") ? FeeConstants.Amounts.OtherBwaIf :
                         appType.SafeContains("WDN") ? FeeConstants.Amounts.OtherWdnIf :
                         appType.SafeContains("BTS") ? FeeConstants.Amounts.OtherBtsIf :
                         FeeConstants.Amounts.OtherMicrowaveIf;

        var lfTotal = lfRate * channels * units * years;
        lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "Radio Station Annual License Fee per Channel/Unit", years, channels * units, lfRate, lfTotal));
        lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "Radio Station Annual Inspection Fee per Channel/Unit", years, channels * units, ifRate, ifRate * channels * units * years));

        if (isRenewal)
        {
            LicenseCalculationHelper.ApplySurcharge(lineItems, lfTotal, request.ExpirationDate, asOfDate);
        }

        return FeeConstants.Formulas.LicenseOtherRenewal;
    }
}
