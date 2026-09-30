using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.ServiceVariantElementFees.DTOs;
using EDGE.Application.ServiceVariantFees.DTOs;

namespace EDGE.Application.ServiceVariantElementFees.Queries.GetServiceVariantElementFeeById;

public class GetServiceVariantElementFeeByIdQueryHandler : IRequestHandler<GetServiceVariantElementFeeByIdQuery, ServiceVariantElementFeeDto?>
{
    private readonly IServiceVariantElementFeeRepository _repository;

    public GetServiceVariantElementFeeByIdQueryHandler(IServiceVariantElementFeeRepository repository)
    {
        _repository = repository;
    }

    public async Task<ServiceVariantElementFeeDto?> Handle(GetServiceVariantElementFeeByIdQuery request, CancellationToken cancellationToken)
    {
        var svef = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (svef == null)
        {
            return null;
        }

        return new ServiceVariantElementFeeDto(
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
            svef.IsActive,
            svef.CreatedAt
        );
    }
}
