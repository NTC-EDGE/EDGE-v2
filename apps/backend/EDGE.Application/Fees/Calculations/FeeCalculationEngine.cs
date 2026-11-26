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
        // 1. Find specialized strategy matching the exact Service Category or Activity
        var matchingStrategy = _strategies.FirstOrDefault(s =>
            s is not DefaultFeeCalculationStrategy &&
            s.CanHandle(request.Category, request.Activity, request.ApplicationType));

        // 2. Try to evaluate dynamic fee configuration from Database if provided
        var hasServiceFees = request.ServiceFees != null && request.ServiceFees.Any(sf => sf.IsActive && !sf.IsDeleted);
        var hasVariantFees = request.VariantFees != null && request.VariantFees.Any(vf => vf.IsActive && !vf.IsDeleted);
        var hasElementFees = request.ElementFees != null && request.ElementFees.Any(ef => ef.IsActive && !ef.IsDeleted);

        if (hasServiceFees || hasVariantFees || hasElementFees)
        {
            var dynamicResult = CalculateDynamicFees(request, matchingStrategy);
            if (dynamicResult != null)
            {
                return AttachServiceMetadata(NormalizeResultValidityYears(dynamicResult, request.ValidityYears), request);
            }
        }

        // 3. Fall back to Default Strategy if no specialized category strategy matches
        var strategy = matchingStrategy ?? _defaultStrategy;

        var result = strategy.Calculate(request);
        return AttachServiceMetadata(NormalizeResultValidityYears(result, request.ValidityYears), request);
    }

    private static FeeCalculationResultDto AttachServiceMetadata(
        FeeCalculationResultDto result,
        FeeCalculationRequest request)
    {
        return result with
        {
            ServiceId = result.ServiceId ?? request.ServiceId,
            ServiceCode = !string.IsNullOrWhiteSpace(result.ServiceCode) ? result.ServiceCode : request.ServiceCode,
            ServiceName = !string.IsNullOrWhiteSpace(result.ServiceName) ? result.ServiceName : request.ServiceName,
            ServiceVariantId = result.ServiceVariantId ?? request.ServiceVariantId,
            ServiceVariantName = !string.IsNullOrWhiteSpace(result.ServiceVariantName) ? result.ServiceVariantName : request.ServiceVariantName
        };
    }

    private static FeeCalculationResultDto NormalizeResultValidityYears(
        FeeCalculationResultDto result,
        int requestedValidityYears)
    {
        if (result.LineItems == null || result.LineItems.Count == 0)
        {
            return result;
        }

        var normalizedItems = result.LineItems
            .Select(li =>
            {
                var usesYears = requestedValidityYears > 0 &&
                                !li.IsTax &&
                                !li.IsSurcharge &&
                                FeeConstants.FormulaTokens.FeeUsesYears(result.FormulaApplied, li.ItemCode, li.Particular, formExplicitlyAsksForYears: true);
                var targetYears = usesYears ? Math.Max(1, li.ValidityYears > 0 ? li.ValidityYears : requestedValidityYears) : 0;
                return li.ValidityYears == targetYears ? li : li with { ValidityYears = targetYears };
            })
            .ToList();

        return result with { LineItems = normalizedItems };
    }

    private static FeeCalculationResultDto? CalculateDynamicFees(
        FeeCalculationRequest request,
        IFeeCalculationStrategy? matchingStrategy = null)
    {
        var activeServiceFees = request.ServiceFees?
            .Where(sf => sf.IsActive && !sf.IsDeleted)
            .ToList() ?? new List<ServiceFee>();

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

        if (activeServiceFees.Count == 0 && activeVariantFees.Count == 0 && activeElementFees.Count == 0)
        {
            return null;
        }

        var lineItems = new List<CalculatedFeeLineItemDto>();
        decimal subTotal = 0m;
        decimal surchargeAmount = 0m;
        var formulaExpr = request.FormulaExpression ?? string.Empty;
        if (string.IsNullOrWhiteSpace(formulaExpr) && matchingStrategy != null)
        {
            try
            {
                formulaExpr = matchingStrategy.Calculate(request).FormulaApplied ?? string.Empty;
            }
            catch
            {
                formulaExpr = string.Empty;
            }
        }

        var hasMultiYears = FeeConstants.FormulaTokens.HasYears(formulaExpr);
        var hasMultiUnits = FeeConstants.FormulaTokens.HasUnits(formulaExpr);
        var hasMultiChannels = FeeConstants.FormulaTokens.HasChannels(formulaExpr);
        var hasMultiPages = FeeConstants.FormulaTokens.HasPages(formulaExpr);

        // Process combined component fees (Service, Variant, and Element levels)
        // Deduplicate by canonical FeeCode and FeeName so the same fee under different codes
        // (e.g., FILING_FEE vs FF, INSP_FEE vs IF, LIC vs LF, PERMIT vs PF, POSS_PERMIT vs POS, EXAM_REG_FEE vs EXAM)
        // is never charged twice.
        var rawFeeCandidates = new List<(string FeeName, string FeeCode, string? Description, decimal Amount, int Priority)>();
        foreach (var ef in activeElementFees)
        {
            var name = ef.Fee?.Name ?? (ef.Element != null ? $"{ef.Element.Name} Fee" : "Element Fee");
            var code = FeeConstants.Codes.NormalizeCanonicalCode(ef.Fee?.Code, name);
            rawFeeCandidates.Add((name, code, ef.Element?.Description ?? ef.Fee?.Description, ef.Amount, 1));
        }
        foreach (var vf in activeVariantFees)
        {
            var name = vf.Fee?.Name ?? vf.Fee?.Code ?? "Statutory Fee";
            var code = FeeConstants.Codes.NormalizeCanonicalCode(vf.Fee?.Code, name);
            rawFeeCandidates.Add((name, code, vf.Fee?.Description, vf.Amount, 2));
        }
        foreach (var sf in activeServiceFees)
        {
            var name = sf.Fee?.Name ?? sf.Fee?.Code ?? "Service Fee";
            var code = FeeConstants.Codes.NormalizeCanonicalCode(sf.Fee?.Code, name);
            rawFeeCandidates.Add((name, code, sf.Fee?.Description, sf.Amount, 3));
        }

        var seenCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var seenNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var allFees = new List<(string FeeName, string FeeCode, string? Description, decimal Amount)>();

        foreach (var candidate in rawFeeCandidates.OrderBy(c => c.Priority))
        {
            var normName = candidate.FeeName.Trim();
            if (candidate.FeeCode != "FEE" && seenCodes.Contains(candidate.FeeCode))
            {
                continue;
            }
            if (!string.IsNullOrEmpty(normName) && seenNames.Contains(normName))
            {
                continue;
            }

            if (candidate.FeeCode != "FEE")
            {
                seenCodes.Add(candidate.FeeCode);
            }
            if (!string.IsNullOrEmpty(normName))
            {
                seenNames.Add(normName);
            }

            allFees.Add((candidate.FeeName, candidate.FeeCode, candidate.Description, candidate.Amount));
        }

        foreach (var (feeName, feeCode, description, baseRate) in allFees)
        {
            var isDst = feeCode.Equals(FeeConstants.Codes.Dst, StringComparison.OrdinalIgnoreCase);

            int valYears = 0;
            int units = 1;
            int channels = 1;
            int pages = 1;

            if (!isDst)
            {
                var feeUsesYears = request.ValidityYears > 0 &&
                                   FeeConstants.FormulaTokens.FeeUsesYears(formulaExpr, feeCode, feeName, formExplicitlyAsksForYears: true);
                valYears = feeUsesYears ? request.ValidityYears : 0;

                if (!string.IsNullOrWhiteSpace(formulaExpr))
                {
                    units = (hasMultiUnits || request.NoOfUnits > 1) ? Math.Max(1, request.NoOfUnits) : 1;
                    channels = hasMultiChannels ? Math.Max(1, request.NoOfChannels) : 1;
                    pages = hasMultiPages ? Math.Max(1, request.NoOfCopies) : 1;
                }
                else
                {
                    units = Math.Max(1, request.NoOfUnits);
                }
            }

            var yearMultiplier = valYears > 0 ? valYears : 1;
            var itemAmount = baseRate * yearMultiplier * units * channels * pages;

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
                            ValidityYears: 0,
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
        var formulaApplied = !string.IsNullOrWhiteSpace(formulaExpr)
            ? formulaExpr
            : (request.Category == ServiceCategoryType.Exam ? FeeConstants.Formulas.ExamStandard : FeeConstants.Formulas.DefaultStandard);

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
