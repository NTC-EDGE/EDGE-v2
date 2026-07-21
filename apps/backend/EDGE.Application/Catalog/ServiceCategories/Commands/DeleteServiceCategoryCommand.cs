using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Exceptions;

namespace EDGE.Application.Catalog.ServiceCategories.Commands;

public record DeleteServiceCategoryCommand(Guid Id) : IRequest<bool>;

public class DeleteServiceCategoryCommandHandler : IRequestHandler<DeleteServiceCategoryCommand, bool>
{
    private readonly IServiceCategoryRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteServiceCategoryCommandHandler(
        IServiceCategoryRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteServiceCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (category is null)
        {
            return false;
        }

        _repository.Delete(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
