using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class BankDepositRepository : IBankDepositRepository
{
    private readonly ApplicationDbContext _context;

    public BankDepositRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BankDeposit?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.BankDeposits
            .Include(d => d.BankAccount)
            .Include(d => d.DepositedByUser)
            .Include(d => d.VerifiedByUser)
            .Include(d => d.Receipts)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task<BankDeposit?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.BankDeposits
            .Include(d => d.BankAccount)
            .Include(d => d.DepositedByUser)
            .Include(d => d.VerifiedByUser)
            .Include(d => d.DepositSlipAttachment)
            .Include(d => d.Receipts)
                .ThenInclude(r => r.LineItems)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task<List<BankDeposit>> GetByTenantAsync(
        Guid tenantId,
        Guid? bankAccountId = null,
        DepositStatus? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.BankDeposits
            .AsNoTracking()
            .Include(d => d.BankAccount)
            .Include(d => d.DepositedByUser)
            .Include(d => d.VerifiedByUser)
            .Include(d => d.Receipts)
            .Where(d => tenantId == Guid.Empty || d.TenantId == tenantId);

        if (bankAccountId.HasValue)
        {
            query = query.Where(d => d.BankAccountId == bankAccountId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(d => d.Status == status.Value);
        }

        if (fromDate.HasValue)
        {
            var fromUtc = DateTime.SpecifyKind(fromDate.Value.Date, DateTimeKind.Utc);
            query = query.Where(d => d.DepositDate >= fromUtc);
        }

        if (toDate.HasValue)
        {
            var toUtc = DateTime.SpecifyKind(toDate.Value.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);
            query = query.Where(d => d.DepositDate <= toUtc);
        }

        return await query
            .OrderByDescending(d => d.DepositDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsDepositSlipNumberAsync(Guid tenantId, string depositSlipNumber, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.BankDeposits
            .Where(d => (tenantId == Guid.Empty || d.TenantId == tenantId) && d.DepositSlipNumber == depositSlipNumber);

        if (excludeId.HasValue)
        {
            query = query.Where(d => d.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task AddAsync(BankDeposit deposit, CancellationToken cancellationToken = default)
    {
        await _context.BankDeposits.AddAsync(deposit, cancellationToken);
    }

    public Task UpdateAsync(BankDeposit deposit, CancellationToken cancellationToken = default)
    {
        var entry = _context.Entry(deposit);
        if (entry.State == EntityState.Detached)
        {
            _context.BankDeposits.Update(deposit);
        }
        return Task.CompletedTask;
    }
}
