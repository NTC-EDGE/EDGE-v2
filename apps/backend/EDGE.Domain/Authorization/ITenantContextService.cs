using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Domain.Authorization;

public interface ITenantContextService
{
    Guid? TenantId { get; }
    Task<bool> IsCurrentUserSuperAdminAsync(CancellationToken cancellationToken = default);
    Task<bool> IsUserActiveMemberAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<bool> IsUserActiveMemberOfCurrentTenantAsync(CancellationToken cancellationToken = default);
    Task<List<Guid>> GetUserActiveTenantIdsAsync(CancellationToken cancellationToken = default);
    Task EnsureUserActiveMemberAsync(Guid tenantId, string? customErrorMessage = null, CancellationToken cancellationToken = default);
}
