using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Queries.GetTenantClients;

public record GetTenantClientsQuery(
    Guid TenantId,
    string? Search = null,
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<PaginatedApiResponse<TenantClientDto>>;
