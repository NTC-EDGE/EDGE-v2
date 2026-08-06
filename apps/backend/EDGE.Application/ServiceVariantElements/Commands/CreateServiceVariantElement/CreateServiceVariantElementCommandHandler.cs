using MediatR;
using EDGE.Application.ServiceVariantElements.DTOs;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace EDGE.Application.ServiceVariantElements.Commands.CreateServiceVariantElement;

public class CreateServiceVariantElementCommandHandler
    : IRequestHandler<CreateServiceVariantElementCommand, ServiceVariantElementDto>
{
    private readonly IServiceVariantElementRepository _elementRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateServiceVariantElementCommandHandler(
        IServiceVariantElementRepository elementRepository,
        IServiceRepository serviceRepository,
        IUnitOfWork unitOfWork)
    {
        _elementRepository = elementRepository;
        _serviceRepository = serviceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceVariantElementDto> Handle(
        CreateServiceVariantElementCommand request,
        CancellationToken cancellationToken)
    {
        var variant = await _serviceRepository.GetVariantByIdAsync(request.ServiceVariantId, cancellationToken);
        if (variant == null)
        {
            throw new InvalidOperationException(
                $"ServiceVariant with ID '{request.ServiceVariantId}' does not exist.");
        }

        var element = new ServiceVariantElement
        {
            ServiceVariantId = request.ServiceVariantId,
            Code = request.Code,
            Description = request.Description
        };

        await _elementRepository.AddAsync(element, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ServiceVariantElementDto(
            element.Id,
            element.ServiceVariantId,
            variant.Description,
            element.Code,
            element.Description,
            element.CreatedAt
        );
    }
}
