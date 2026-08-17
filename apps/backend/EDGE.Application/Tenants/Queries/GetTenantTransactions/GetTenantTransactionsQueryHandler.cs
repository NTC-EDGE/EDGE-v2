using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries.GetTenantTransactions;

public class GetTenantTransactionsQueryHandler : IRequestHandler<GetTenantTransactionsQuery, List<TenantTransactionDto>>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantTransactionsQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<List<TenantTransactionDto>> Handle(GetTenantTransactionsQuery request, CancellationToken cancellationToken)
    {
        return await _tenantRepository.GetTenantTransactionsAsync(request.TenantId, cancellationToken);
    }
}
