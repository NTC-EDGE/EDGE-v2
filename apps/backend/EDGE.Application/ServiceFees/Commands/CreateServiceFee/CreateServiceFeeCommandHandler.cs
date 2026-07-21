using MediatR;
using EDGE.Application.ServiceFees.DTOs;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Application.ServiceFees.Commands.CreateServiceFee;

public class CreateServiceFeeCommandHandler : IRequestHandler<CreateServiceFeeCommand, ServiceFeeDto>
{
    private readonly IServiceFeeRepository _serviceFeeRepository;
    private readonly IFeeRepository _feeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateServiceFeeCommandHandler(
        IServiceFeeRepository serviceFeeRepository,
        IFeeRepository feeRepository,
        IUnitOfWork unitOfWork)
    {
        _serviceFeeRepository = serviceFeeRepository;
        _feeRepository = feeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceFeeDto> Handle(CreateServiceFeeCommand request, CancellationToken cancellationToken)
    {
        var fee = await _feeRepository.GetByIdAsync(request.FeeId, cancellationToken);
        if (fee == null)
        {
            throw new InvalidOperationException($"Fee with ID '{request.FeeId}' does not exist.");
        }

        var serviceFee = new ServiceFee
        {
            ServiceId = request.ServiceId,
            FeeId = request.FeeId,
            Amount = request.Amount,
            IsActive = true
        };

        await _serviceFeeRepository.AddAsync(serviceFee, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ServiceFeeDto(
            serviceFee.Id,
            serviceFee.ServiceId,
            serviceFee.FeeId,
            fee.Code,
            fee.Name,
            serviceFee.Amount,
            serviceFee.IsActive,
            serviceFee.CreatedAt
        );
    }
}
