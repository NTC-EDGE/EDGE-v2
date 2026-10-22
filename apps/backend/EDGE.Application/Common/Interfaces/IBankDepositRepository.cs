using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Common.Interfaces;

public interface IBankDepositRepository
{
    Task<BankDeposit?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<BankDeposit?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<BankDeposit>> GetByTenantAsync(
        Guid tenantId,
        Guid? bankAccountId = null,
        DepositStatus? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        CancellationToken cancellationToken = default);
    Task<bool> ExistsDepositSlipNumberAsync(Guid tenantId, string depositSlipNumber, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(BankDeposit deposit, CancellationToken cancellationToken = default);
    Task UpdateAsync(BankDeposit deposit, CancellationToken cancellationToken = default);
}
