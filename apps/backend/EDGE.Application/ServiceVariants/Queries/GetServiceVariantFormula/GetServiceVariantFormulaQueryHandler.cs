using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceVariants.DTOs;

namespace EDGE.Application.ServiceVariants.Queries.GetServiceVariantFormula;

public class GetServiceVariantFormulaQueryHandler : IRequestHandler<GetServiceVariantFormulaQuery, ApiResponse<ServiceVariantFormulaDto?>>
{
    private readonly IServiceVariantFormulaRepository _repository;

    public GetServiceVariantFormulaQueryHandler(IServiceVariantFormulaRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<ServiceVariantFormulaDto?>> Handle(GetServiceVariantFormulaQuery request, CancellationToken cancellationToken)
    {
        var formula = await _repository.GetByServiceVariantIdAsync(request.ServiceVariantId, cancellationToken);
        if (formula == null)
        {
            return ApiResponse<ServiceVariantFormulaDto?>.Success(null, "No custom formula registered for this service variant.");
        }

        var dto = new ServiceVariantFormulaDto(
            formula.Id,
            formula.ServiceVariantId,
            formula.FormulaExpression,
            formula.Description,
            formula.ApplyLateRenewalSurcharge,
            formula.IsActive
        );

        return ApiResponse<ServiceVariantFormulaDto?>.Success(dto);
    }
}
