using System;
using System.Collections.Generic;
using EDGE.Domain.Constants;

namespace EDGE.Application.Fees.Calculations.Strategies.Licenses;

public class TvroCatvLicenseSubCalculator : ILicenseSubCategoryCalculator
{
    public bool CanHandle(string activity, string applicationType)
    {
        return activity.SafeContains("TVRO") ||
               activity.SafeContains("CATV") ||
               applicationType.SafeContains("TVRO") ||
               applicationType.SafeContains("CATV");
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
        var isCatv = appType.SafeContains("CATV");

        if (isCatv)
        {
            if (isModification)
            {
                lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "CATV License Modification Fee", 1, 1, FeeConstants.Amounts.CatvModificationFee, FeeConstants.Amounts.CatvModificationFee));
                return FeeConstants.Formulas.LicenseCatvModification;
            }

            if (isRenewal)
            {
                var lfTotal = FeeConstants.Amounts.CatvLicenseFee * years;
                lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "CATV Station Annual License Fee", years, 1, FeeConstants.Amounts.CatvLicenseFee, lfTotal));
                lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "CATV Station Annual Inspection Fee", years, 1, FeeConstants.Amounts.CatvInspectionFee, FeeConstants.Amounts.CatvInspectionFee * years));

                LicenseCalculationHelper.ApplySurcharge(lineItems, lfTotal, request.ExpirationDate, asOfDate);
                return FeeConstants.Formulas.LicenseCatvRenewal;
            }

            // New CATV
            lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "CATV License Application Filing Fee", 1, 1, FeeConstants.Amounts.CatvFilingFee, FeeConstants.Amounts.CatvFilingFee));
            lineItems.Add(new CalculatedFeeLineItemDto("Construction Permit Fee", FeeConstants.Codes.ConstructionPermit, "CATV Station Construction Permit Fee", 1, 1, FeeConstants.Amounts.CatvConstructionPermitFee, FeeConstants.Amounts.CatvConstructionPermitFee));
            lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "CATV Station Annual License Fee", years, 1, FeeConstants.Amounts.CatvLicenseFee, FeeConstants.Amounts.CatvLicenseFee * years));
            lineItems.Add(new CalculatedFeeLineItemDto("Inspection Fee", FeeConstants.Codes.InspectionFee, "CATV Station Annual Inspection Fee", years, 1, FeeConstants.Amounts.CatvInspectionFee, FeeConstants.Amounts.CatvInspectionFee * years));
            return FeeConstants.Formulas.LicenseCatvNew;
        }

        // TVRO Station License
        if (isModification)
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Modification Fee", FeeConstants.Codes.Modification, "TVRO License Modification Fee", 1, 1, FeeConstants.Amounts.TvroModificationFee, FeeConstants.Amounts.TvroModificationFee));
            return FeeConstants.Formulas.LicenseTvroModification;
        }

        if (isRenewal)
        {
            var lfTotal = FeeConstants.Amounts.TvroLicenseFee * years;
            lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "TVRO Station Annual License Fee", years, 1, FeeConstants.Amounts.TvroLicenseFee, lfTotal));
            LicenseCalculationHelper.ApplySurcharge(lineItems, lfTotal, request.ExpirationDate, asOfDate);
            return FeeConstants.Formulas.LicenseTvroRenewal;
        }

        // New TVRO
        lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.LicenseFee, "TVRO Station Annual License Fee", years, 1, FeeConstants.Amounts.TvroLicenseFee, FeeConstants.Amounts.TvroLicenseFee * years));
        return FeeConstants.Formulas.LicenseTvroNew;
    }
}
