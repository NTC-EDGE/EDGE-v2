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

        // Application Fee
        lineItems.Add(new CalculatedFeeLineItemDto("Application Fee", FeeConstants.Codes.ApplicationFee, "Examination Admission Application Fee", 1, 1, 50.00m, 50.00m));

        // Examination Fee
        decimal examRate = FeeConstants.Amounts.DefaultExamRate;
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: string.IsNullOrWhiteSpace(element) ? "Examination Fee" : $"Examination Fee ({element})",
            ItemCode: FeeConstants.Codes.Exam,
            Description: "Radio Operator Examination Fee",
            ValidityYears: 1,
            NoOfUnits: 1,
            FeeRate: examRate,
            Amount: examRate
        ));

        // DST
        lineItems.Add(new CalculatedFeeLineItemDto("Documentary Stamp Tax (DST)", FeeConstants.Codes.Dst, "Statutory Documentary Stamp Tax", 1, 1, DST_AMOUNT, DST_AMOUNT, IsTax: true));

        var subTotal = lineItems.Where(li => !li.IsSurcharge && !li.IsTax).Sum(li => li.Amount);
        var taxAmount = lineItems.Where(li => li.IsTax).Sum(li => li.Amount);
        var totalAmount = lineItems.Sum(li => li.Amount);

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
