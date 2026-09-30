using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.ServiceVariantFees.DTOs;

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

        var updated = await _repository.GetByIdAsync(svf.Id, cancellationToken);
        if (updated == null)
        {
            return null;
        }

        return new ServiceVariantFeeDto(
            updated.Id,
            updated.ServiceVariantId,
            updated.ServiceVariant != null ? new ServiceVariantDetailDto(
                updated.ServiceVariant.Id,
                updated.ServiceVariant.ServiceId,
                updated.ServiceVariant.Service?.Name,
                updated.ServiceVariant.Type.ToString()
            ) : null,
            updated.FeeId,
            updated.Fee?.Code,
            updated.Fee?.Name,
            updated.Amount,
            updated.IsActive,
            updated.CreatedAt
        );
    }
}
