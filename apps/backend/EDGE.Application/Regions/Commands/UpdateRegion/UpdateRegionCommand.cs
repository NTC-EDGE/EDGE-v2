using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Regions.Commands.UpdateRegion;

public record UpdateRegionCommand : IRequest<ApiResponse<string>>
{
    public required Guid Id { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
    public required bool IsActive { get; init; }
}
