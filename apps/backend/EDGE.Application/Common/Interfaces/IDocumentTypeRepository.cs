using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IDocumentTypeRepository
{
    Task AddAsync(DocumentType docType, CancellationToken cancellationToken = default);
    Task<DocumentType?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<DocumentType>> GetAllAsync(bool activeOnly = false, CancellationToken cancellationToken = default);
    void Update(DocumentType docType);
    void Delete(DocumentType docType);
}
