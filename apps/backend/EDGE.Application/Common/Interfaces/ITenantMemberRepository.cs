using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface ITenantMemberRepository
{
    Task AddAsync(TenantMember member, CancellationToken cancellationToken = default);
    Task<TenantMember?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TenantMember?> GetByTenantAndUserAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default);
    Task<List<TenantMember>> GetMembersByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<TenantMember>> GetMembersByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    void Delete(TenantMember member);
}
