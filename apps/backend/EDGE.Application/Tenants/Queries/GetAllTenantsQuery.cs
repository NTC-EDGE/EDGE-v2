using MediatR;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries;

public record GetAllTenantsQuery : IRequest<List<TenantDto>>;
