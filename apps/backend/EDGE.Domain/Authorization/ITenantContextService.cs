using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Domain.Authorization;

public interface ITenantContextService
{
    Guid? TenantId { get; }
    Task<bool> IsUserActiveMemberAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<bool> IsUserActiveMemberOfCurrentTenantAsync(CancellationToken cancellationToken = default);
}
