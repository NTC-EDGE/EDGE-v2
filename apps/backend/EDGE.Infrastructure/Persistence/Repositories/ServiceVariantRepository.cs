using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ServiceVariantRepository : IServiceVariantRepository
{
    private readonly ApplicationDbContext _context;

    public ServiceVariantRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceVariant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariants
            .Include(v => v.Service)
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }

    public async Task<List<ServiceVariant>> GetByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariants
            .Where(v => v.ServiceId == serviceId)
            .Include(v => v.Service)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ServiceVariant>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariants
            .Include(v => v.Service)
            .ToListAsync(cancellationToken);
    }

    public async Task<(List<ServiceVariant> Items, int TotalCount)> GetPagedAsync(
        Guid? serviceId = null,
        Guid? categoryId = null,
        string? searchTerm = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ServiceVariants
            .Include(v => v.Service)
            .AsNoTracking()
            .AsQueryable();

        if (serviceId.HasValue)
        {
            query = query.Where(v => v.ServiceId == serviceId.Value);
        }
        else if (categoryId.HasValue)
        {
            query = query.Where(v => v.Service != null && v.Service.ServiceCategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.Trim().ToLower();
            var matchingTypes = Enum.GetValues<ServiceVariantType>()
                .Where(t => t.ToString().ToLower().Contains(search))
                .ToList();
            bool hasMatchingTypes = matchingTypes.Count > 0;

            bool isIndiv = "individual".Contains(search);
            bool isComp = "company".Contains(search);

            query = query.Where(v =>
                (hasMatchingTypes && matchingTypes.Contains(v.Type)) ||
                (!string.IsNullOrEmpty(v.Description) && v.Description.ToLower().Contains(search)) ||
                (v.Service != null && !string.IsNullOrEmpty(v.Service.Name) && v.Service.Name.ToLower().Contains(search)) ||
                (isIndiv && v.IsIndividual) ||
                (isComp && !v.IsIndividual));
        }

        int totalCount = await query.CountAsync(cancellationToken);
        int validPageNumber = pageNumber <= 0 ? 1 : pageNumber;
        int validPageSize = pageSize <= 0 ? 10 : pageSize;

        var items = await query
            .OrderBy(v => v.Service != null ? v.Service.Name : string.Empty)
            .ThenBy(v => v.Type)
            .ThenBy(v => v.Description ?? string.Empty)
            .Skip((validPageNumber - 1) * validPageSize)
            .Take(validPageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddAsync(ServiceVariant serviceVariant, CancellationToken cancellationToken = default)
    {
        await _context.ServiceVariants.AddAsync(serviceVariant, cancellationToken);
    }

    public void Delete(ServiceVariant serviceVariant)
    {
        _context.ServiceVariants.Remove(serviceVariant);
    }
}
