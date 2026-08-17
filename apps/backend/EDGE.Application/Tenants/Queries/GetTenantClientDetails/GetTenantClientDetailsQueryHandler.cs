using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries.GetTenantClientDetails;

public class GetTenantClientDetailsQueryHandler : IRequestHandler<GetTenantClientDetailsQuery, TenantClientDetailsDto?>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantClientDetailsQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<TenantClientDetailsDto?> Handle(GetTenantClientDetailsQuery request, CancellationToken cancellationToken)
    {
        return await _tenantRepository.GetTenantClientDetailsAsync(request.TenantId, request.ClientId, cancellationToken);
    }
}
