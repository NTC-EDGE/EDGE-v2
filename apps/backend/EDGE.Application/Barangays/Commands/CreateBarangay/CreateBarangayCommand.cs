using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Barangays.Commands.CreateBarangay;

public record CreateBarangayCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid MunicipalityId { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
}
