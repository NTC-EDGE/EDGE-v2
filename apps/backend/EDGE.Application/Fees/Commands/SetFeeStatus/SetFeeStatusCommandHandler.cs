using MediatR;
using EDGE.Application.Fees.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Fees.Commands.SetFeeStatus;

public class SetFeeStatusCommandHandler : IRequestHandler<SetFeeStatusCommand, FeeDto?>
{
    private readonly IFeeRepository _feeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SetFeeStatusCommandHandler(IFeeRepository feeRepository, IUnitOfWork unitOfWork)
    {
        _feeRepository = feeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<FeeDto?> Handle(SetFeeStatusCommand request, CancellationToken cancellationToken)
    {
        var fee = await _feeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (fee == null)
        {
            return null;
        }

        fee.IsActive = request.IsActive;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new FeeDto(fee.Id, fee.Code, fee.Name, fee.Description, fee.IsActive, fee.CreatedAt);
    }
}
