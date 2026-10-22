using System;
using System.Collections.Generic;
using EDGE.Domain.Constants;

namespace EDGE.Application.Fees.Calculations.Strategies.Licenses;

public class LicenseCopySubCalculator : ILicenseSubCategoryCalculator
{
    public bool CanHandle(string activity, string applicationType)
    {
        return activity.SafeContains("COPY OF LICENSES") ||
               applicationType.SafeContains("Copy of License") ||
               applicationType.SafeContains("Certified True Copy") ||
               applicationType.SafeContains("Duplicate Copy");
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

        if (appType.SafeContains("Certified True Copy") || appType.SafeContains("CTC"))
        {
            lineItems.Add(new CalculatedFeeLineItemDto("Certified True Copy (First Page)", FeeConstants.Codes.FirstCopy, "First copy authentication fee", 1, 1, FeeConstants.Amounts.PermitCertifiedTrueCopyFirstPage, FeeConstants.Amounts.PermitCertifiedTrueCopyFirstPage));
            if (copies > 1)
            {
                var extraCopies = copies - 1;
                lineItems.Add(new CalculatedFeeLineItemDto("Certified True Copy (Succeeding Pages)", FeeConstants.Codes.SucceedingCopies, "Succeeding copies authentication fee", 1, extraCopies, FeeConstants.Amounts.PermitCertifiedTrueCopySucceedingPage, FeeConstants.Amounts.PermitCertifiedTrueCopySucceedingPage * extraCopies));
            }
            return FeeConstants.Formulas.LicenseCertifiedTrueCopy;
        }

        // Duplicate Copy
        lineItems.Add(new CalculatedFeeLineItemDto("Duplicate License Copy", FeeConstants.Codes.Duplicate, "Statutory Duplicate Copy Issuance Fee", 1, 1, FeeConstants.Amounts.DuplicateCopyRate, FeeConstants.Amounts.DuplicateCopyRate));
        return FeeConstants.Formulas.LicenseDuplicateCopy;
    }
}
