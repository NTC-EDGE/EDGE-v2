using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Catalog.Services.Commands;

public record DeleteServiceCommand(Guid Id) : IRequest<bool>;

public class DeleteServiceCommandHandler : IRequestHandler<DeleteServiceCommand, bool>
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteServiceCommandHandler(
        IServiceRepository serviceRepository,
        IUnitOfWork unitOfWork)
    {
        _serviceRepository = serviceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.Id, cancellationToken);
        if (service is null)
        {
            return false;
        }

        _serviceRepository.Delete(service);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
