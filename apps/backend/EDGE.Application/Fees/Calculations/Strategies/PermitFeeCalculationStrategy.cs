using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations.Strategies;

/// <summary>
/// Dedicated statutory fee calculation strategy for Permits (e.g., Construction Permit, Storage Permit, Import Permit).
/// </summary>
public class PermitFeeCalculationStrategy : IFeeCalculationStrategy
{
    public const decimal DST_AMOUNT = 30.00m;

    public ServiceCategoryType Category => ServiceCategoryType.Permit;

    public bool CanHandle(ServiceCategoryType? category, string? activity, string? applicationType)
    {
        if (category.HasValue)
        {
            return category.Value == ServiceCategoryType.Permit;
        }

        var act = activity ?? string.Empty;
        var app = applicationType ?? string.Empty;

        return act.Contains("PERMIT", StringComparison.OrdinalIgnoreCase)
            || app.Contains("Permit", StringComparison.OrdinalIgnoreCase);
    }

    public FeeCalculationResultDto Calculate(FeeCalculationRequest request)
    {
        var lineItems = new List<CalculatedFeeLineItemDto>();
        var units = Math.Max(1, request.NoOfUnits);

        var activity = (request.Activity ?? string.Empty).Trim();
        var appType = (request.ApplicationType ?? string.Empty).Trim();
        var element = (request.Element ?? string.Empty).Trim();

        // Filing Fee
        lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", "FF", "Permit Filing Fee", 1, 1, 100.00m, 100.00m));

        // Permit Base Fee
        decimal permitRate = 300.00m;
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: string.IsNullOrWhiteSpace(element) ? "Permit Fee" : $"Permit Fee ({element})",
            ItemCode: "PERMIT",
            Description: "Statutory Permit Evaluation Fee",
            ValidityYears: 1,
            NoOfUnits: units,
            FeeRate: permitRate,
            Amount: permitRate * units
        ));

        // DST
        lineItems.Add(new CalculatedFeeLineItemDto("Documentary Stamp Tax (DST)", "DST", "Statutory Documentary Stamp Tax", 1, 1, DST_AMOUNT, DST_AMOUNT, IsTax: true));

        var subTotal = lineItems.Where(li => !li.IsSurcharge && !li.IsTax).Sum(li => li.Amount);
        var taxAmount = lineItems.Where(li => li.IsTax).Sum(li => li.Amount);
        var totalAmount = lineItems.Sum(li => li.Amount);

        return new FeeCalculationResultDto(
            Activity: activity,
            ApplicationType: appType,
            Element: string.IsNullOrWhiteSpace(element) ? null : element,
            FormulaApplied: "FEEPERMIT = FF + (PERMIT)(UNIT) + DST",
            SubTotal: subTotal,
            SurchargeAmount: 0m,
            TaxAmount: taxAmount,
            TotalAmount: totalAmount,
            LineItems: lineItems,
            Category: ServiceCategoryType.Permit
        );
    }
}
