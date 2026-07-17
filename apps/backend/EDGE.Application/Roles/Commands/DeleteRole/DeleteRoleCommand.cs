using MediatR;

namespace EDGE.Application.Roles.Commands;

public record DeleteRoleCommand(Guid Id) : IRequest<bool>;
