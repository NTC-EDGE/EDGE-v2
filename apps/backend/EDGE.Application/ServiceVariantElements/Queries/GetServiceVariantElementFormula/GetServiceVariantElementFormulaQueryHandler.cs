using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceVariantElements.DTOs;

namespace EDGE.Application.ServiceVariantElements.Queries.GetServiceVariantElementFormula;

public class GetServiceVariantElementFormulaQueryHandler : IRequestHandler<GetServiceVariantElementFormulaQuery, ApiResponse<ServiceVariantElementFormulaDto?>>
{
    private readonly IServiceVariantFormulaRepository _repository;

    public GetServiceVariantElementFormulaQueryHandler(IServiceVariantFormulaRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<ServiceVariantElementFormulaDto?>> Handle(GetServiceVariantElementFormulaQuery request, CancellationToken cancellationToken)
    {
        var formula = await _repository.GetElementFormulaAsync(request.ServiceVariantId, request.ElementId, cancellationToken);
        if (formula == null)
        {
            return ApiResponse<ServiceVariantElementFormulaDto?>.Success(null, "No custom formula registered for this element variant.");
        }

        var dto = new ServiceVariantElementFormulaDto(
            formula.Id,
            formula.ServiceVariantId,
            formula.ElementId,
            formula.Element?.Code,
            formula.Element?.Name,
            formula.FormulaExpression,
            formula.Description,
            formula.ApplyLateRenewalSurcharge,
            formula.IsActive
        );

        return ApiResponse<ServiceVariantElementFormulaDto?>.Success(dto);
    }
}
