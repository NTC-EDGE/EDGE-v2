using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations.Strategies;

/// <summary>
/// Dedicated statutory fee calculation strategy for Requests and Complaints (Certifications, Verifications, Special Filings).
/// </summary>
public class RequestsAndComplaintsFeeCalculationStrategy : IFeeCalculationStrategy
{
    public const decimal DST_AMOUNT = 30.00m;

    public ServiceCategoryType Category => ServiceCategoryType.RequestsAndComplaints;

    public bool CanHandle(ServiceCategoryType? category, string? activity, string? applicationType)
    {
        if (category.HasValue)
        {
            return category.Value == ServiceCategoryType.RequestsAndComplaints;
        }

        var act = activity ?? string.Empty;
        var app = applicationType ?? string.Empty;

        return act.Contains("REQUEST", StringComparison.OrdinalIgnoreCase)
            || act.Contains("COMPLAINT", StringComparison.OrdinalIgnoreCase)
            || app.Contains("Request", StringComparison.OrdinalIgnoreCase)
            || app.Contains("Complaint", StringComparison.OrdinalIgnoreCase);
    }

    public FeeCalculationResultDto Calculate(FeeCalculationRequest request)
    {
        var lineItems = new List<CalculatedFeeLineItemDto>();
        var activity = (request.Activity ?? string.Empty).Trim();
        var appType = (request.ApplicationType ?? string.Empty).Trim();
        var element = (request.Element ?? string.Empty).Trim();

        // Filing / Processing Fee
        decimal feeRate = 150.00m;
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: string.IsNullOrWhiteSpace(element) ? "Processing Fee" : $"Processing Fee ({element})",
            ItemCode: "REQ_FEE",
            Description: "Special Request / Administrative Processing Fee",
            ValidityYears: 1,
            NoOfUnits: 1,
            FeeRate: feeRate,
            Amount: feeRate
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
            FormulaApplied: "FEEREQ = REQ_FEE + DST",
            SubTotal: subTotal,
            SurchargeAmount: 0m,
            TaxAmount: taxAmount,
            TotalAmount: totalAmount,
            LineItems: lineItems,
            Category: ServiceCategoryType.RequestsAndComplaints
        );
    }
}
