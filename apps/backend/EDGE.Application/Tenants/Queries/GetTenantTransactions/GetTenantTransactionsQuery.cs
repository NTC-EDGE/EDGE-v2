using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries.GetTenantTransactions;

public record GetTenantTransactionsQuery(Guid TenantId) : IRequest<List<TenantTransactionDto>>;
