using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Receipts.Dtos;

namespace EDGE.Application.Receipts.Queries.BankAccounts.GetAgencyBankAccounts;

public record GetAgencyBankAccountsQuery(
    Guid TenantId,
    bool? ActiveOnly = null
) : IRequest<ApiResponse<List<AgencyBankAccountDto>>>;

public class GetAgencyBankAccountsQueryHandler : IRequestHandler<GetAgencyBankAccountsQuery, ApiResponse<List<AgencyBankAccountDto>>>
{
    private readonly IAgencyBankAccountRepository _bankAccountRepository;

    public GetAgencyBankAccountsQueryHandler(IAgencyBankAccountRepository bankAccountRepository)
    {
        _bankAccountRepository = bankAccountRepository;
    }

    public async Task<ApiResponse<List<AgencyBankAccountDto>>> Handle(GetAgencyBankAccountsQuery request, CancellationToken cancellationToken)
    {
        var accounts = await _bankAccountRepository.GetByTenantAsync(request.TenantId, request.ActiveOnly, cancellationToken);

        var dtos = accounts.Select(a => new AgencyBankAccountDto(
            a.Id,
            a.TenantId,
            a.BankName,
            a.AccountName,
            a.AccountNumber,
            a.Branch,
            a.FundCluster,
            a.IsActive,
            a.Remarks
        )).ToList();

        return ApiResponse<List<AgencyBankAccountDto>>.Success(dtos);
    }
}
