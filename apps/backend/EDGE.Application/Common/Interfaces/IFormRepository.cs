using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Common.Interfaces;

public interface IFormRepository
{
    Task<Form?> GetFormByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default);
    Task<Form?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Form>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<List<Field>> GetFieldsByIdsAsync(IEnumerable<Guid> fieldIds, CancellationToken cancellationToken = default);
    Task AddAsync(Form form, CancellationToken cancellationToken = default);
    void Update(Form form);
    void Delete(Form form);
    Task<Form> SaveFormStructureAsync(
        Guid formId,
        Guid serviceId,
        string version,
        bool categorySelectionRequired,
        List<FormSectionDto> incomingSections,
        string? name = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default);
    Task<Form?> SetFormActiveAsync(Guid formId, CancellationToken cancellationToken = default);
    Task<List<Form>> GetVersionsByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default);
}
