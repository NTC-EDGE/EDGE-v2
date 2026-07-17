using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Provinces.Commands.UpdateProvince;

public record UpdateProvinceCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid Id { get; init; }
    public required Guid RegionId { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
    public required bool IsActive { get; init; }
}
