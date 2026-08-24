using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries.GetTenantClients;

public class GetTenantClientsQueryHandler : IRequestHandler<GetTenantClientsQuery, PaginatedApiResponse<TenantClientDto>>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantClientsQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<PaginatedApiResponse<TenantClientDto>> Handle(GetTenantClientsQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _tenantRepository.GetTenantClientsAsync(
            request.TenantId,
            request.Search,
            request.PageNumber,
            request.PageSize,
            cancellationToken
        );

        return new PaginatedApiResponse<TenantClientDto>(items, request.PageNumber, request.PageSize, totalCount);
    }
}
