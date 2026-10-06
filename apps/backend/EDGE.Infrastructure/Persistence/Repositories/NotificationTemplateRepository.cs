using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class NotificationTemplateRepository : INotificationTemplateRepository
{
    private readonly ApplicationDbContext _context;

    public NotificationTemplateRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(NotificationTemplate template, CancellationToken cancellationToken = default)
    {
        await _context.NotificationTemplates.AddAsync(template, cancellationToken);
    }

    public async Task<NotificationTemplate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.NotificationTemplates
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<NotificationTemplate?> GetByEventKeyAsync(string eventKey, CancellationToken cancellationToken = default)
    {
        return await _context.NotificationTemplates
            .FirstOrDefaultAsync(t => t.EventKey == eventKey, cancellationToken);
    }

    public async Task<List<NotificationTemplate>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.NotificationTemplates
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public void Update(NotificationTemplate template)
    {
        var entry = _context.Entry(template);
        if (entry.State == EntityState.Detached)
        {
            _context.NotificationTemplates.Update(template);
        }
    }
}
