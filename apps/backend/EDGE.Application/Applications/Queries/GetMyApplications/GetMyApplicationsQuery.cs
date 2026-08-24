using MediatR;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Models;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Queries.GetMyApplications;

public record GetMyApplicationsQuery(
    ApplicationStatus? Status = null,
    int? PageNumber = 1,
    int? PageSize = 10,
    string? SearchTerm = null,
    string? Mode = null
) : IRequest<ApiResponse<PagedApplicationListDto>>;
