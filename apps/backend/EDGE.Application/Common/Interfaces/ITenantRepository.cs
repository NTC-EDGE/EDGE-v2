using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface ITenantRepository
{
    Task AddAsync(Tenant tenant, CancellationToken cancellationToken = default);
    Task<Tenant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Tenant?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<List<Tenant>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<(List<EDGE.Application.Tenants.DTOs.TenantClientDto> Items, int TotalCount)> GetTenantClientsAsync(
        Guid tenantId,
        string? search = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);

    Task<(List<EDGE.Application.Tenants.DTOs.TenantTransactionDto> Items, int TotalCount)> GetTenantTransactionsAsync(
        Guid tenantId,
        string? search = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);

    Task<EDGE.Application.Tenants.DTOs.TenantClientDetailsDto?> GetTenantClientDetailsAsync(
        Guid tenantId,
        Guid clientId,
        CancellationToken cancellationToken = default);

    void Delete(Tenant tenant);
}
