using System;
using System.Collections.Generic;
using EDGE.Domain.Constants;

namespace EDGE.Application.Fees.Calculations.Strategies.Licenses;

/// <summary>
/// Defines the contract for specialized license sub-category fee calculators.
/// </summary>
public interface ILicenseSubCategoryCalculator
{
    bool CanHandle(string activity, string applicationType);

    string Calculate(
        List<CalculatedFeeLineItemDto> lineItems,
        FeeCalculationRequest request,
        int years,
        int units,
        int copies,
        int channels,
        DateTime asOfDate);
}
