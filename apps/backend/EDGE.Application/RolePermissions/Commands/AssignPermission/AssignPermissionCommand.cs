using MediatR;

namespace EDGE.Application.RolePermissions.Commands;

public record AssignPermissionCommand(Guid RoleId, string PermissionKey) : IRequest<bool>;
