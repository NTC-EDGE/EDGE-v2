using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries;

public class GetAllTenantsQueryHandler : IRequestHandler<GetAllTenantsQuery, List<TenantDto>>
{
    private readonly ITenantRepository _tenantRepository;

    public GetAllTenantsQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<List<TenantDto>> Handle(GetAllTenantsQuery request, CancellationToken cancellationToken)
    {
        var tenants = await _tenantRepository.GetAllAsync(cancellationToken);

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
            LastModifiedBy = t.LastModifiedBy
        }).ToList();
    }
}
