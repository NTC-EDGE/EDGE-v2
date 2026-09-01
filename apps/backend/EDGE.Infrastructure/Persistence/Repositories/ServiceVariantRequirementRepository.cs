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

    public async Task<List<ServiceVariantRequirement>> GetByServiceVariantIdAsync(Guid? serviceVariantId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.ServiceVariantRequirements
            .Include(svr => svr.Requirement)
            .Include(svr => svr.ServiceVariant)
                .ThenInclude(sv => sv!.Service)
            .OrderBy(svr => svr.CreatedAt)
            .AsQueryable();

        if (serviceVariantId.HasValue && serviceVariantId.Value != Guid.Empty)
        {
            query = query.Where(svr => svr.ServiceVariantId == serviceVariantId.Value);
        }

        var list = await query.ToListAsync(cancellationToken);
        return list.OrderBy(svr => svr.CreatedAt).ToList();
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
