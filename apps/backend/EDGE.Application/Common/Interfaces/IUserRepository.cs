using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public record StaffUserContext(Guid? UserId, string StaffName, string StaffRole);

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByAuthUserIdAsync(string authUserId, CancellationToken cancellationToken = default);
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<User>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<(List<User> Items, int TotalCount)> GetPaginatedUsersAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        Guid? tenantId = null,
        Guid? regionId = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default);
    Task<StaffUserContext> GetStaffUserContextAsync(string? userIdStr, string defaultRole, CancellationToken cancellationToken = default);
    Task<User?> ResolveCurrentUserAsync(ICurrentUserService currentUserService, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    void Delete(User user);
}
