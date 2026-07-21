using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Roles.Queries;

public record GetRoleByIdQuery(Guid Id) : IRequest<Role?>;
