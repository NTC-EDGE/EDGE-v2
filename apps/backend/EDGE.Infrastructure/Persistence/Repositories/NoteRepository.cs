using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class NoteRepository : INoteRepository
{
    private readonly ApplicationDbContext _context;

    public NoteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Note note, CancellationToken cancellationToken = default)
    {
        await _context.Notes.AddAsync(note, cancellationToken);
    }

    public async Task<Note?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Notes
            .Include(n => n.Service)
            .Include(n => n.ServiceVariant)
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
    }

    public async Task<List<Note>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Notes
            .Include(n => n.Service)
            .Include(n => n.ServiceVariant)
            .ToListAsync(cancellationToken);
    }

    public async Task<(List<Note> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Notes.AsNoTracking()
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

    public void Delete(Note note)
    {
        _context.Notes.Remove(note);
    }
}
