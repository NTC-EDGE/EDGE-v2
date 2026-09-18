using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations.Strategies;

/// <summary>
/// Dedicated statutory fee calculation strategy for Accreditations (Service Centers, Training Providers, Testing Centers).
/// </summary>
public class AccreditationFeeCalculationStrategy : IFeeCalculationStrategy
{
    public const decimal DST_AMOUNT = 30.00m;

    public ServiceCategoryType Category => ServiceCategoryType.Accreditation;

    public bool CanHandle(ServiceCategoryType? category, string? activity, string? applicationType)
    {
        if (category.HasValue)
        {
            return category.Value == ServiceCategoryType.Accreditation;
        }

        var act = activity ?? string.Empty;
        var app = applicationType ?? string.Empty;

        return act.Contains("ACCREDITATION", StringComparison.OrdinalIgnoreCase)
            || app.Contains("Accreditation", StringComparison.OrdinalIgnoreCase);
    }

    public FeeCalculationResultDto Calculate(FeeCalculationRequest request)
    {
        var lineItems = new List<CalculatedFeeLineItemDto>();
        var years = Math.Max(1, request.ValidityYears);
        var asOfDate = request.AsOfDate ?? DateTime.UtcNow;

        var activity = (request.Activity ?? string.Empty).Trim();
        var appType = (request.ApplicationType ?? string.Empty).Trim();
        var element = (request.Element ?? string.Empty).Trim();

        var isRenewal = appType.Contains("RENEWAL", StringComparison.OrdinalIgnoreCase);

        // Filing Fee
        lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", "FF", "Accreditation Filing Fee", 1, 1, 300.00m, 300.00m));

        // Accreditation Fee
        decimal baseRate = 1200.00m;
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: string.IsNullOrWhiteSpace(element) ? "Accreditation Fee" : $"Accreditation Fee ({element})",
            ItemCode: "ACCRED",
            Description: "Annual Accreditation Assessment Fee",
            ValidityYears: years,
            NoOfUnits: 1,
            FeeRate: baseRate,
            Amount: baseRate * years
        ));

        string formulaApplied;
        if (isRenewal && request.ExpirationDate.HasValue)
        {
            var (multiplier, description) = SurchargeCalculator.CalculateSurchargeTier(request.ExpirationDate.Value, asOfDate);
            if (multiplier > 0)
            {
                var surcharge = baseRate * multiplier;
                lineItems.Add(new CalculatedFeeLineItemDto("Surcharge (Late Renewal Penalty)", "SUR", description, 1, 1, surcharge, surcharge, IsSurcharge: true));
            }
            formulaApplied = "FEEACCRED = FF + (ACCRED)(YR) + DST + SUR";
        }
        else
        {
            formulaApplied = "FEEACCRED = FF + (ACCRED)(YR) + DST";
        }

        // DST
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
            Category: ServiceCategoryType.Accreditation
        );
    }
}
