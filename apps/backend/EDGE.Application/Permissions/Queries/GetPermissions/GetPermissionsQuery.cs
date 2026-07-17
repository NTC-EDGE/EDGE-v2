using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Permissions.Queries;

public record GetPermissionsQuery() : IRequest<List<Permission>>;
