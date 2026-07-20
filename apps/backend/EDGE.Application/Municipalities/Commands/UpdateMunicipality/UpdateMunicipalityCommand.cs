using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Municipalities.Commands.UpdateMunicipality;

public record UpdateMunicipalityCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid Id { get; init; }
    public required Guid ProvinceId { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
    public required bool IsActive { get; init; }
}
