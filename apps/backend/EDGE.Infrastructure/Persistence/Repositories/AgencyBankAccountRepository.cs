using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class AgencyBankAccountRepository : IAgencyBankAccountRepository
{
    private readonly ApplicationDbContext _context;

    public AgencyBankAccountRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AgencyBankAccount?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.AgencyBankAccounts
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<List<AgencyBankAccount>> GetByTenantAsync(Guid tenantId, bool? activeOnly = null, CancellationToken cancellationToken = default)
    {
        var query = _context.AgencyBankAccounts
            .AsNoTracking()
            .Where(b => b.TenantId == tenantId);

        if (activeOnly == true)
        {
            query = query.Where(b => b.IsActive);
        }

        return await query
            .OrderBy(b => b.BankName)
            .ThenBy(b => b.AccountName)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAccountNumberAsync(Guid tenantId, string accountNumber, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.AgencyBankAccounts
            .Where(b => b.TenantId == tenantId && b.AccountNumber == accountNumber);

        if (excludeId.HasValue)
        {
            query = query.Where(b => b.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task AddAsync(AgencyBankAccount account, CancellationToken cancellationToken = default)
    {
        await _context.AgencyBankAccounts.AddAsync(account, cancellationToken);
    }

    public Task UpdateAsync(AgencyBankAccount account, CancellationToken cancellationToken = default)
    {
        _context.AgencyBankAccounts.Update(account);
        return Task.CompletedTask;
    }
}
