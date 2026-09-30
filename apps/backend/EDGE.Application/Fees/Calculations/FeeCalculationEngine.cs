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
        var hasDst = false;
        decimal dstAmount = 30.00m;
        var formulas = new List<string>();

        // 1. Process Variant-level Fees
        foreach (var vf in activeVariantFees)
        {
            var feeName = vf.Fee?.Name ?? vf.Fee?.Code ?? "Statutory Fee";
            var feeCode = vf.Fee?.Code ?? "FEE";
            var baseRate = vf.Amount;

            var itemAmount = vf.CalculationMode == FeeCalculationMode.CustomFormula && !string.IsNullOrWhiteSpace(vf.CalculationFormula)
                ? DynamicFeeFormulaEvaluator.Evaluate(
                    vf.CalculationFormula,
                    baseRate,
                    request.ValidityYears,
                    request.NoOfUnits,
                    request.NoOfChannels,
                    request.NoOfCopies,
                    request.AdditionalServicesCount,
                    vf.DstAmount)
                : DynamicFeeFormulaEvaluator.CalculateStandardMultiplier(
                    baseRate,
                    vf.MultiplyByValidityYears,
                    request.ValidityYears,
                    vf.MultiplyByUnits,
                    request.NoOfUnits,
                    vf.MultiplyByChannels,
                    request.NoOfChannels,
                    vf.MultiplyByPages,
                    request.NoOfCopies);

            var valYears = vf.MultiplyByValidityYears ? Math.Max(1, request.ValidityYears) : 1;
            var units = vf.MultiplyByUnits ? Math.Max(1, request.NoOfUnits) : 1;

            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: feeName,
                ItemCode: feeCode,
                Description: vf.Fee?.Description ?? feeName,
                ValidityYears: valYears,
                NoOfUnits: units,
                FeeRate: baseRate,
                Amount: itemAmount,
                IsSurcharge: false,
                IsTax: feeCode.Equals(FeeConstants.Codes.Dst, StringComparison.OrdinalIgnoreCase)
            ));

            if (!feeCode.Equals(FeeConstants.Codes.Dst, StringComparison.OrdinalIgnoreCase))
            {
                subTotal += itemAmount;
            }

            if (vf.IncludeDst)
            {
                hasDst = true;
                dstAmount = vf.DstAmount;
            }

            if (vf.ApplyLateRenewalSurcharge && request.ExpirationDate.HasValue)
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

            if (!string.IsNullOrWhiteSpace(vf.CalculationFormula))
            {
                formulas.Add(vf.CalculationFormula);
            }
        }

        // 2. Process Element-level Fees
        foreach (var ef in activeElementFees)
        {
            var feeName = ef.Fee?.Name ?? (ef.Element != null ? $"{ef.Element.Name} Fee" : "Element Fee");
            var feeCode = ef.Fee?.Code ?? "FEE";
            var baseRate = ef.Amount;

            var itemAmount = ef.CalculationMode == FeeCalculationMode.CustomFormula && !string.IsNullOrWhiteSpace(ef.CalculationFormula)
                ? DynamicFeeFormulaEvaluator.Evaluate(
                    ef.CalculationFormula,
                    baseRate,
                    request.ValidityYears,
                    request.NoOfUnits,
                    request.NoOfChannels,
                    request.NoOfCopies,
                    request.AdditionalServicesCount,
                    ef.DstAmount)
                : DynamicFeeFormulaEvaluator.CalculateStandardMultiplier(
                    baseRate,
                    ef.MultiplyByValidityYears,
                    request.ValidityYears,
                    ef.MultiplyByUnits,
                    request.NoOfUnits,
                    ef.MultiplyByChannels,
                    request.NoOfChannels,
                    ef.MultiplyByPages,
                    request.NoOfCopies);

            var valYears = ef.MultiplyByValidityYears ? Math.Max(1, request.ValidityYears) : 1;
            var units = ef.MultiplyByUnits ? Math.Max(1, request.NoOfUnits) : 1;

            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: feeName,
                ItemCode: feeCode,
                Description: ef.Element?.Description ?? feeName,
                ValidityYears: valYears,
                NoOfUnits: units,
                FeeRate: baseRate,
                Amount: itemAmount,
                IsSurcharge: false,
                IsTax: feeCode.Equals(FeeConstants.Codes.Dst, StringComparison.OrdinalIgnoreCase)
            ));

            if (!feeCode.Equals(FeeConstants.Codes.Dst, StringComparison.OrdinalIgnoreCase))
            {
                subTotal += itemAmount;
            }

            if (ef.IncludeDst)
            {
                hasDst = true;
                dstAmount = ef.DstAmount;
            }

            if (ef.ApplyLateRenewalSurcharge && request.ExpirationDate.HasValue)
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

            if (!string.IsNullOrWhiteSpace(ef.CalculationFormula))
            {
                formulas.Add(ef.CalculationFormula);
            }
        }

        // 3. Add DST Tax if required and not already present as a line item
        decimal taxAmount = 0m;
        if (hasDst && !lineItems.Any(li => li.IsTax || li.ItemCode.Equals(FeeConstants.Codes.Dst, StringComparison.OrdinalIgnoreCase)))
        {
            taxAmount = dstAmount;
            lineItems.Add(new CalculatedFeeLineItemDto(
                Particular: "Documentary Stamp Tax",
                ItemCode: FeeConstants.Codes.Dst,
                Description: "Fixed statutory tax per transaction",
                ValidityYears: 1,
                NoOfUnits: 1,
                FeeRate: dstAmount,
                Amount: dstAmount,
                IsTax: true
            ));
        }
        else
        {
            taxAmount = lineItems.Where(li => li.IsTax || li.ItemCode.Equals(FeeConstants.Codes.Dst, StringComparison.OrdinalIgnoreCase)).Sum(li => li.Amount);
        }

        var totalAmount = subTotal + surchargeAmount + taxAmount;
        var formulaApplied = formulas.Count > 0 ? string.Join(" | ", formulas.Distinct()) : "DYNAMIC_CONFIG";

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
