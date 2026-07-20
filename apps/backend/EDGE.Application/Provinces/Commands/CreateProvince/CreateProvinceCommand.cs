using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Provinces.Commands.CreateProvince;

public record CreateProvinceCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid RegionId { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
}
