using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ServiceVariantFormulaRepository : IServiceVariantFormulaRepository
{
    private readonly ApplicationDbContext _context;

    public ServiceVariantFormulaRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceVariantFormula?> GetByServiceVariantIdAsync(Guid serviceVariantId, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariantFormulas
            .Include(f => f.ServiceVariant)
            .FirstOrDefaultAsync(f => f.ServiceVariantId == serviceVariantId, cancellationToken);
    }

    public async Task<List<ServiceVariantFormula>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariantFormulas
            .Include(f => f.ServiceVariant)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(ServiceVariantFormula formula, CancellationToken cancellationToken = default)
    {
        await _context.ServiceVariantFormulas.AddAsync(formula, cancellationToken);
    }

    public void Delete(ServiceVariantFormula formula)
    {
        _context.ServiceVariantFormulas.Remove(formula);
    }

    public async Task<ServiceVariantElementFormula?> GetElementFormulaAsync(Guid serviceVariantId, Guid elementId, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariantElementFormulas
            .Include(f => f.ServiceVariant)
            .Include(f => f.Element)
            .FirstOrDefaultAsync(f => f.ServiceVariantId == serviceVariantId && f.ElementId == elementId, cancellationToken);
    }

    public async Task<List<ServiceVariantElementFormula>> GetAllElementFormulasAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariantElementFormulas
            .Include(f => f.ServiceVariant)
            .Include(f => f.Element)
            .ToListAsync(cancellationToken);
    }

    public async Task AddElementFormulaAsync(ServiceVariantElementFormula formula, CancellationToken cancellationToken = default)
    {
        await _context.ServiceVariantElementFormulas.AddAsync(formula, cancellationToken);
    }

    public void DeleteElementFormula(ServiceVariantElementFormula formula)
    {
        _context.ServiceVariantElementFormulas.Remove(formula);
    }

    public async Task<ServiceFormula?> GetServiceFormulaAsync(Guid serviceId, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceFormulas
            .Include(f => f.Service)
            .FirstOrDefaultAsync(f => f.ServiceId == serviceId && f.IsActive, cancellationToken);
    }
}
