using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface ISoaNoteRepository
{
    Task AddAsync(SoaNote note, CancellationToken cancellationToken = default);
    Task<SoaNote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<SoaNote>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<(List<SoaNote> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, string? searchTerm, CancellationToken cancellationToken = default);
    void Delete(SoaNote note);
}
