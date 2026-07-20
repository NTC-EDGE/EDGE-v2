using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Barangays.Commands.UpdateBarangay;

public record UpdateBarangayCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid Id { get; init; }
    public required Guid MunicipalityId { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
    public required bool IsActive { get; init; }
}
