using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Persistence;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class UserNotificationRepository : IUserNotificationRepository
{
    private readonly ApplicationDbContext _context;

    public UserNotificationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserNotification> CreateNotificationAsync(UserNotification notification, CancellationToken cancellationToken = default)
    {
        await _context.UserNotifications.AddAsync(notification, cancellationToken);
        return notification;
    }

    public async Task<List<UserNotification>> CreateNotificationsAsync(IEnumerable<UserNotification> notifications, CancellationToken cancellationToken = default)
    {
        var list = notifications.ToList();
        await _context.UserNotifications.AddRangeAsync(list, cancellationToken);
        return list;
    }

    public async Task<List<UserNotification>> GetUserNotificationsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.UserNotifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> MarkAsReadAsync(Guid notificationId, CancellationToken cancellationToken = default)
    {
        var notif = await _context.UserNotifications.FindAsync(new object[] { notificationId }, cancellationToken);
        if (notif == null) return false;

        notif.IsRead = true;
        notif.ReadAt = DateTimeOffset.UtcNow;
        return true;
    }
}
