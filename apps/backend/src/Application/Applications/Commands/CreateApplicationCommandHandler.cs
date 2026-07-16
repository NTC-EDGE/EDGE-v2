using MediatR;
using NtcEdge.Domain.Entities;

namespace NtcEdge.Application.Applications.Commands;

public class CreateApplicationCommandHandler : IRequestHandler<CreateApplicationCommand, ApplicationRecord>
{
    public Task<ApplicationRecord> Handle(CreateApplicationCommand request, CancellationToken cancellationToken)
    {
        var app = new ApplicationRecord
        {
            Title = request.Title,
            ApplicantName = request.ApplicantName,
            Status = "Submitted"
        };

        return Task.FromResult(app);
    }
}
