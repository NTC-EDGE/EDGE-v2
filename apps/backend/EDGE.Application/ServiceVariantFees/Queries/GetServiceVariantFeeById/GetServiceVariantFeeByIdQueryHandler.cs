using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.ServiceVariantFees.DTOs;

namespace EDGE.Application.ServiceVariantFees.Queries.GetServiceVariantFeeById;

public class GetServiceVariantFeeByIdQueryHandler : IRequestHandler<GetServiceVariantFeeByIdQuery, ServiceVariantFeeDto?>
{
    private readonly IServiceVariantFeeRepository _repository;

    public GetServiceVariantFeeByIdQueryHandler(IServiceVariantFeeRepository repository)
    {
        _repository = repository;
    }

    public async Task<ServiceVariantFeeDto?> Handle(GetServiceVariantFeeByIdQuery request, CancellationToken cancellationToken)
    {
        var svf = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (svf == null)
        {
            return null;
        }

        return new ServiceVariantFeeDto(
            svf.Id,
            svf.ServiceVariantId,
            svf.ServiceVariant != null ? new ServiceVariantDetailDto(
                svf.ServiceVariant.Id,
                svf.ServiceVariant.ServiceId,
                svf.ServiceVariant.Service?.Name,
                svf.ServiceVariant.Type.ToString()
            ) : null,
            svf.FeeId,
            svf.Fee?.Code,
            svf.Fee?.Name,
            svf.Amount,
            svf.IsActive,
            svf.CreatedAt
        );
    }
}
