using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Catalog.ServiceVariants.Commands;

public record DeleteServiceVariantCommand(Guid Id, Guid ServiceId) : IRequest<bool>;

public class DeleteServiceVariantCommandHandler : IRequestHandler<DeleteServiceVariantCommand, bool>
{
    private readonly IServiceVariantRepository _variantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteServiceVariantCommandHandler(
        IServiceVariantRepository variantRepository,
        IUnitOfWork unitOfWork)
    {
        _variantRepository = variantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteServiceVariantCommand request, CancellationToken cancellationToken)
    {
        var variant = await _variantRepository.GetByIdAsync(request.Id, cancellationToken);
        if (variant is null || variant.ServiceId != request.ServiceId)
        {
            return false;
        }

        _variantRepository.Delete(variant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
