using MediatR;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries;

public record GetTenantByIdQuery(Guid Id) : IRequest<TenantDto>;
