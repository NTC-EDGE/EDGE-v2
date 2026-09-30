using System;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.ServiceVariantElementFees.DTOs;
using EDGE.Application.ServiceVariantFees.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.ServiceVariantElementFees.Commands.UpdateServiceVariantElementFee;

public class UpdateServiceVariantElementFeeCommandHandler : IRequestHandler<UpdateServiceVariantElementFeeCommand, ServiceVariantElementFeeDto?>
{
    private readonly IServiceVariantElementFeeRepository _repository;
    private readonly IElementRepository _elementRepository;
    private readonly IFeeRepository _feeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateServiceVariantElementFeeCommandHandler(
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

    public async Task<ServiceVariantElementFeeDto?> Handle(UpdateServiceVariantElementFeeCommand request, CancellationToken cancellationToken)
    {
        var svef = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (svef == null)
        {
            return null;
        }

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

        svef.ServiceVariantId = request.ServiceVariantId;
        svef.ElementId = request.ElementId;
        svef.FeeId = request.FeeId;
        svef.Amount = request.Amount;
        svef.CalculationMode = request.CalculationMode;
        svef.CalculationFormula = request.CalculationFormula;
        svef.MultiplyByValidityYears = request.MultiplyByValidityYears;
        svef.MultiplyByUnits = request.MultiplyByUnits;
        svef.MultiplyByChannels = request.MultiplyByChannels;
        svef.MultiplyByPages = request.MultiplyByPages;
        svef.ApplyLateRenewalSurcharge = request.ApplyLateRenewalSurcharge;
        svef.IncludeDst = request.IncludeDst;
        svef.DstAmount = request.DstAmount;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updated = await _repository.GetByIdAsync(svef.Id, cancellationToken);
        if (updated == null)
        {
            return null;
        }

        return new ServiceVariantElementFeeDto(
            updated.Id,
            updated.ServiceVariantId,
            updated.ServiceVariant != null ? new ServiceVariantDetailDto(
                updated.ServiceVariant.Id,
                updated.ServiceVariant.ServiceId,
                updated.ServiceVariant.Service?.Name,
                updated.ServiceVariant.Type.ToString()
            ) : null,
            updated.ElementId,
            updated.Element?.Code,
            updated.Element?.Name,
            updated.FeeId,
            updated.Fee?.Code,
            updated.Fee?.Name,
            updated.Amount,
            updated.CalculationMode,
            updated.CalculationFormula,
            updated.MultiplyByValidityYears,
            updated.MultiplyByUnits,
            updated.MultiplyByChannels,
            updated.MultiplyByPages,
            updated.ApplyLateRenewalSurcharge,
            updated.IncludeDst,
            updated.DstAmount,
            updated.CreatedAt
        );
    }
}
