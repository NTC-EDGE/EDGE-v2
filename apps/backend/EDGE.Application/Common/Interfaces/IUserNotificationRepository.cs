using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IUserNotificationRepository
{
    Task<UserNotification> CreateNotificationAsync(UserNotification notification, CancellationToken cancellationToken = default);
    Task<List<UserNotification>> CreateNotificationsAsync(IEnumerable<UserNotification> notifications, CancellationToken cancellationToken = default);
    Task<List<UserNotification>> GetUserNotificationsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> MarkAsReadAsync(Guid notificationId, CancellationToken cancellationToken = default);
}
