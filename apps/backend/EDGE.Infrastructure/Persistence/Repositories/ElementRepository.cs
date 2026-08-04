using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ElementRepository : IElementRepository
{
    private readonly ApplicationDbContext _context;

    public ElementRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Element?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Elements
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<Element?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.Elements
            .FirstOrDefaultAsync(e => e.Code.ToLower() == code.ToLower(), cancellationToken);
    }

    public async Task<List<Element>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Elements
            .OrderBy(e => e.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Element element, CancellationToken cancellationToken = default)
    {
        await _context.Elements.AddAsync(element, cancellationToken);
    }

    public void Delete(Element element)
    {
        _context.Elements.Remove(element);
    }
}
