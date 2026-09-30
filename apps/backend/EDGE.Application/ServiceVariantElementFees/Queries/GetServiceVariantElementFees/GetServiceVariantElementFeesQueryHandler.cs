using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.ServiceVariantElementFees.DTOs;
using EDGE.Application.ServiceVariantFees.DTOs;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariantElementFees.Queries.GetServiceVariantElementFees;

public class GetServiceVariantElementFeesQueryHandler : IRequestHandler<GetServiceVariantElementFeesQuery, PaginatedApiResponse<ServiceVariantElementFeeDto>>
{
    private readonly IServiceVariantElementFeeRepository _repository;

    public GetServiceVariantElementFeesQueryHandler(IServiceVariantElementFeeRepository repository)
    {
        _repository = repository;
    }

    public async Task<PaginatedApiResponse<ServiceVariantElementFeeDto>> Handle(GetServiceVariantElementFeesQuery request, CancellationToken cancellationToken)
    {
        var fees = request.ServiceVariantId.HasValue
            ? await _repository.GetByServiceVariantIdAsync(request.ServiceVariantId.Value, cancellationToken)
            : await _repository.GetAllAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower();
            fees = fees.Where(svef => 
                (svef.ServiceVariant?.Service != null && svef.ServiceVariant.Service.Name.ToLower().Contains(search)) || 
                (svef.ServiceVariant != null && svef.ServiceVariant.Type.ToString().ToLower().Contains(search)) || 
                (svef.Element != null && svef.Element.Code.ToLower().Contains(search)) || 
                (svef.Element != null && svef.Element.Name.ToLower().Contains(search)) || 
                (svef.Fee != null && svef.Fee.Code.ToLower().Contains(search)) || 
                (svef.Fee != null && svef.Fee.Name.ToLower().Contains(search))
            ).ToList();
        }

        int totalCount = fees.Count;
        int pageNumber = request.PageNumber ?? 1;
        int pageSize = request.PageSize ?? 10;
        if (pageSize <= 0) pageSize = 1;

        var paginated = fees.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        var dtos = paginated.Select(svef => new ServiceVariantElementFeeDto(
            svef.Id,
            svef.ServiceVariantId,
            svef.ServiceVariant != null ? new ServiceVariantDetailDto(
                svef.ServiceVariant.Id,
                svef.ServiceVariant.ServiceId,
                svef.ServiceVariant.Service?.Name,
                svef.ServiceVariant.Type.ToString()
            ) : null,
            svef.ElementId,
            svef.Element?.Code,
            svef.Element?.Name,
            svef.FeeId,
            svef.Fee?.Code,
            svef.Fee?.Name,
            svef.Amount,
            svef.CalculationMode,
            svef.CalculationFormula,
            svef.MultiplyByValidityYears,
            svef.MultiplyByUnits,
            svef.MultiplyByChannels,
            svef.MultiplyByPages,
            svef.ApplyLateRenewalSurcharge,
            svef.IncludeDst,
            svef.DstAmount,
            svef.CreatedAt
        )).ToList();

        return new PaginatedApiResponse<ServiceVariantElementFeeDto>(dtos, pageNumber, pageSize, totalCount);
    }
}
