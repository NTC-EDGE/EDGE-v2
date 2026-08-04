using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IScheduleRepository
{
    Task AddAsync(Schedule schedule, CancellationToken cancellationToken = default);
    Task<Schedule?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(List<Schedule> Items, int TotalCount)> GetAllAsync(Guid? tenantId = null, Guid? serviceId = null, int pageNumber = 1, int pageSize = 10, CancellationToken cancellationToken = default);
    Task<(List<Schedule> Items, int TotalCount)> GetAvailableSchedulesAsync(Guid serviceId, Guid tenantId, DateTime? date = null, int pageNumber = 1, int pageSize = 10, CancellationToken cancellationToken = default);
    void Update(Schedule schedule);
    void Delete(Schedule schedule);
}
