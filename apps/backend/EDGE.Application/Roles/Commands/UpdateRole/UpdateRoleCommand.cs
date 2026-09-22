using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Roles.Commands;

public record UpdateRoleCommand(Guid Id, string Name, string Key, string? Description = null) : IRequest<Role?>;
