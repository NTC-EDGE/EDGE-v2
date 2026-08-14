using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ServiceNoteRepository : IServiceNoteRepository
{
    private readonly ApplicationDbContext _context;

    public ServiceNoteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(ServiceNote note, CancellationToken cancellationToken = default)
    {
        await _context.ServiceNotes.AddAsync(note, cancellationToken);
    }

    public async Task<ServiceNote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceNotes
            .Include(n => n.Service)
            .Include(n => n.ServiceVariant)
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
    }

    public async Task<List<ServiceNote>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ServiceNotes
            .Include(n => n.Service)
            .Include(n => n.ServiceVariant)
            .ToListAsync(cancellationToken);
    }

    public async Task<(List<ServiceNote> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.ServiceNotes.AsNoTracking()
            .Include(n => n.Service)
            .Include(n => n.ServiceVariant);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public void Delete(ServiceNote note)
    {
        _context.ServiceNotes.Remove(note);
    }
}
