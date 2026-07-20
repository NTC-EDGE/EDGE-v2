using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Municipalities.Commands.CreateMunicipality;

public record CreateMunicipalityCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid ProvinceId { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
}
