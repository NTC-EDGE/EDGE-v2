using MediatR;
using EDGE.Application.Fees.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Fees.Queries;

public record GetFeeByIdQuery(Guid Id) : IRequest<FeeDto?>;

public class GetFeeByIdQueryHandler : IRequestHandler<GetFeeByIdQuery, FeeDto?>
{
    private readonly IFeeRepository _feeRepository;

    public GetFeeByIdQueryHandler(IFeeRepository feeRepository)
    {
        _feeRepository = feeRepository;
    }

    public async Task<FeeDto?> Handle(GetFeeByIdQuery request, CancellationToken cancellationToken)
    {
        var fee = await _feeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (fee == null)
        {
            return null;
        }

        return new FeeDto(fee.Id, fee.Code, fee.Name, fee.Description, fee.IsActive, fee.CreatedAt);
    }
}
