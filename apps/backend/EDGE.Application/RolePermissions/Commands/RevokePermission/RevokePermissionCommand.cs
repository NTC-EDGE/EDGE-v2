using MediatR;

namespace EDGE.Application.RolePermissions.Commands;

public record RevokePermissionCommand(Guid RoleId, Guid PermissionId) : IRequest<bool>;
