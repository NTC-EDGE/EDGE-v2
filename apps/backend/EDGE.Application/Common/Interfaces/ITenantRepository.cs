using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface ITenantRepository
{
    Task AddAsync(Tenant tenant, CancellationToken cancellationToken = default);
    Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Tenant?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<List<Tenant>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<List<EDGE.Application.Tenants.DTOs.TenantClientDto>> GetTenantClientsAsync(Guid tenantId, string? search = null, CancellationToken cancellationToken = default);
    Task<List<EDGE.Application.Tenants.DTOs.TenantTransactionDto>> GetTenantTransactionsAsync(Guid tenantId, CancellationToken cancellationToken = default);
    void Delete(Tenant tenant);
}
