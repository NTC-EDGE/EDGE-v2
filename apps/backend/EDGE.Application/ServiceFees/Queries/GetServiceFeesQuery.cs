using MediatR;
using EDGE.Application.ServiceFees.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.ServiceFees.Queries;

public record GetServiceFeesQuery(
    Guid? ServiceId = null,
    Guid? FeeId = null,
    bool? ActiveOnly = null
) : IRequest<List<ServiceFeeDto>>;

public class GetServiceFeesQueryHandler : IRequestHandler<GetServiceFeesQuery, List<ServiceFeeDto>>
{
    private readonly IServiceFeeRepository _serviceFeeRepository;

    public GetServiceFeesQueryHandler(IServiceFeeRepository serviceFeeRepository)
    {
        _serviceFeeRepository = serviceFeeRepository;
    }

    public async Task<List<ServiceFeeDto>> Handle(GetServiceFeesQuery request, CancellationToken cancellationToken)
    {
        var serviceFees = await _serviceFeeRepository.GetAllAsync(
            request.ServiceId,
            request.FeeId,
            request.ActiveOnly,
            cancellationToken
        );

        return serviceFees.Select(sf => new ServiceFeeDto(
            sf.Id,
            sf.ServiceId,
            sf.FeeId,
            sf.Fee?.Code,
            sf.Fee?.Name,
            sf.Amount,
            sf.IsActive,
            sf.CreatedAt
        )).ToList();
    }
}
