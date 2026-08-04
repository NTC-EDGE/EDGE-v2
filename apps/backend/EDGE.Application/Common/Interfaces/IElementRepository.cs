using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IElementRepository
{
    Task<Element?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Element?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<List<Element>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Element element, CancellationToken cancellationToken = default);
    void Delete(Element element);
}
