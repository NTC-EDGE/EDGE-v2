using MediatR;
using EDGE.Application.Tenants.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Tenants.Queries;

public record GetTenantsQuery() : IRequest<List<TenantDto>>;

public class GetTenantsQueryHandler : IRequestHandler<GetTenantsQuery, List<TenantDto>>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantsQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<List<TenantDto>> Handle(GetTenantsQuery request, CancellationToken cancellationToken)
    {
        var tenants = await _tenantRepository.GetAllAsync(cancellationToken);
        return tenants.Select(t => new TenantDto(t.Id, t.Name, t.Slug, t.Description, t.IsActive, t.CreatedAt)).ToList();
    }
}

public record GetTenantByIdQuery(Guid Id) : IRequest<TenantDto?>;

public class GetTenantByIdQueryHandler : IRequestHandler<GetTenantByIdQuery, TenantDto?>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantByIdQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<TenantDto?> Handle(GetTenantByIdQuery request, CancellationToken cancellationToken)
    {
        var t = await _tenantRepository.GetByIdAsync(request.Id, cancellationToken);
        if (t == null) return null;
        return new TenantDto(t.Id, t.Name, t.Slug, t.Description, t.IsActive, t.CreatedAt);
    }
}
