using MediatR;

namespace EDGE.Application.RolePermissions.Commands;

public record RevokePermissionCommand(Guid RoleId, string PermissionKey) : IRequest<bool>;
