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
            // .Include(s => s.Tenant)
            // .Include(s => s.Service)
            // .Include(s => s.Application)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<List<Schedule>> GetAllAsync(Guid? tenantId = null, Guid? serviceId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Schedules
            .AsNoTracking()
            .AsQueryable();

        if (tenantId.HasValue && tenantId.Value != Guid.Empty)
        {
            query = query.Where(s => s.TenantId == tenantId.Value);
        }

        if (serviceId.HasValue && serviceId.Value != Guid.Empty)
        {
            query = query.Where(s => s.ServiceId == serviceId.Value);
        }

        return await query.OrderBy(s => s.StartDate).ToListAsync(cancellationToken);
    }

    public async Task<List<Schedule>> GetAvailableSchedulesAsync(Guid serviceId, Guid? tenantId = null, DateTime? date = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Schedules
            .AsNoTracking()
            .Where(s => s.ServiceId == serviceId && s.IsPublished);

        if (tenantId.HasValue && tenantId.Value != Guid.Empty)
        {
            query = query.Where(s => s.TenantId == tenantId.Value);
        }

        if (date.HasValue)
        {
            var targetDate = date.Value.Date;
            query = query.Where(s => s.StartDate.Date == targetDate);
        }
        else
        {
            // By default, return upcoming schedules
            query = query.Where(s => s.StartDate >= DateTime.UtcNow);
        }

        return await query.OrderBy(s => s.StartDate).ToListAsync(cancellationToken);
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
