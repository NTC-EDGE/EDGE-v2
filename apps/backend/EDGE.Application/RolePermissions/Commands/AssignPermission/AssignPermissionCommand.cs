using MediatR;

namespace EDGE.Application.RolePermissions.Commands;

public record AssignPermissionCommand(Guid RoleId, Guid PermissionId) : IRequest<bool>;
