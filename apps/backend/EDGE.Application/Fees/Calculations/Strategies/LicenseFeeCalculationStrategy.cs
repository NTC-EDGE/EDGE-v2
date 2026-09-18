using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Application.Fees.Calculations.Strategies.Licenses;
using EDGE.Domain.Constants;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations.Strategies;

/// <summary>
/// Dedicated statutory fee calculation strategy for Licenses (Radio Station Licenses, Maritime, Aeronautical, FLM, TVRO/CATV, and Copies).
/// Coordinates specialized sub-category calculators adhering to the Single Responsibility Principle.
/// </summary>
public class LicenseFeeCalculationStrategy : IFeeCalculationStrategy
{
    public const decimal DST_AMOUNT = FeeConstants.Amounts.DocumentaryStampTax;

    private readonly IReadOnlyList<ILicenseSubCategoryCalculator> _subCalculators;
    private readonly ILicenseSubCategoryCalculator _defaultSubCalculator;

    public LicenseFeeCalculationStrategy()
    {
        _subCalculators = new List<ILicenseSubCategoryCalculator>
        {
            new LicenseCopySubCalculator(),
            new TvroCatvLicenseSubCalculator(),
            new AmateurLicenseSubCalculator(),
            new AeronauticalLicenseSubCalculator(),
            new MaritimeLicenseSubCalculator(),
            new OtherRadioStationLicenseSubCalculator(),
            new FixedAndLandMobileLicenseSubCalculator()
        };
        _defaultSubCalculator = new DefaultLicenseSubCalculator();
    }

    public LicenseFeeCalculationStrategy(IEnumerable<ILicenseSubCategoryCalculator> subCalculators)
    {
        _subCalculators = subCalculators.ToList();
        _defaultSubCalculator = new DefaultLicenseSubCalculator();
    }

    public ServiceCategoryType Category => ServiceCategoryType.License;

    public bool CanHandle(ServiceCategoryType? category, string? activity, string? applicationType)
    {
        if (category.HasValue)
        {
            return category.Value == ServiceCategoryType.License;
        }

        return activity.SafeContains("LICENSE") ||
               applicationType.SafeContains("License") ||
               activity.SafeContains("TVRO") ||
               activity.SafeContains("CATV") ||
               activity.SafeContains("COPY OF LICENSES");
    }

    public FeeCalculationResultDto Calculate(FeeCalculationRequest request)
    {
        var lineItems = new List<CalculatedFeeLineItemDto>();
        var years = Math.Max(1, request.ValidityYears);
        var units = Math.Max(1, request.NoOfUnits);
        var copies = Math.Max(1, request.NoOfCopies);
        var channels = Math.Max(1, request.NoOfChannels);
        var asOfDate = request.AsOfDate ?? DateTime.UtcNow;

        var activity = request.Activity.SafeTrim();
        var appType = request.ApplicationType.SafeTrim();
        var element = request.Element.SafeTrim();

        var calculator = _subCalculators.FirstOrDefault(c => c.CanHandle(activity, appType)) ?? _defaultSubCalculator;
        var formulaApplied = calculator.Calculate(lineItems, request, years, units, copies, channels, asOfDate);

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
