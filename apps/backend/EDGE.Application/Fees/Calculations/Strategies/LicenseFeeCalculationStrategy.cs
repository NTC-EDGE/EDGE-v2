using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations.Strategies;

/// <summary>
/// Dedicated statutory fee calculation strategy for Licenses (e.g., Radio Station Licenses, Dealer Licenses).
/// </summary>
public class LicenseFeeCalculationStrategy : IFeeCalculationStrategy
{
    public const decimal DST_AMOUNT = 30.00m;

    public ServiceCategoryType Category => ServiceCategoryType.License;

    public bool CanHandle(ServiceCategoryType? category, string? activity, string? applicationType)
    {
        if (category.HasValue)
        {
            return category.Value == ServiceCategoryType.License;
        }

        var act = activity ?? string.Empty;
        var app = applicationType ?? string.Empty;

        return act.Contains("LICENSE", StringComparison.OrdinalIgnoreCase)
            || app.Contains("License", StringComparison.OrdinalIgnoreCase);
    }

    public FeeCalculationResultDto Calculate(FeeCalculationRequest request)
    {
        var lineItems = new List<CalculatedFeeLineItemDto>();
        var years = Math.Max(1, request.ValidityYears);
        var units = Math.Max(1, request.NoOfUnits);
        var asOfDate = request.AsOfDate ?? DateTime.UtcNow;

        var activity = (request.Activity ?? string.Empty).Trim();
        var appType = (request.ApplicationType ?? string.Empty).Trim();
        var element = (request.Element ?? string.Empty).Trim();

        var isRenewal = appType.Contains("RENEWAL", StringComparison.OrdinalIgnoreCase);
        var isModification = appType.Contains("MODIFICATION", StringComparison.OrdinalIgnoreCase);

        // Filing Fee
        lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", "FF", "Administrative License Filing Fee", 1, 1, 180.00m, 180.00m));

        decimal licenseRate = 500.00m;
        if (!string.IsNullOrWhiteSpace(element))
        {
            // Elemental rate if specified
            lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({element})", "LIC", $"Radio Station / Dealer License Fee ({element})", years, units, licenseRate, licenseRate * years * units));
        }
        else
        {
            lineItems.Add(new CalculatedFeeLineItemDto("License Fee", "LIC", "Radio Station / Dealer License Fee", years, units, licenseRate, licenseRate * years * units));
        }

        string formulaApplied;
        if (isRenewal && request.ExpirationDate.HasValue)
        {
            var (multiplier, description) = SurchargeCalculator.CalculateSurchargeTier(request.ExpirationDate.Value, asOfDate);
            if (multiplier > 0)
            {
                var surcharge = (licenseRate * units) * multiplier;
                lineItems.Add(new CalculatedFeeLineItemDto("Surcharge (Late Renewal Penalty)", "SUR", description, 1, 1, surcharge, surcharge, IsSurcharge: true));
            }
            formulaApplied = "FEELIC = FF + (LIC)(YR)(UNIT) + DST + SUR";
        }
        else if (isModification)
        {
            formulaApplied = "FEELIC = FF + MOD + DST";
        }
        else
        {
            formulaApplied = "FEELIC = FF + (LIC)(YR)(UNIT) + DST";
        }

        // Add DST
        lineItems.Add(new CalculatedFeeLineItemDto("Documentary Stamp Tax (DST)", "DST", "Statutory Documentary Stamp Tax", 1, 1, DST_AMOUNT, DST_AMOUNT, IsTax: true));

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
            Category: ServiceCategoryType.License
        );
    }
}
