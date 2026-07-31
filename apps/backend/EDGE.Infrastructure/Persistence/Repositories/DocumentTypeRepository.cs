using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class DocumentTypeRepository : IDocumentTypeRepository
{
    private readonly ApplicationDbContext _context;

    public DocumentTypeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(DocumentType docType, CancellationToken cancellationToken = default)
    {
        await _context.DocumentTypes.AddAsync(docType, cancellationToken);
    }

    public async Task<DocumentType?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.DocumentTypes
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task<List<DocumentType>> GetAllAsync(bool activeOnly = false, CancellationToken cancellationToken = default)
    {
        var query = _context.DocumentTypes.AsNoTracking();
        if (activeOnly)
        {
            query = query.Where(d => d.IsActive);
        }
        return await query.OrderBy(d => d.Name).ToListAsync(cancellationToken);
    }

    public void Update(DocumentType docType)
    {
        _context.DocumentTypes.Update(docType);
    }

    public void Delete(DocumentType docType)
    {
        _context.DocumentTypes.Remove(docType);
    }
}
