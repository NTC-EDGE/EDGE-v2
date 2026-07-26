using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Requirements.Commands.CreateRequirement;

public record CreateRequirementCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; init; }
    public string? Description { get; init; }
}
