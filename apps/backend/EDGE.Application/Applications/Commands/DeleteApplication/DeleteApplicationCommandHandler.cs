using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands;

public class DeleteApplicationCommandHandler : IRequestHandler<DeleteApplicationCommand, bool>
{
    private readonly IApplicationRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteApplicationCommandHandler(IApplicationRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteApplicationCommand request, CancellationToken cancellationToken)
    {
        var app = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (app == null) return false;

        _repository.Delete(app);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
