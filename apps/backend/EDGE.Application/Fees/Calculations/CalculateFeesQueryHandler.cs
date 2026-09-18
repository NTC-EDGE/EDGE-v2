using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Fees.Calculations;

public class CalculateFeesQueryHandler : IRequestHandler<CalculateFeesQuery, ApiResponse<FeeCalculationResultDto>>
{
    private readonly IFeeCalculationEngine _calculationEngine;

    public CalculateFeesQueryHandler(IFeeCalculationEngine calculationEngine)
    {
        _calculationEngine = calculationEngine;
    }

    public Task<ApiResponse<FeeCalculationResultDto>> Handle(CalculateFeesQuery request, CancellationToken cancellationToken)
    {
        var calculationRequest = new FeeCalculationRequest(
            Activity: request.Activity,
            ApplicationType: request.ApplicationType,
            Element: request.Element,
            ValidityYears: request.ValidityYears,
            NoOfUnits: request.NoOfUnits,
            ExpirationDate: request.ExpirationDate,
            AdditionalServicesCount: request.AdditionalServicesCount,
            NoOfCopies: request.NoOfCopies,
            AsOfDate: request.AsOfDate,
            Category: request.Category
        );

        var result = _calculationEngine.Calculate(calculationRequest);
        return Task.FromResult(ApiResponse<FeeCalculationResultDto>.Success(result));
    }
}
