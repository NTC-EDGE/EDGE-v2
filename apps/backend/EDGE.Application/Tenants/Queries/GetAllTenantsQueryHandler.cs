using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries;

public class GetAllTenantsQueryHandler : IRequestHandler<GetAllTenantsQuery, PaginatedApiResponse<TenantDto>>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IFieldOfficeRepository _fieldOfficeRepository;

    public GetAllTenantsQueryHandler(ITenantRepository tenantRepository, IFieldOfficeRepository fieldOfficeRepository)
    {
        _tenantRepository = tenantRepository;
        _fieldOfficeRepository = fieldOfficeRepository;
    }

    public async Task<PaginatedApiResponse<TenantDto>> Handle(GetAllTenantsQuery request, CancellationToken cancellationToken)
    {
        var tenants = await _tenantRepository.GetAllAsync(cancellationToken);
        var queryable = tenants.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.Trim().ToLower();
            queryable = queryable.Where(t =>
                t.Name.ToLower().Contains(term) ||
                t.Code.ToLower().Contains(term) ||
                (t.Description != null && t.Description.ToLower().Contains(term))
            );
        }

        var totalCount = queryable.Count();
        var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var filteredTenants = queryable
            .OrderBy(t => t.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var allOffices = await _fieldOfficeRepository.GetAllAsync(cancellationToken);
        var officeCounts = allOffices.GroupBy(o => o.TenantId).ToDictionary(g => g.Key, g => g.Count());

        var dtos = filteredTenants.Select(t => new TenantDto
        {
            Id = t.Id,
            Name = t.Name,
            Code = t.Code,
            Description = t.Description,
            IsActive = t.IsActive,
            RegionId = t.RegionId,
            CreatedAt = t.CreatedAt,
            CreatedBy = t.CreatedBy,
            LastModifiedAt = t.LastModifiedAt,
            LastModifiedBy = t.LastModifiedBy,
            TenantMembersTotal = t.Members?.Count ?? 0,
            FieldOfficesCount = officeCounts.GetValueOrDefault(t.Id, 0),
            ClientTotal = 0
        }).ToList();

        return new PaginatedApiResponse<TenantDto>(dtos, pageNumber, pageSize, totalCount);
    }
}
