using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands;

public class UpdateApplicationCommandHandler : IRequestHandler<UpdateApplicationCommand, ApplicationRecord?>
{
    private readonly IApplicationRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateApplicationCommandHandler(IApplicationRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApplicationRecord?> Handle(UpdateApplicationCommand request, CancellationToken cancellationToken)
    {
        var app = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (app == null) return null;

        app.Title = request.Title;
        app.ApplicantName = request.ApplicantName;
        app.Status = request.Status;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return app;
    }
}
