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
        var direct = await _context.ServiceVariantElementFormulas
            .Include(f => f.ServiceVariant)
            .Include(f => f.Element)
            .FirstOrDefaultAsync(f => f.ServiceVariantId == serviceVariantId && f.ElementId == elementId, cancellationToken);

        if (direct != null)
        {
            return direct;
        }

        // Fallback if caller passed ServiceVariantElement.Id instead of Element.Id: resolve by Code
        var variantElement = await _context.ServiceVariantElements
            .AsNoTracking()
            .FirstOrDefaultAsync(sve => sve.Id == elementId && sve.ServiceVariantId == serviceVariantId, cancellationToken);

        if (variantElement != null && !string.IsNullOrWhiteSpace(variantElement.Code))
        {
            var code = variantElement.Code.Trim();
            return await _context.ServiceVariantElementFormulas
                .Include(f => f.ServiceVariant)
                .Include(f => f.Element)
                .FirstOrDefaultAsync(
                    f => f.ServiceVariantId == serviceVariantId &&
                         f.Element != null &&
                         (f.Element.Code.ToLower() == code.ToLower() || f.Element.Name.ToLower() == code.ToLower()),
                    cancellationToken);
        }

        return null;
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
