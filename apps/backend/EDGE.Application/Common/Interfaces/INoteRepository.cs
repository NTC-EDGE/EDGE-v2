using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface INoteRepository
{
    Task AddAsync(Note note, CancellationToken cancellationToken = default);
    Task<Note?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Note>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<(List<Note> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    void Delete(Note note);
}
