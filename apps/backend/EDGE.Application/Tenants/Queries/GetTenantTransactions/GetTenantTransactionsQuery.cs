using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries.GetTenantTransactions;

public record GetTenantTransactionsQuery(
    Guid TenantId,
    string? Search = null,
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<PaginatedApiResponse<TenantTransactionDto>>;
