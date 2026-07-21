using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IScheduleRepository
{
    Task AddAsync(Schedule schedule, CancellationToken cancellationToken = default);
    Task<Schedule?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Schedule>> GetAllAsync(Guid? tenantId = null, Guid? serviceId = null, CancellationToken cancellationToken = default);
    Task<List<Schedule>> GetAvailableSchedulesAsync(Guid serviceId, Guid tenantId, DateTime? date = null, CancellationToken cancellationToken = default);
    void Update(Schedule schedule);
    void Delete(Schedule schedule);
}
