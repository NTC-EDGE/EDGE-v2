using MediatR;
using EDGE.Application.Common.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Application.ServiceVariantElements.Commands.DeleteServiceVariantElement;

public class DeleteServiceVariantElementCommandHandler
    : IRequestHandler<DeleteServiceVariantElementCommand, bool>
{
    private readonly IServiceVariantElementRepository _elementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteServiceVariantElementCommandHandler(
        IServiceVariantElementRepository elementRepository,
        IUnitOfWork unitOfWork)
    {
        _elementRepository = elementRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(
        DeleteServiceVariantElementCommand request,
        CancellationToken cancellationToken)
    {
        var element = await _elementRepository.GetByIdAsync(request.Id, cancellationToken);
        if (element == null)
        {
            return false;
        }

        _elementRepository.Delete(element);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
