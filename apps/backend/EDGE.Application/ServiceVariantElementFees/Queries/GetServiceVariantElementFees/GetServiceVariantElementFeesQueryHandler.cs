using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.ServiceVariantElementFees.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.ServiceVariantElementFees.Queries.GetServiceVariantElementFees;

public class GetServiceVariantElementFeesQueryHandler : IRequestHandler<GetServiceVariantElementFeesQuery, List<ServiceVariantElementFeeDto>>
{
    private readonly IServiceVariantElementFeeRepository _repository;

    public GetServiceVariantElementFeesQueryHandler(IServiceVariantElementFeeRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ServiceVariantElementFeeDto>> Handle(GetServiceVariantElementFeesQuery request, CancellationToken cancellationToken)
    {
        var fees = request.ServiceVariantId.HasValue
            ? await _repository.GetByServiceVariantIdAsync(request.ServiceVariantId.Value, cancellationToken)
            : await _repository.GetAllAsync(cancellationToken);

        return fees.Select(svef => new ServiceVariantElementFeeDto(
            svef.Id,
            svef.ServiceVariantId,
            svef.ElementId,
            svef.Element?.Code,
            svef.Element?.Name,
            svef.FeeId,
            svef.Fee?.Code,
            svef.Fee?.Name,
            svef.Amount,
            svef.CreatedAt
        )).ToList();
    }
}
