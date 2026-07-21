using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface ITenantMemberRepository
{
    Task<TenantMember?> GetMemberAsync(Guid userId, Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<TenantMember>> GetMembersOfTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<TenantMember>> GetTenantsForUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(TenantMember member, CancellationToken cancellationToken = default);
    void Delete(TenantMember member);
}
