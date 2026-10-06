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
    private readonly IServiceFeeRepository? _serviceFeeRepository;
    private readonly IServiceVariantFeeRepository? _variantFeeRepository;
    private readonly IServiceVariantElementFeeRepository? _elementFeeRepository;
    private readonly IServiceVariantFormulaRepository? _formulaRepository;

    public CalculateFeesQueryHandler(
        IFeeCalculationEngine calculationEngine,
        IServiceFeeRepository? serviceFeeRepository = null,
        IServiceVariantFeeRepository? variantFeeRepository = null,
        IServiceVariantElementFeeRepository? elementFeeRepository = null,
        IServiceVariantFormulaRepository? formulaRepository = null)
    {
        _calculationEngine = calculationEngine;
        _serviceFeeRepository = serviceFeeRepository;
        _variantFeeRepository = variantFeeRepository;
        _elementFeeRepository = elementFeeRepository;
        _formulaRepository = formulaRepository;
    }

    public async Task<ApiResponse<FeeCalculationResultDto>> Handle(CalculateFeesQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<ServiceFee>? serviceFees = null;
        IReadOnlyList<ServiceVariantFee>? variantFees = null;
        IReadOnlyList<ServiceVariantElementFee>? elementFees = null;
        string? formulaExpression = null;

        if (request.ServiceId.HasValue && _serviceFeeRepository != null)
        {
            serviceFees = await _serviceFeeRepository.GetAllAsync(serviceId: request.ServiceId.Value, activeOnly: true, cancellationToken: cancellationToken);
        }

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
            if (_formulaRepository != null)
            {
                if (request.ElementId.HasValue)
                {
                    var elemFormula = await _formulaRepository.GetElementFormulaAsync(request.ServiceVariantId.Value, request.ElementId.Value, cancellationToken);
                    formulaExpression = elemFormula?.FormulaExpression;
                }

                if (string.IsNullOrWhiteSpace(formulaExpression))
                {
                    var variantFormula = await _formulaRepository.GetByServiceVariantIdAsync(request.ServiceVariantId.Value, cancellationToken);
                    formulaExpression = variantFormula?.FormulaExpression;
                }
            }
        }

        if (string.IsNullOrWhiteSpace(formulaExpression) && request.ServiceId.HasValue && _formulaRepository != null)
        {
            var serviceFormula = await _formulaRepository.GetServiceFormulaAsync(request.ServiceId.Value, cancellationToken);
            formulaExpression = serviceFormula?.FormulaExpression;
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
            ServiceId: request.ServiceId,
            ServiceVariantId: request.ServiceVariantId,
            ElementId: request.ElementId,
            ServiceFees: serviceFees,
            VariantFees: variantFees,
            ElementFees: elementFees,
            FormulaExpression: formulaExpression
        );

        var result = _calculationEngine.Calculate(calculationRequest);
        return ApiResponse<FeeCalculationResultDto>.Success(result);
    }
}
