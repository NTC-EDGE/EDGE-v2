using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.ReprocessAssessment;

public record ReprocessAssessmentCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ApplicationId { get; init; }
    public string? Remarks { get; init; }
}
