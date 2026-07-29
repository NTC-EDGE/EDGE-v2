using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class SystemAnnouncementRepository : ISystemAnnouncementRepository
{
    private readonly ApplicationDbContext _context;

    public SystemAnnouncementRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(SystemAnnouncement announcement, CancellationToken cancellationToken = default)
    {
        await _context.SystemAnnouncements.AddAsync(announcement, cancellationToken);
    }

    public async Task<SystemAnnouncement?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.SystemAnnouncements
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<List<SystemAnnouncement>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SystemAnnouncements
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(List<SystemAnnouncement> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.SystemAnnouncements.AsNoTracking();
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public void Update(SystemAnnouncement announcement)
    {
        _context.SystemAnnouncements.Update(announcement);
    }

    public void Delete(SystemAnnouncement announcement)
    {
        _context.SystemAnnouncements.Remove(announcement);
    }
}
