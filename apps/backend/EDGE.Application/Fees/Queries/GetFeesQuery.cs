using MediatR;
using EDGE.Application.Fees.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Fees.Queries;

public record GetFeesQuery(bool? ActiveOnly = null) : IRequest<List<FeeDto>>;

public class GetFeesQueryHandler : IRequestHandler<GetFeesQuery, List<FeeDto>>
{
    private readonly IFeeRepository _feeRepository;

    public GetFeesQueryHandler(IFeeRepository feeRepository)
    {
        _feeRepository = feeRepository;
    }

    public async Task<List<FeeDto>> Handle(GetFeesQuery request, CancellationToken cancellationToken)
    {
        var fees = await _feeRepository.GetAllAsync(request.ActiveOnly, cancellationToken);
        return fees.Select(f => new FeeDto(
            f.Id,
            f.Code,
            f.Name,
            f.Description,
            f.IsActive,
            f.CreatedAt
        )).ToList();
    }
}
