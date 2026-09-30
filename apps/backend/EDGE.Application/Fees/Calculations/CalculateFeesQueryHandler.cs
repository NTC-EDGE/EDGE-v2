using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Entities;

namespace EDGE.Application.Fees.Calculations;

public class CalculateFeesQueryHandler : IRequestHandler<CalculateFeesQuery, ApiResponse<FeeCalculationResultDto>>
{
    private readonly IFeeCalculationEngine _calculationEngine;
    private readonly IServiceVariantFeeRepository? _variantFeeRepository;
    private readonly IServiceVariantElementFeeRepository? _elementFeeRepository;

    public CalculateFeesQueryHandler(
        IFeeCalculationEngine calculationEngine,
        IServiceVariantFeeRepository? variantFeeRepository = null,
        IServiceVariantElementFeeRepository? elementFeeRepository = null)
    {
        _calculationEngine = calculationEngine;
        _variantFeeRepository = variantFeeRepository;
        _elementFeeRepository = elementFeeRepository;
    }

    public async Task<ApiResponse<FeeCalculationResultDto>> Handle(CalculateFeesQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<ServiceVariantFee>? variantFees = null;
        IReadOnlyList<ServiceVariantElementFee>? elementFees = null;

        if (request.ServiceVariantId.HasValue)
        {
            if (_variantFeeRepository != null)
            {
                variantFees = await _variantFeeRepository.GetByServiceVariantIdAsync(request.ServiceVariantId.Value, cancellationToken);
            }
            if (_elementFeeRepository != null)
            {
                elementFees = await _elementFeeRepository.GetByServiceVariantIdAsync(request.ServiceVariantId.Value, cancellationToken);
            }
        }

        var calculationRequest = new FeeCalculationRequest(
            Activity: request.Activity,
            ApplicationType: request.ApplicationType,
            Element: request.Element,
            ValidityYears: request.ValidityYears,
            NoOfUnits: request.NoOfUnits,
            ExpirationDate: request.ExpirationDate,
            AdditionalServicesCount: request.AdditionalServicesCount,
            NoOfCopies: request.NoOfCopies,
            NoOfChannels: request.NoOfChannels,
            AsOfDate: request.AsOfDate,
            Category: request.Category,
            ServiceVariantId: request.ServiceVariantId,
            ElementId: request.ElementId,
            VariantFees: variantFees,
            ElementFees: elementFees
        );

        var result = _calculationEngine.Calculate(calculationRequest);
        return ApiResponse<FeeCalculationResultDto>.Success(result);
    }
}
