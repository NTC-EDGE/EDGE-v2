using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Regions.Commands.CreateRegion;

public record CreateRegionCommand : IRequest<ApiResponse<Guid>>
{
    public required string Code { get; init; }
    public required string Name { get; init; }
}
