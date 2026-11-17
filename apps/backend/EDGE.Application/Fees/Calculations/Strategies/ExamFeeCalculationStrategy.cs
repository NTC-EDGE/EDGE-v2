using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Constants;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations.Strategies;

/// <summary>
/// Dedicated statutory fee calculation strategy for Exams (Radio Operator Examination, Special Exams).
/// </summary>
public class ExamFeeCalculationStrategy : IFeeCalculationStrategy
{
    public const decimal DST_AMOUNT = FeeConstants.Amounts.DocumentaryStampTax;

    public ServiceCategoryType Category => ServiceCategoryType.Exam;

    public bool CanHandle(ServiceCategoryType? category, string? activity, string? applicationType)
    {
        if (category.HasValue)
        {
            return category.Value == ServiceCategoryType.Exam;
        }

        return activity.SafeContains("EXAM") || applicationType.SafeContains("Exam");
    }

    public FeeCalculationResultDto Calculate(FeeCalculationRequest request)
    {
        var lineItems = new List<CalculatedFeeLineItemDto>();
        var activity = request.Activity.SafeTrim();
        var appType = request.ApplicationType.SafeTrim();
        var element = request.Element.SafeTrim();

        // Examination Fee (FEEEXAM = EXAMFEE) — Uses validity years only if explicitly provided from Form Builder (request.ValidityYears > 0)
        var units = Math.Max(1, request.NoOfUnits);
        var valYears = request.ValidityYears > 0 ? request.ValidityYears : 0;
        var yearMultiplier = valYears > 0 ? valYears : 1;
        decimal examRate = FeeConstants.Amounts.DefaultExamRate;
        decimal examAmount = examRate * yearMultiplier * units;
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: string.IsNullOrWhiteSpace(element) ? "Examination Fee" : $"Examination Fee ({element})",
            ItemCode: FeeConstants.Codes.Exam,
            Description: "Radio Operator Examination Fee",
            ValidityYears: valYears,
            NoOfUnits: units,
            FeeRate: examRate,
            Amount: examAmount
        ));

        var subTotal = examAmount;
        var taxAmount = 0m;
        var totalAmount = examAmount;

        return new FeeCalculationResultDto(
            Activity: activity,
            ApplicationType: appType,
            Element: string.IsNullOrWhiteSpace(element) ? null : element,
            FormulaApplied: FeeConstants.Formulas.ExamStandard,
            SubTotal: subTotal,
            SurchargeAmount: 0m,
            TaxAmount: taxAmount,
            TotalAmount: totalAmount,
            LineItems: lineItems,
            Category: ServiceCategoryType.Exam
        );
    }
}
