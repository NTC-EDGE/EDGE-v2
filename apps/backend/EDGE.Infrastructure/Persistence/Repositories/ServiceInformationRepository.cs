using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ServiceInformationRepository : IServiceInformationRepository
{
    private readonly ApplicationDbContext _context;

    public ServiceInformationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ServiceInformation>> GetAllAsync(string? search = null, Guid? serviceId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.ServiceInformations
            .Include(x => x.Service)
            .ThenInclude(s => s!.ServiceCategory)
            .AsQueryable();

        if (serviceId.HasValue)
        {
            query = query.Where(x => x.ServiceId == serviceId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(x =>
                (x.Service != null && x.Service.Name.ToLower().Contains(searchLower)) ||
                (x.Service != null && x.Service.ServiceCategory != null && x.Service.ServiceCategory.Name.ToLower().Contains(searchLower)) ||
                x.Information.ToLower().Contains(searchLower) ||
                x.WhoMayAvail.ToLower().Contains(searchLower));
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<(List<ServiceInformation> Items, int TotalCount)> GetPagedAsync(
        string? search = null,
        Guid? serviceId = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ServiceInformations
            .Include(x => x.Service)
            .ThenInclude(s => s!.ServiceCategory)
            .AsQueryable();

        if (serviceId.HasValue)
        {
            query = query.Where(x => x.ServiceId == serviceId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(x =>
                (x.Service != null && x.Service.Name.ToLower().Contains(searchLower)) ||
                (x.Service != null && x.Service.ServiceCategory != null && x.Service.ServiceCategory.Name.ToLower().Contains(searchLower)) ||
                x.Information.ToLower().Contains(searchLower) ||
                x.WhoMayAvail.ToLower().Contains(searchLower));
        }

        int totalCount = await query.CountAsync(cancellationToken);
        int validPageNumber = pageNumber <= 0 ? 1 : pageNumber;
        int validPageSize = pageSize <= 0 ? 10 : pageSize;

        var items = await query
            .OrderBy(x => x.Service != null ? x.Service.Name : string.Empty)
            .Skip((validPageNumber - 1) * validPageSize)
            .Take(validPageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<ServiceInformation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceInformations
            .Include(x => x.Service)
            .ThenInclude(s => s!.ServiceCategory)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<ServiceInformation?> GetByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceInformations
            .Include(x => x.Service)
            .ThenInclude(s => s!.ServiceCategory)
            .FirstOrDefaultAsync(x => x.ServiceId == serviceId, cancellationToken);
    }

    public async Task AddAsync(ServiceInformation entity, CancellationToken cancellationToken = default)
    {
        await _context.ServiceInformations.AddAsync(entity, cancellationToken);
    }

    public void Update(ServiceInformation entity)
    {
        _context.ServiceInformations.Update(entity);
    }

    public void Delete(ServiceInformation entity)
    {
        _context.ServiceInformations.Remove(entity);
    }
}
