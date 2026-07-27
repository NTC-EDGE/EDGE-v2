using MediatR;
using EDGE.Application.ServiceFees.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.ServiceFees.Commands.UpdateServiceFee;

public class UpdateServiceFeeCommandHandler : IRequestHandler<UpdateServiceFeeCommand, ServiceFeeDto?>
{
    private readonly IServiceFeeRepository _serviceFeeRepository;
    private readonly IFeeRepository _feeRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateServiceFeeCommandHandler(
        IServiceFeeRepository serviceFeeRepository,
        IFeeRepository feeRepository,
        IServiceRepository serviceRepository,
        IUnitOfWork unitOfWork)
    {
        _serviceFeeRepository = serviceFeeRepository;
        _feeRepository = feeRepository;
        _serviceRepository = serviceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceFeeDto?> Handle(UpdateServiceFeeCommand request, CancellationToken cancellationToken)
    {
        var serviceFee = await _serviceFeeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (serviceFee == null)
        {
            return null;
        }

        var fee = await _feeRepository.GetByIdAsync(request.FeeId, cancellationToken);
        if (fee == null)
        {
            throw new InvalidOperationException($"Fee with ID '{request.FeeId}' does not exist.");
        }

        var service = await _serviceRepository.GetByIdAsync(request.ServiceId, cancellationToken);
        if (service == null)
        {
            throw new InvalidOperationException($"Service with ID '{request.ServiceId}' does not exist.");
        }

        serviceFee.ServiceId = request.ServiceId;
        serviceFee.FeeId = request.FeeId;
        serviceFee.Amount = request.Amount;
        serviceFee.IsActive = request.IsActive;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ServiceFeeDto(
            serviceFee.Id,
            serviceFee.ServiceId,
            service.Name,
            service.Code,
            serviceFee.FeeId,
            fee.Code,
            fee.Name,
            serviceFee.Amount,
            serviceFee.IsActive,
            serviceFee.CreatedAt
        );
    }
}
