using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IAgencyBankAccountRepository
{
    Task<AgencyBankAccount?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<AgencyBankAccount>> GetByTenantAsync(Guid tenantId, bool? activeOnly = null, CancellationToken cancellationToken = default);
    Task<bool> ExistsAccountNumberAsync(Guid tenantId, string accountNumber, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(AgencyBankAccount account, CancellationToken cancellationToken = default);
    Task UpdateAsync(AgencyBankAccount account, CancellationToken cancellationToken = default);
}
