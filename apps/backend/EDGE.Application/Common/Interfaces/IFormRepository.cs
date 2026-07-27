using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IFormRepository
{
    Task<Form?> GetFormByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default);
    Task<Form?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Form>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Form form, CancellationToken cancellationToken = default);
    void Update(Form form);
    void Delete(Form form);
}
