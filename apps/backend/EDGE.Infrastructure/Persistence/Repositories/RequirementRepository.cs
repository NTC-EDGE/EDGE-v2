using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class RequirementRepository : IRequirementRepository
{
    private readonly ApplicationDbContext _context;

    public RequirementRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddRequirementAsync(Requirement requirement, CancellationToken cancellationToken = default)
    {
        await _context.Requirements.AddAsync(requirement, cancellationToken);
    }

    public async Task<Requirement?> GetRequirementByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Requirements.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<List<Requirement>> GetRequirementsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Requirements.OrderBy(r => r.Name).ToListAsync(cancellationToken);
    }

    public async Task<Requirement?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await GetRequirementByIdAsync(id, cancellationToken);
    }

    public async Task<List<Requirement>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await GetRequirementsAsync(cancellationToken);
    }

    public async Task AddAsync(Requirement requirement, CancellationToken cancellationToken = default)
    {
        await AddRequirementAsync(requirement, cancellationToken);
    }

    public void Delete(Requirement requirement)
    {
        _context.Requirements.Remove(requirement);
    }

    public async Task<bool> IsNameUniqueAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(name))
            return true;

        var query = _context.Requirements.AsQueryable();
        if (excludeId.HasValue)
        {
            query = query.Where(r => r.Id != excludeId.Value);
        }

        return !await query.AnyAsync(r => r.Name.ToLower() == name.ToLower(), cancellationToken);
    }

    public async Task AddServiceVariantRequirementAsync(ServiceVariantRequirement svr, CancellationToken cancellationToken = default)
    {
        await _context.ServiceVariantRequirements.AddAsync(svr, cancellationToken);
    }

    public async Task RemoveServiceVariantRequirementAsync(ServiceVariantRequirement svr, CancellationToken cancellationToken = default)
    {
        _context.ServiceVariantRequirements.Remove(svr);
        await Task.CompletedTask;
    }

    public async Task<ServiceVariantRequirement?> GetServiceVariantRequirementByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariantRequirements.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<List<ServiceVariantRequirement>> GetServiceVariantRequirementsAsync(Guid? serviceId, Guid? variantId, string? contextKey, CancellationToken cancellationToken = default)
    {
        var query = _context.ServiceVariantRequirements
            .Include(svr => svr.Requirement)
            .Include(svr => svr.ServiceVariant)
            .AsNoTracking();

        if (variantId.HasValue && variantId.Value != Guid.Empty)
        {
            query = query.Where(svr => svr.ServiceVariantId == variantId.Value);
        }
        else if (serviceId.HasValue && serviceId.Value != Guid.Empty)
        {
            query = query.Where(svr => svr.ServiceVariant != null && svr.ServiceVariant.ServiceId == serviceId.Value);
        }

        var list = await query.ToListAsync(cancellationToken);

        // Filter by ContextKey if provided.
        // Rows with ContextKey = null are catch-all rules (apply to any applicant of that variant).
        // Rows with a specific ContextKey apply only when the applicant's composed key matches exactly.
        if (!string.IsNullOrWhiteSpace(contextKey))
        {
            var cleanKey = contextKey.Trim();
            list = list.Where(svr =>
                string.IsNullOrEmpty(svr.ContextKey) ||
                svr.ContextKey.Equals(cleanKey, StringComparison.OrdinalIgnoreCase))
                   .ToList();
        }

        return list;
    }
}
