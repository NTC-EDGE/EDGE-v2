using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Application.Fees.Calculations.Strategies;
using EDGE.Domain.Constants;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations;

public class FeeCalculationEngine : IFeeCalculationEngine
{
    private readonly IEnumerable<IFeeCalculationStrategy> _strategies;
    private readonly DefaultFeeCalculationStrategy _defaultStrategy = new();

    public FeeCalculationEngine(IEnumerable<IFeeCalculationStrategy> strategies)
    {
        _strategies = strategies ?? Enumerable.Empty<IFeeCalculationStrategy>();
    }

    public FeeCalculationResultDto Calculate(FeeCalculationRequest request)
    {
        // 1. Try to evaluate dynamic fee configuration from Database if provided
        if ((request.VariantFees != null && request.VariantFees.Count > 0) ||
            (request.ElementFees != null && request.ElementFees.Count > 0))
        {
            var dynamicResult = CalculateDynamicFees(request);
            if (dynamicResult != null)
            {
                return dynamicResult;
            }
        }

        // 2. Try to find specialized strategy matching the exact Service Category or Activity
        var matchingStrategy = _strategies.FirstOrDefault(s =>
            s is not DefaultFeeCalculationStrategy &&
            s.CanHandle(request.Category, request.Activity, request.ApplicationType));

        // 3. Fall back to Default Strategy if no specialized category strategy matches
        var strategy = matchingStrategy ?? _defaultStrategy;

        return strategy.Calculate(request);
    }

    private static FeeCalculationResultDto? CalculateDynamicFees(FeeCalculationRequest request)
    {
        var activeVariantFees = request.VariantFees?
            .Where(vf => vf.IsActive && !vf.IsDeleted)
            .ToList() ?? new List<ServiceVariantFee>();

        var activeElementFees = request.ElementFees?
            .Where(ef => ef.IsActive && !ef.IsDeleted)
            .ToList() ?? new List<ServiceVariantElementFee>();

        if (!string.IsNullOrWhiteSpace(request.Element))
        {
            var trimmedElement = request.Element.Trim();
            var matchedElementFees = activeElementFees
                .Where(ef => ef.Element != null &&
                    (ef.Element.Code.Equals(trimmedElement, StringComparison.OrdinalIgnoreCase) ||
                     ef.Element.Name.Equals(trimmedElement, StringComparison.OrdinalIgnoreCase)))
                .ToList();

            if (matchedElementFees.Count > 0)
            {
                activeElementFees = matchedElementFees;
            }
        }

        if (activeVariantFees.Count == 0 && activeElementFees.Count == 0)
        {
            return null;
        }

        var lineItems = new List<CalculatedFeeLineItemDto>();
        decimal subTotal = 0m;
        decimal surchargeAmount = 0m;
        var formulaExpr = request.FormulaExpression ?? string.Empty;
        var hasMultiYears = FeeConstants.FormulaTokens.HasYears(formulaExpr);
        var hasMultiUnits = FeeConstants.FormulaTokens.HasUnits(formulaExpr);
        var hasMultiChannels = FeeConstants.FormulaTokens.HasChannels(formulaExpr);
        var hasMultiPages = FeeConstants.FormulaTokens.HasPages(formulaExpr);

        // Process combined component fees (Variant and Element levels)
        var allFees = new List<(string FeeName, string FeeCode, string? Description, decimal Amount)>();
        foreach (var vf in activeVariantFees)
        {
            allFees.Add((vf.Fee?.Name ?? vf.Fee?.Code ?? "Statutory Fee", vf.Fee?.Code ?? "FEE", vf.Fee?.Description, vf.Amount));
        }
        foreach (var ef in activeElementFees)
        {
            allFees.Add((ef.Fee?.Name ?? (ef.Element != null ? $"{ef.Element.Name} Fee" : "Element Fee"), ef.Fee?.Code ?? "FEE", ef.Element?.Description ?? ef.Fee?.Description, ef.Amount));
        }

        foreach (var (feeName, feeCode, description, baseRate) in allFees)
        {
            var isDst = feeCode.Equals(FeeConstants.Codes.Dst, StringComparison.OrdinalIgnoreCase);

            int valYears = 1;
            int units = 1;
            int channels = 1;
            int pages = 1;

            if (!isDst)
            {
                if (!string.IsNullOrWhiteSpace(formulaExpr))
                {
                    valYears = hasMultiYears ? Math.Max(1, request.ValidityYears) : 1;
                    units = hasMultiUnits ? Math.Max(1, request.NoOfUnits) : 1;
                    channels = hasMultiChannels ? Math.Max(1, request.NoOfChannels) : 1;
                    pages = hasMultiPages ? Math.Max(1, request.NoOfCopies) : 1;
                }
                else
                {
                    valYears = feeCode.Equals(FeeConstants.Codes.Roc, StringComparison.OrdinalIgnoreCase) ||
                               feeCode.Equals(FeeConstants.Codes.License, StringComparison.OrdinalIgnoreCase) ||
                               feeCode.Equals(FeeConstants.Codes.LicenseFee, StringComparison.OrdinalIgnoreCase)
                               ? Math.Max(1, request.ValidityYears) : 1;
                    units = Math.Max(1, request.NoOfUnits);
                }
            }

            var itemAmount = baseRate * valYears * units * channels * pages;

            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: feeName,
                ItemCode: feeCode,
                Description: description ?? feeName,
                ValidityYears: valYears,
                NoOfUnits: units,
                FeeRate: baseRate,
                Amount: itemAmount,
                IsSurcharge: false,
                IsTax: isDst
            ));

            if (!isDst)
            {
                subTotal += itemAmount;

                if (request.ApplyLateRenewalSurcharge && request.ExpirationDate.HasValue)
                {
                    var asOfDate = request.AsOfDate ?? DateTime.UtcNow;
                    var (surchargeMultiplier, surchargeDesc) = SurchargeCalculator.CalculateSurchargeTier(request.ExpirationDate.Value, asOfDate);
                    if (surchargeMultiplier > 0)
                    {
                        var surAmount = Math.Round(itemAmount * surchargeMultiplier, 2, MidpointRounding.AwayFromZero);
                        surchargeAmount += surAmount;
                        lineItems.Add(new CalculatedFeeLineItemDto(
                            Particular: $"{feeName} Surcharge",
                            ItemCode: FeeConstants.Codes.Surcharge,
                            Description: surchargeDesc,
                            ValidityYears: 1,
                            NoOfUnits: 1,
                            FeeRate: surAmount,
                            Amount: surAmount,
                            IsSurcharge: true
                        ));
                    }
                }
            }
        }

        var taxAmount = lineItems.Where(li => li.IsTax).Sum(li => li.Amount);
        var totalAmount = subTotal + surchargeAmount + taxAmount;
        var formulaApplied = !string.IsNullOrWhiteSpace(formulaExpr) ? formulaExpr : "STATUTORY_DYNAMIC";

        return new FeeCalculationResultDto(
            Activity: request.Activity,
            ApplicationType: request.ApplicationType,
            Element: request.Element,
            FormulaApplied: formulaApplied,
            SubTotal: subTotal,
            SurchargeAmount: surchargeAmount,
            TaxAmount: taxAmount,
            TotalAmount: totalAmount,
            LineItems: lineItems,
            Category: request.Category
        );
    }
}
