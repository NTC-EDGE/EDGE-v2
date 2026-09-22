namespace EDGE.Application.Common.Interfaces;

public interface IUserAuthorizationService
{
    Task<bool> HasPermissionAsync(string permission, CancellationToken cancellationToken = default);
    Task<bool> HasAnyPermissionAsync(IEnumerable<string> permissions, CancellationToken cancellationToken = default);
    Task<bool> HasAllPermissionsAsync(IEnumerable<string> permissions, CancellationToken cancellationToken = default);
    Task<bool> HasRoleAsync(string role, CancellationToken cancellationToken = default);
    Task<List<string>> GetUserPermissionsAsync(CancellationToken cancellationToken = default);
    Task<bool> IsInternalUserAsync(CancellationToken cancellationToken = default);
    Task<bool> CanSubmitApplicationAsync(CancellationToken cancellationToken = default);
}
