using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations.Strategies;

/// <summary>
/// Dedicated statutory fee calculation strategy for Exams (Radio Operator Examination, Special Exams).
/// </summary>
public class ExamFeeCalculationStrategy : IFeeCalculationStrategy
{
    public const decimal DST_AMOUNT = 30.00m;

    public ServiceCategoryType Category => ServiceCategoryType.Exam;

    public bool CanHandle(ServiceCategoryType? category, string? activity, string? applicationType)
    {
        if (category.HasValue)
        {
            return category.Value == ServiceCategoryType.Exam;
        }

        var act = activity ?? string.Empty;
        var app = applicationType ?? string.Empty;

        return act.Contains("EXAM", StringComparison.OrdinalIgnoreCase)
            || app.Contains("Exam", StringComparison.OrdinalIgnoreCase);
    }

    public FeeCalculationResultDto Calculate(FeeCalculationRequest request)
    {
        var lineItems = new List<CalculatedFeeLineItemDto>();
        var activity = (request.Activity ?? string.Empty).Trim();
        var appType = (request.ApplicationType ?? string.Empty).Trim();
        var element = (request.Element ?? string.Empty).Trim();

        // Application Fee
        lineItems.Add(new CalculatedFeeLineItemDto("Application Fee", "AF", "Examination Admission Application Fee", 1, 1, 50.00m, 50.00m));

        // Examination Fee
        decimal examRate = 100.00m;
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: string.IsNullOrWhiteSpace(element) ? "Examination Fee" : $"Examination Fee ({element})",
            ItemCode: "EXAM",
            Description: "Radio Operator Examination Fee",
            ValidityYears: 1,
            NoOfUnits: 1,
            FeeRate: examRate,
            Amount: examRate
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
            FormulaApplied: "FEEEXAM = AF + EXAM + DST",
            SubTotal: subTotal,
            SurchargeAmount: 0m,
            TaxAmount: taxAmount,
            TotalAmount: totalAmount,
            LineItems: lineItems,
            Category: ServiceCategoryType.Exam
        );
    }
}
