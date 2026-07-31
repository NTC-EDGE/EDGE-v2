using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries;

public class GetAllTenantsQueryHandler : IRequestHandler<GetAllTenantsQuery, List<TenantDto>>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IFieldOfficeRepository _fieldOfficeRepository;

    public GetAllTenantsQueryHandler(ITenantRepository tenantRepository, IFieldOfficeRepository fieldOfficeRepository)
    {
        _tenantRepository = tenantRepository;
        _fieldOfficeRepository = fieldOfficeRepository;
    }

    public async Task<List<TenantDto>> Handle(GetAllTenantsQuery request, CancellationToken cancellationToken)
    {
        var tenants = await _tenantRepository.GetAllAsync(cancellationToken);
        var allOffices = await _fieldOfficeRepository.GetAllAsync(cancellationToken);
        var officeCounts = allOffices.GroupBy(o => o.TenantId).ToDictionary(g => g.Key, g => g.Count());

        return tenants.Select(t => new TenantDto
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
            ClientTotal = 0 // Not needed for the list screen validation, avoiding heavy geographic processing
        }).ToList();
    }
}
