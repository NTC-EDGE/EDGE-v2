using MediatR;
using EDGE.Application.Tenants.DTOs;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Tenants.Queries;

public record GetAllTenantsQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? SearchTerm = null
) : IRequest<PaginatedApiResponse<TenantDto>>;
