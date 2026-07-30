using System;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.ServiceVariantElementFees.DTOs;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Application.ServiceVariantElementFees.Commands.CreateServiceVariantElementFee;

public class CreateServiceVariantElementFeeCommandHandler : IRequestHandler<CreateServiceVariantElementFeeCommand, ServiceVariantElementFeeDto>
{
    private readonly IServiceVariantElementFeeRepository _repository;
    private readonly IElementRepository _elementRepository;
    private readonly IFeeRepository _feeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateServiceVariantElementFeeCommandHandler(
        IServiceVariantElementFeeRepository repository,
        IElementRepository elementRepository,
        IFeeRepository feeRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _elementRepository = elementRepository;
        _feeRepository = feeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceVariantElementFeeDto> Handle(CreateServiceVariantElementFeeCommand request, CancellationToken cancellationToken)
    {
        var element = await _elementRepository.GetByIdAsync(request.ElementId, cancellationToken);
        if (element == null)
        {
            throw new InvalidOperationException($"Element with ID '{request.ElementId}' does not exist.");
        }

        var fee = await _feeRepository.GetByIdAsync(request.FeeId, cancellationToken);
        if (fee == null)
        {
            throw new InvalidOperationException($"Fee with ID '{request.FeeId}' does not exist.");
        }

        var svef = new ServiceVariantElementFee
        {
            ServiceVariantId = request.ServiceVariantId,
            ElementId = request.ElementId,
            FeeId = request.FeeId,
            Amount = request.Amount
        };

        await _repository.AddAsync(svef, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ServiceVariantElementFeeDto(
            svef.Id,
            svef.ServiceVariantId,
            svef.ElementId,
            element.Code,
            element.Name,
            svef.FeeId,
            fee.Code,
            fee.Name,
            svef.Amount,
            svef.CreatedAt
        );
    }
}
