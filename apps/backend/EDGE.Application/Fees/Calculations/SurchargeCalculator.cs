using System;

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

        if (daysLate <= 180)
        {
            return (0.50m, "1 day to 6 months late (50% surcharge)");
        }

        if (daysLate <= 365)
        {
            return (1.00m, "6 months to 1 year late (100% surcharge)");
        }

        var excessDays = daysLate - 365;
        var additionalPeriods = (int)Math.Ceiling(excessDays / 180.0);
        var totalMultiplier = 1.00m + (additionalPeriods * 0.50m);

        return (totalMultiplier, $"{daysLate:N0} days late ({totalMultiplier:P0} surcharge)");
    }
}
