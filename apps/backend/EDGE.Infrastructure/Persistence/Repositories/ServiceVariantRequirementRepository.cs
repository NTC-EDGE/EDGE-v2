using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ServiceVariantRequirementRepository : IServiceVariantRequirementRepository
{
    private readonly ApplicationDbContext _context;

    public ServiceVariantRequirementRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceVariantRequirement?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariantRequirements
            .Include(svr => svr.Requirement)
            .Include(svr => svr.ServiceVariant)
            .FirstOrDefaultAsync(svr => svr.Id == id, cancellationToken);
    }

    public async Task<List<ServiceVariantRequirement>> GetByServiceVariantIdAsync(Guid serviceVariantId, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariantRequirements
            .Include(svr => svr.Requirement)
            .Where(svr => svr.ServiceVariantId == serviceVariantId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(ServiceVariantRequirement serviceVariantRequirement, CancellationToken cancellationToken = default)
    {
        await _context.ServiceVariantRequirements.AddAsync(serviceVariantRequirement, cancellationToken);
    }

    public void Delete(ServiceVariantRequirement serviceVariantRequirement)
    {
        _context.ServiceVariantRequirements.Remove(serviceVariantRequirement);
    }
}
