using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface INotificationTemplateRepository
{
    Task AddAsync(NotificationTemplate template, CancellationToken cancellationToken = default);
    Task<NotificationTemplate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<NotificationTemplate?> GetByEventKeyAsync(string eventKey, CancellationToken cancellationToken = default);
    Task<List<NotificationTemplate>> GetAllAsync(CancellationToken cancellationToken = default);
    void Update(NotificationTemplate template);
}
