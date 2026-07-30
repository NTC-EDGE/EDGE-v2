using MediatR;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.ServiceVariantFees.DTOs;
using EDGE.Application.Common.Interfaces;

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
            svf.FeeId,
            svf.Fee?.Code,
            svf.Fee?.Name,
            svf.Amount,
            svf.CreatedAt
        );
    }
}
