using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class RequirementRepository : IRequirementRepository
{
    private readonly ApplicationDbContext _context;

    public RequirementRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Requirement?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Requirements
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<List<Requirement>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Requirements
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Requirement requirement, CancellationToken cancellationToken = default)
    {
        await _context.Requirements.AddAsync(requirement, cancellationToken);
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
}
