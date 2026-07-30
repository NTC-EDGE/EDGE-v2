using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Elements.Commands.DeleteElement;

public class DeleteElementCommandHandler : IRequestHandler<DeleteElementCommand, bool>
{
    private readonly IElementRepository _elementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteElementCommandHandler(IElementRepository elementRepository, IUnitOfWork unitOfWork)
    {
        _elementRepository = elementRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteElementCommand request, CancellationToken cancellationToken)
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
