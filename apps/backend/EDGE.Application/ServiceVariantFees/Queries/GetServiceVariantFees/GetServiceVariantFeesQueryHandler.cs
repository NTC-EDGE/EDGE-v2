using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.ServiceVariantFees.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.ServiceVariantFees.Queries.GetServiceVariantFees;

public class GetServiceVariantFeesQueryHandler : IRequestHandler<GetServiceVariantFeesQuery, List<ServiceVariantFeeDto>>
{
    private readonly IServiceVariantFeeRepository _repository;

    public GetServiceVariantFeesQueryHandler(IServiceVariantFeeRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ServiceVariantFeeDto>> Handle(GetServiceVariantFeesQuery request, CancellationToken cancellationToken)
    {
        var fees = request.ServiceVariantId.HasValue
            ? await _repository.GetByServiceVariantIdAsync(request.ServiceVariantId.Value, cancellationToken)
            : await _repository.GetAllAsync(cancellationToken);

        return fees.Select(svf => new ServiceVariantFeeDto(
            svf.Id,
            svf.ServiceVariantId,
            svf.FeeId,
            svf.Fee?.Code,
            svf.Fee?.Name,
            svf.Amount,
            svf.CreatedAt
        )).ToList();
    }
}
