using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Users.DTOs;

namespace EDGE.Application.Users.Queries;

public record GetUsersQuery(
    int PageNumber = 1,
    int PageSize = 50,
    string? SearchTerm = null,
    Guid? TenantId = null,
    Guid? RegionId = null,
    bool? IsActive = null
) : IRequest<PaginatedApiResponse<UserDto>>;
