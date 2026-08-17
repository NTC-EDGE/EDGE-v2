using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries.GetTenantClients;

public class GetTenantClientsQueryHandler : IRequestHandler<GetTenantClientsQuery, List<TenantClientDto>>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantClientsQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<List<TenantClientDto>> Handle(GetTenantClientsQuery request, CancellationToken cancellationToken)
    {
        return await _tenantRepository.GetTenantClientsAsync(request.TenantId, request.Search, cancellationToken);
    }
}
