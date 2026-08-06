using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ScheduleRepository : IScheduleRepository
{
    private readonly ApplicationDbContext _context;

    public ScheduleRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Schedule schedule, CancellationToken cancellationToken = default)
    {
        await _context.Schedules.AddAsync(schedule, cancellationToken);
    }

    public async Task<Schedule?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Schedules
            .AsNoTracking()
            .Include(s => s.Service)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<(List<Schedule> Items, int TotalCount)> GetAllAsync(
        Guid? tenantId = null,
        Guid? serviceId = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Schedules
            .AsNoTracking()
            .Include(s => s.Service)
            .AsQueryable();

        if (tenantId.HasValue && tenantId.Value != Guid.Empty)
        {
            query = query.Where(s => s.TenantId == tenantId.Value);
        }

        if (serviceId.HasValue && serviceId.Value != Guid.Empty)
        {
            query = query.Where(s => s.ServiceId == serviceId.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var page = pageNumber <= 0 ? 1 : pageNumber;
        var size = pageSize <= 0 ? 10 : pageSize;

        var items = await query.OrderBy(s => s.StartDate)
                               .Skip((page - 1) * size)
                               .Take(size)
                               .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(List<Schedule> Items, int TotalCount)> GetAvailableSchedulesAsync(
        Guid serviceId,
        Guid tenantId,
        DateTime? date = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var referenceDate = date.HasValue ? DateTime.SpecifyKind(date.Value, DateTimeKind.Utc) : DateTime.UtcNow;

        var query = _context.Schedules
            .AsNoTracking()
            .Include(s => s.Service)
            .Where(s => s.ServiceId == serviceId && s.TenantId == tenantId && s.IsPublished)
            // Filter by application window
            .Where(s => (s.StartApplication == null || s.StartApplication <= referenceDate) &&
                        (s.EndApplication == null || s.EndApplication >= referenceDate))
            // Only return schedules that haven't ended yet
            .Where(s => s.EndDate >= referenceDate);

        var totalCount = await query.CountAsync(cancellationToken);

        var page = pageNumber <= 0 ? 1 : pageNumber;
        var size = pageSize <= 0 ? 10 : pageSize;

        var items = await query.OrderBy(s => s.StartDate)
                               .Skip((page - 1) * size)
                               .Take(size)
                               .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public void Update(Schedule schedule)
    {
        _context.Schedules.Update(schedule);
    }

    public void Delete(Schedule schedule)
    {
        _context.Schedules.Remove(schedule);
    }
}
