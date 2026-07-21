using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands;

public class CreateApplicationCommandHandler : IRequestHandler<CreateApplicationCommand, ApplicationRecord>
{
    private readonly IApplicationRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateApplicationCommandHandler(IApplicationRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApplicationRecord> Handle(CreateApplicationCommand request, CancellationToken cancellationToken)
    {
        var app = new ApplicationRecord
        {
            Title = request.Title,
            ApplicantName = request.ApplicantName,
            Status = ApplicationStatus.Submitted
        };

        await _repository.AddAsync(app, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return app;
    }
}
