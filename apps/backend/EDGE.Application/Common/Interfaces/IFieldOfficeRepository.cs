using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IFieldOfficeRepository
{
    Task AddAsync(FieldOffice fieldOffice, CancellationToken cancellationToken = default);
    Task<FieldOffice?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<FieldOffice>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<FieldOffice>> GetFilteredAsync(Guid? tenantId = null, Guid? regionId = null, CancellationToken cancellationToken = default);
    Task<List<FieldOffice>> GetAllAsync(CancellationToken cancellationToken = default);
    void Delete(FieldOffice fieldOffice);
    Task<bool> IsCodeUniqueAsync(Guid tenantId, string code, Guid? excludeId = null, CancellationToken cancellationToken = default);
}
