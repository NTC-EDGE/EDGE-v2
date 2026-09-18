using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Common.Interfaces;

public interface IOfficialReceiptRepository
{
    Task<OfficialReceipt?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<OfficialReceipt?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<OfficialReceipt?> GetByOrNumberAsync(Guid tenantId, string orNumber, CancellationToken cancellationToken = default);
    Task<List<OfficialReceipt>> GetByTenantAsync(
        Guid tenantId,
        ReceiptStatus? status = null,
        PaymentMethod? paymentMethod = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        Guid? cashierUserId = null,
        string? search = null,
        CancellationToken cancellationToken = default);
    Task<List<OfficialReceipt>> GetUndepositedReceiptsAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<bool> ExistsOrNumberAsync(Guid tenantId, string orNumber, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(OfficialReceipt receipt, CancellationToken cancellationToken = default);
    Task UpdateAsync(OfficialReceipt receipt, CancellationToken cancellationToken = default);
}
