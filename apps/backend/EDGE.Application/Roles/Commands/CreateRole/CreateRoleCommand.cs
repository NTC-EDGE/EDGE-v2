using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Roles.Commands;

public record CreateRoleCommand(string Name, string Key) : IRequest<Role>;
