using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Application.Fees.Calculations.Strategies;

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
        // 1. Try to find specialized strategy matching the exact Service Category or Activity
        var matchingStrategy = _strategies.FirstOrDefault(s =>
            s is not DefaultFeeCalculationStrategy &&
            s.CanHandle(request.Category, request.Activity, request.ApplicationType));

        // 2. Fall back to Default Strategy if no specialized category strategy matches
        var strategy = matchingStrategy ?? _defaultStrategy;

        return strategy.Calculate(request);
    }
}
