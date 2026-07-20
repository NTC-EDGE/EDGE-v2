using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Roles.Queries;

public record GetRolesQuery(Guid? TenantId = null) : IRequest<List<Role>>;
