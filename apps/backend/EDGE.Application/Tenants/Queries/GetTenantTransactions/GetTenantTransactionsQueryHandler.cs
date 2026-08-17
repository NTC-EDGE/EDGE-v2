using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries.GetTenantTransactions;

public class GetTenantTransactionsQueryHandler : IRequestHandler<GetTenantTransactionsQuery, PaginatedApiResponse<TenantTransactionDto>>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantTransactionsQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<PaginatedApiResponse<TenantTransactionDto>> Handle(GetTenantTransactionsQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _tenantRepository.GetTenantTransactionsAsync(
            request.TenantId,
            request.Search,
            request.PageNumber,
            request.PageSize,
            cancellationToken
        );

        return new PaginatedApiResponse<TenantTransactionDto>(items, request.PageNumber, request.PageSize, totalCount);
    }
}
