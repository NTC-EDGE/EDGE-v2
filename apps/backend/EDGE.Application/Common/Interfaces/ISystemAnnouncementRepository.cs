using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface ISystemAnnouncementRepository
{
    Task AddAsync(SystemAnnouncement announcement, CancellationToken cancellationToken = default);
    Task<SystemAnnouncement?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<SystemAnnouncement>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<(List<SystemAnnouncement> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    void Update(SystemAnnouncement announcement);
    void Delete(SystemAnnouncement announcement);
}
