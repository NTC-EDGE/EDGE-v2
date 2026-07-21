using MediatR;
using EDGE.Application.ServiceFees.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.ServiceFees.Queries;

public record GetServiceFeeByIdQuery(Guid Id) : IRequest<ServiceFeeDto?>;

public class GetServiceFeeByIdQueryHandler : IRequestHandler<GetServiceFeeByIdQuery, ServiceFeeDto?>
{
    private readonly IServiceFeeRepository _serviceFeeRepository;

    public GetServiceFeeByIdQueryHandler(IServiceFeeRepository serviceFeeRepository)
    {
        _serviceFeeRepository = serviceFeeRepository;
    }

    public async Task<ServiceFeeDto?> Handle(GetServiceFeeByIdQuery request, CancellationToken cancellationToken)
    {
        var sf = await _serviceFeeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (sf == null)
        {
            return null;
        }

        return new ServiceFeeDto(
            sf.Id,
            sf.ServiceId,
            sf.FeeId,
            sf.Fee?.Code,
            sf.Fee?.Name,
            sf.Amount,
            sf.IsActive,
            sf.CreatedAt
        );
    }
}
