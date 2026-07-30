using System;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.ServiceVariantFees.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.ServiceVariantFees.Commands.UpdateServiceVariantFee;

public class UpdateServiceVariantFeeCommandHandler : IRequestHandler<UpdateServiceVariantFeeCommand, ServiceVariantFeeDto?>
{
    private readonly IServiceVariantFeeRepository _repository;
    private readonly IFeeRepository _feeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateServiceVariantFeeCommandHandler(
        IServiceVariantFeeRepository repository,
        IFeeRepository feeRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _feeRepository = feeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceVariantFeeDto?> Handle(UpdateServiceVariantFeeCommand request, CancellationToken cancellationToken)
    {
        var svf = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (svf == null)
        {
            return null;
        }

        var fee = await _feeRepository.GetByIdAsync(request.FeeId, cancellationToken);
        if (fee == null)
        {
            throw new InvalidOperationException($"Fee with ID '{request.FeeId}' does not exist.");
        }

        svf.ServiceVariantId = request.ServiceVariantId;
        svf.FeeId = request.FeeId;
        svf.Amount = request.Amount;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ServiceVariantFeeDto(
            svf.Id,
            svf.ServiceVariantId,
            svf.FeeId,
            fee.Code,
            fee.Name,
            svf.Amount,
            svf.CreatedAt
        );
    }
}
