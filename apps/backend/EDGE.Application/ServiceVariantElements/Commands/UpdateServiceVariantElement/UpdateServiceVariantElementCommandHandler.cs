using MediatR;
using EDGE.Application.ServiceVariantElements.DTOs;
using EDGE.Application.Common.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Application.ServiceVariantElements.Commands.UpdateServiceVariantElement;

public class UpdateServiceVariantElementCommandHandler
    : IRequestHandler<UpdateServiceVariantElementCommand, ServiceVariantElementDto?>
{
    private readonly IServiceVariantElementRepository _elementRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateServiceVariantElementCommandHandler(
        IServiceVariantElementRepository elementRepository,
        IServiceRepository serviceRepository,
        IUnitOfWork unitOfWork)
    {
        _elementRepository = elementRepository;
        _serviceRepository = serviceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceVariantElementDto?> Handle(
        UpdateServiceVariantElementCommand request,
        CancellationToken cancellationToken)
    {
        var element = await _elementRepository.GetByIdAsync(request.Id, cancellationToken);
        if (element == null)
        {
            return null;
        }

        var variant = await _serviceRepository.GetVariantByIdAsync(element.ServiceVariantId, cancellationToken);

        element.Code = request.Code;
        element.Description = request.Description;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ServiceVariantElementDto(
            element.Id,
            element.ServiceVariantId,
            variant?.Description,
            element.Code,
            element.Description,
            element.CreatedAt
        );
    }
}
