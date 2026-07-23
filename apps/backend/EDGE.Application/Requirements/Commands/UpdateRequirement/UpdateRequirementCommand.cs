using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Requirements.Commands.UpdateRequirement;

public record UpdateRequirementCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
}
