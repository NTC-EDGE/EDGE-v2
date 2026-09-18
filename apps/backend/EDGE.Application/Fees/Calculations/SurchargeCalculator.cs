using System;
using EDGE.Domain.Constants;

namespace EDGE.Application.Fees.Calculations;

public static class SurchargeCalculator
{
    /// <summary>
    /// Computes statutory NTC late renewal surcharge multiplier and description.
    /// - 0% if filed on or before expiration date
    /// - 50% if filed 1 day to 6 months (180 days) after expiration
    /// - 100% if filed 6 months + 1 day to 1 year (365 days) after expiration
    /// - +50% for every additional 6 months (180 days) delay thereafter
    /// </summary>
    public static (decimal RateMultiplier, string Description) CalculateSurchargeTier(DateTime expirationDate, DateTime asOfDate)
    {
        if (asOfDate.Date <= expirationDate.Date)
        {
            return (0m, "On time (No surcharge)");
        }

        var daysLate = (asOfDate.Date - expirationDate.Date).TotalDays;
        if (daysLate <= 0)
        {
            return (0m, "On time (No surcharge)");
        }

        if (daysLate <= FeeConstants.Surcharges.Tier1Days)
        {
            return (FeeConstants.Surcharges.Tier1Multiplier, $"1 day to 6 months late ({FeeConstants.Surcharges.Tier1Multiplier:P0} surcharge)");
        }

        if (daysLate <= FeeConstants.Surcharges.Tier2Days)
        {
            return (FeeConstants.Surcharges.Tier2Multiplier, $"6 months to 1 year late ({FeeConstants.Surcharges.Tier2Multiplier:P0} surcharge)");
        }

        var excessDays = daysLate - FeeConstants.Surcharges.Tier2Days;
        var additionalPeriods = (int)Math.Ceiling(excessDays / FeeConstants.Surcharges.ExcessBlockDays);
        var totalMultiplier = FeeConstants.Surcharges.Tier2Multiplier + (additionalPeriods * FeeConstants.Surcharges.ExcessStepMultiplier);

        return (totalMultiplier, $"{daysLate:N0} days late ({totalMultiplier:P0} surcharge)");
    }
}
