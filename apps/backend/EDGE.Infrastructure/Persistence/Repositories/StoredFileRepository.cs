using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class StoredFileRepository : IStoredFileRepository
{
    private readonly ApplicationDbContext _context;

    public StoredFileRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<StoredFile?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.StoredFiles
            .Include(f => f.Tenant)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<StoredFile?> GetByStorageKeyAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        return await _context.StoredFiles
            .Include(f => f.Tenant)
            .FirstOrDefaultAsync(f => f.StorageKey == storageKey, cancellationToken);
    }

    public async Task<IEnumerable<StoredFile>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.StoredFiles
            .Where(f => f.TenantId == tenantId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(StoredFile storedFile, CancellationToken cancellationToken = default)
    {
        await _context.StoredFiles.AddAsync(storedFile, cancellationToken);
    }

    public void Update(StoredFile storedFile)
    {
        var entry = _context.Entry(storedFile);
        if (entry.State == EntityState.Detached)
        {
            _context.StoredFiles.Update(storedFile);
        }
    }

    public void Delete(StoredFile storedFile)
    {
        _context.StoredFiles.Remove(storedFile);
    }
}
