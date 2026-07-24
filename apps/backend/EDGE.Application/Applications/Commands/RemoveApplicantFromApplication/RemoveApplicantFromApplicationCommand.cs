using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.RemoveApplicantFromApplication;

public record RemoveApplicantFromApplicationCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ApplicationId { get; init; }
    public Guid ApplicantId { get; init; }
}
