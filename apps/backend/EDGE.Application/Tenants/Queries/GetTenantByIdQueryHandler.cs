using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries;

public class GetTenantByIdQueryHandler : IRequestHandler<GetTenantByIdQuery, TenantDto>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantByIdQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<TenantDto> Handle(GetTenantByIdQuery request, CancellationToken cancellationToken)
    {
        var t = await _tenantRepository.GetByIdAsync(request.Id, cancellationToken);
        if (t == null)
        {
            throw new KeyNotFoundException($"Tenant with ID '{request.Id}' was not found.");
        }

        return new TenantDto
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
        };
    }
}
