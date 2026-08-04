using MediatR;
using EDGE.Application.SystemConfigs.DTOs;
using EDGE.Application.Common.Models;

namespace EDGE.Application.SystemConfigs.Queries.GetSystemConfigs;

public record GetSystemConfigsQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? SearchTerm = null,
    string? Category = null,
    bool PublicOnly = false
) : IRequest<PaginatedApiResponse<SystemConfigDto>>;
