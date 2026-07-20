using MediatR;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Commands;

public record UpdateTenantCommand(Guid Id, string Name, string Code, string? Description, bool IsActive, Guid RegionId) : IRequest<TenantDto>;
