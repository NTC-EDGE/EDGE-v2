using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Constants;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations.Strategies;

/// <summary>
/// Dedicated statutory fee calculation strategy for Licenses (e.g., Radio Station Licenses, Dealer Licenses).
/// </summary>
public class LicenseFeeCalculationStrategy : IFeeCalculationStrategy
{
    public const decimal DST_AMOUNT = FeeConstants.Amounts.DocumentaryStampTax;

    public ServiceCategoryType Category => ServiceCategoryType.License;

    public bool CanHandle(ServiceCategoryType? category, string? activity, string? applicationType)
    {
        if (category.HasValue)
        {
            return category.Value == ServiceCategoryType.License;
        }

        return activity.SafeContains("LICENSE") || applicationType.SafeContains("License");
    }

    public FeeCalculationResultDto Calculate(FeeCalculationRequest request)
    {
        var lineItems = new List<CalculatedFeeLineItemDto>();
        var years = Math.Max(1, request.ValidityYears);
        var units = Math.Max(1, request.NoOfUnits);
        var asOfDate = request.AsOfDate ?? DateTime.UtcNow;

        var activity = request.Activity.SafeTrim();
        var appType = request.ApplicationType.SafeTrim();
        var element = request.Element.SafeTrim();

        var isRenewal = appType.SafeContains("RENEWAL");
        var isModification = appType.SafeContains("MODIFICATION");

        // Filing Fee
        lineItems.Add(new CalculatedFeeLineItemDto("Filing Fee", FeeConstants.Codes.FilingFee, "Administrative License Filing Fee", 1, 1, 180.00m, 180.00m));

        decimal licenseRate = FeeConstants.Amounts.DefaultLicenseRate;
        if (!string.IsNullOrWhiteSpace(element))
        {
            // Elemental rate if specified
            lineItems.Add(new CalculatedFeeLineItemDto($"License Fee ({element})", FeeConstants.Codes.License, $"Radio Station / Dealer License Fee ({element})", years, units, licenseRate, licenseRate * years * units));
        }
        else
        {
            lineItems.Add(new CalculatedFeeLineItemDto("License Fee", FeeConstants.Codes.License, "Radio Station / Dealer License Fee", years, units, licenseRate, licenseRate * years * units));
        }

        string formulaApplied;
        if (isRenewal && request.ExpirationDate.HasValue)
        {
            var (multiplier, description) = SurchargeCalculator.CalculateSurchargeTier(request.ExpirationDate.Value, asOfDate);
            if (multiplier > 0)
            {
                var surcharge = (licenseRate * units) * multiplier;
                lineItems.Add(new CalculatedFeeLineItemDto("Surcharge (Late Renewal Penalty)", FeeConstants.Codes.Surcharge, description, 1, 1, surcharge, surcharge, IsSurcharge: true));
            }
            formulaApplied = FeeConstants.Formulas.LicenseRenewal;
        }
        else if (isModification)
        {
            formulaApplied = FeeConstants.Formulas.LicenseModification;
        }
        else
        {
            formulaApplied = FeeConstants.Formulas.LicenseNew;
        }

        // Add DST
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
            Category: ServiceCategoryType.License
        );
    }
}
