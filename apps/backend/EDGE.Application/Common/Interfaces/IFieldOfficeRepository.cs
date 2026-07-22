using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IFieldOfficeRepository
{
    Task<List<FieldOffice>> GetAllAsync(Guid? regionId = null, CancellationToken cancellationToken = default);
    Task<FieldOffice?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(FieldOffice office, CancellationToken cancellationToken = default);
    void Delete(FieldOffice office);
    Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task<bool> HasApplicationsAsync(Guid officeId, CancellationToken cancellationToken = default);
}
