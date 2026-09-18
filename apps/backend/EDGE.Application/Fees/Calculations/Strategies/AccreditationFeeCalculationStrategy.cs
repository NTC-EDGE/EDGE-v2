using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Constants;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations.Strategies;

/// <summary>
/// Dedicated statutory fee calculation strategy for Accreditations (Service Centers, Training Providers, Testing Centers).
/// </summary>
public class AccreditationFeeCalculationStrategy : IFeeCalculationStrategy
{
    public const decimal DST_AMOUNT = FeeConstants.Amounts.DocumentaryStampTax;

    public ServiceCategoryType Category => ServiceCategoryType.Accreditation;

    public bool CanHandle(ServiceCategoryType? category, string? activity, string? applicationType)
    {
        if (category.HasValue)
        {
            return category.Value == ServiceCategoryType.Accreditation;
        }

        return activity.SafeContains("ACCREDITATION") || applicationType.SafeContains("Accreditation");
    }

    public FeeCalculationResultDto Calculate(FeeCalculationRequest request)
    {
        var lineItems = new List<CalculatedFeeLineItemDto>();
        var years = Math.Max(1, request.ValidityYears);
        var asOfDate = request.AsOfDate ?? DateTime.UtcNow;

        var activity = request.Activity.SafeTrim();
        var appType = request.ApplicationType.SafeTrim();
        var element = request.Element.SafeTrim();

        var isRenewal = appType.SafeContains("RENEWAL");

        // Filing Fee
        lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Accreditation Filing Fee", 1, 1, 300.00m, 300.00m));

        // Accreditation Fee
        decimal baseRate = FeeConstants.Amounts.DefaultAccreditationRate;
        lineItems.Add(new CalculatedFeeLineItemDto(
            Particular: string.IsNullOrWhiteSpace(element) ? "Accreditation Fee" : $"Accreditation Fee ({element})",
            ItemCode: FeeConstants.Codes.Accreditation,
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
                lineItems.Add(new CalculatedFeeLineItemDto("Surcharge (Late Renewal Penalty)", FeeConstants.Codes.Surcharge, description, 1, 1, surcharge, surcharge, IsSurcharge: true));
            }
            formulaApplied = FeeConstants.Formulas.AccreditationRenewal;
        }
        else
        {
            formulaApplied = FeeConstants.Formulas.AccreditationNew;
        }

        // DST
        lineItems.Add(new CalculatedFeeLineItemDto("Documentary Stamp Tax (DST)", FeeConstants.Codes.Dst, "Statutory Documentary Stamp Tax", 1, 1, DST_AMOUNT, DST_AMOUNT, IsTax: true));

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
