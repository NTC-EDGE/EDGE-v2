using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IServiceNoteRepository
{
    Task AddAsync(ServiceNote note, CancellationToken cancellationToken = default);
    Task<ServiceNote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ServiceNote>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<(List<ServiceNote> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    void Delete(ServiceNote note);
}
