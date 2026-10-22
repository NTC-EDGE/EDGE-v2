using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.ConvertAssessmentToRealApplication;

public record ConvertAssessmentToRealApplicationCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ApplicationId { get; init; }
    public string? Remarks { get; init; }
}
