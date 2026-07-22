using MediatR;
using EDGE.Application.ServiceFees.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.ServiceFees.Commands.SetServiceFeeStatus;

public class SetServiceFeeStatusCommandHandler : IRequestHandler<SetServiceFeeStatusCommand, ServiceFeeDto?>
{
    private readonly IServiceFeeRepository _serviceFeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SetServiceFeeStatusCommandHandler(IServiceFeeRepository serviceFeeRepository, IUnitOfWork unitOfWork)
    {
        _serviceFeeRepository = serviceFeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceFeeDto?> Handle(SetServiceFeeStatusCommand request, CancellationToken cancellationToken)
    {
        var serviceFee = await _serviceFeeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (serviceFee == null)
        {
            return null;
        }

        serviceFee.IsActive = request.IsActive;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ServiceFeeDto(
            serviceFee.Id,
            serviceFee.ServiceId,
            serviceFee.Service?.Name,
            serviceFee.Service?.Code,
            serviceFee.FeeId,
            serviceFee.Fee?.Code,
            serviceFee.Fee?.Name,
            serviceFee.Amount,
            serviceFee.IsActive,
            serviceFee.CreatedAt
        );
    }
}
