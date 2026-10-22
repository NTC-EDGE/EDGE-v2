using System;
using System.Collections.Generic;
using EDGE.Domain.Constants;

namespace EDGE.Application.Fees.Calculations.Strategies.Licenses;

public enum LicensePowerTier
{
    High,
    Medium,
    Low
}

public static class LicenseCalculationHelper
{
    public static LicensePowerTier ResolvePowerTier(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return LicensePowerTier.High;

        var upper = text.ToUpperInvariant();

        // 1. Check High first (>100W, HIGH, ABOVE 100W)
        if (upper.Contains("HIGH") || upper.Contains(">100") || upper.Contains("> 100") || upper.Contains("ABOVE 100"))
            return LicensePowerTier.High;

        // 2. Check Medium (25W-100W, 25W UP TO 100W, MEDIUM, ABOVE 25W)
        if (upper.Contains("MEDIUM") || upper.Contains("25W-100W") || upper.Contains("25W - 100W") || upper.Contains("25W UP TO 100W") || upper.Contains("ABOVE 25W"))
            return LicensePowerTier.Medium;

        // 3. Check Low (25W & BELOW, LOW, <=25W)
        if (upper.Contains("LOW") || upper.Contains("BELOW") || upper.Contains("<=25W") || upper.Contains("25W AND BELOW") || upper.Contains("25W & BELOW"))
            return LicensePowerTier.Low;

        return LicensePowerTier.High;
    }

    public static void ApplySurcharge(List<CalculatedFeeLineItemDto> lineItems, decimal baseAmount, DateTime? expirationDate, DateTime asOfDate)
    {
        if (!expirationDate.HasValue)
            return;

        var (multiplier, description) = SurchargeCalculator.CalculateSurchargeTier(expirationDate.Value, asOfDate);
        if (multiplier > 0)
        {
            var surcharge = baseAmount * multiplier;
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Surcharge (Late Renewal Penalty)",
                ItemCode: FeeConstants.Codes.Surcharge,
                Description: description,
                ValidityYears: 1,
                NoOfUnits: 1,
                FeeRate: surcharge,
                Amount: surcharge,
                IsSurcharge: true
            ));
        }
    }
}
