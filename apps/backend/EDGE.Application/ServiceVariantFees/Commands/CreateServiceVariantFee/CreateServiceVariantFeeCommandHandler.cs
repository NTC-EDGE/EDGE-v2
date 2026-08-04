using System;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.ServiceVariantFees.DTOs;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Application.ServiceVariantFees.Commands.CreateServiceVariantFee;

public class CreateServiceVariantFeeCommandHandler : IRequestHandler<CreateServiceVariantFeeCommand, ServiceVariantFeeDto>
{
    private readonly IServiceVariantFeeRepository _repository;
    private readonly IFeeRepository _feeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateServiceVariantFeeCommandHandler(
        IServiceVariantFeeRepository repository,
        IFeeRepository feeRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _feeRepository = feeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceVariantFeeDto> Handle(CreateServiceVariantFeeCommand request, CancellationToken cancellationToken)
    {
        var fee = await _feeRepository.GetByIdAsync(request.FeeId, cancellationToken);
        if (fee == null)
        {
            throw new InvalidOperationException($"Fee with ID '{request.FeeId}' does not exist.");
        }

        var svf = new ServiceVariantFee
        {
            ServiceVariantId = request.ServiceVariantId,
            FeeId = request.FeeId,
            Amount = request.Amount
        };

        await _repository.AddAsync(svf, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await _repository.GetByIdAsync(svf.Id, cancellationToken);
        if (created == null)
        {
            throw new InvalidOperationException("Failed to retrieve created service variant fee.");
        }

        return new ServiceVariantFeeDto(
            created.Id,
            created.ServiceVariantId,
            created.ServiceVariant != null ? new ServiceVariantDetailDto(
                created.ServiceVariant.Id,
                created.ServiceVariant.ServiceId,
                created.ServiceVariant.Service?.Name,
                created.ServiceVariant.Type.ToString()
            ) : null,
            created.FeeId,
            created.Fee?.Code,
            created.Fee?.Name,
            created.Amount,
            created.CreatedAt
        );
    }
}
