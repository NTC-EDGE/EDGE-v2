using System;
using System.Collections.Generic;
using EDGE.Domain.Constants;

namespace EDGE.Application.Fees.Calculations.Strategies.Licenses;

public class DefaultLicenseSubCalculator : ILicenseSubCategoryCalculator
{
    public bool CanHandle(string activity, string applicationType)
    {
        return true; // Fallback calculator
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

        if (isModification)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "License Modification Filing Fee", 1, 1, FeeConstants.Amounts.LicenseFilingFee, FeeConstants.Amounts.LicenseFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "License Modification Fee", 1, 1, FeeConstants.Amounts.CertificateModification, FeeConstants.Amounts.CertificateModification));
            return FeeConstants.Formulas.LicenseModification;
        }

        var licenseRate = FeeConstants.Amounts.DefaultLicenseRate;
        var lfTotal = licenseRate * years * units;

        lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "License Application Filing Fee", 1, 1, FeeConstants.Amounts.LicenseFilingFee, FeeConstants.Amounts.LicenseFilingFee));
        lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "Radio Station Annual License Fee", years, units, licenseRate, lfTotal));

        if (isRenewal)
        {
            LicenseCalculationHelper.ApplySurcharge(lineItems, lfTotal, request.ExpirationDate, asOfDate);
            return FeeConstants.Formulas.LicenseRenewal;
        }

        return FeeConstants.Formulas.LicenseNew;
    }
}
