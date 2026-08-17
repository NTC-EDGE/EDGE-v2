using MediatR;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Commands;

public record CreateTenantCommand(string Name, string Code, string? Description, Guid RegionId, bool IsActive = false) : IRequest<TenantDto>;
