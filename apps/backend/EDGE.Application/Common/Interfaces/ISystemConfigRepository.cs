using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface ISystemConfigRepository
{
    Task AddAsync(SystemConfig config, CancellationToken cancellationToken = default);
    Task<SystemConfig?> GetByKeyAsync(string key, CancellationToken cancellationToken = default);
    Task<List<SystemConfig>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default);
    Task<List<SystemConfig>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<List<SystemConfig>> GetPublicConfigsAsync(CancellationToken cancellationToken = default);
    void Update(SystemConfig config);
}
