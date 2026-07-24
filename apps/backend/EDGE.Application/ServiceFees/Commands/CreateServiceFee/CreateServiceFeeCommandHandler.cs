using MediatR;
using EDGE.Application.ServiceFees.DTOs;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Application.ServiceFees.Commands.CreateServiceFee;

public class CreateServiceFeeCommandHandler : IRequestHandler<CreateServiceFeeCommand, List<ServiceFeeDto>>
{
    private readonly IServiceFeeRepository _serviceFeeRepository;
    private readonly IFeeRepository _feeRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateServiceFeeCommandHandler(
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

    public async Task<List<ServiceFeeDto>> Handle(CreateServiceFeeCommand request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.ServiceId, cancellationToken);
        if (service == null)
        {
            throw new InvalidOperationException($"Service with ID '{request.ServiceId}' does not exist.");
        }

        var resultList = new List<ServiceFeeDto>();

        foreach (var entry in request.Fees)
        {
            var fee = await _feeRepository.GetByIdAsync(entry.FeeId, cancellationToken);
            if (fee == null)
            {
                throw new InvalidOperationException($"Fee with ID '{entry.FeeId}' does not exist.");
            }

            var serviceFee = new ServiceFee
            {
                ServiceId = request.ServiceId,
                FeeId = entry.FeeId,
                Amount = entry.Amount,
                IsActive = true
            };

            await _serviceFeeRepository.AddAsync(serviceFee, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            resultList.Add(new ServiceFeeDto(
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
            ));
        }

        return resultList;
    }
}
