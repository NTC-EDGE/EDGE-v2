using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IStoredFileRepository
{
    Task<StoredFile?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<StoredFile?> GetByStorageKeyAsync(string storageKey, CancellationToken cancellationToken = default);
    Task<IEnumerable<StoredFile>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(StoredFile storedFile, CancellationToken cancellationToken = default);
    void Update(StoredFile storedFile);
    void Delete(StoredFile storedFile);
}
