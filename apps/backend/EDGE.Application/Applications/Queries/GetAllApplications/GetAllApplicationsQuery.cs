using System.Collections.Generic;
using MediatR;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Models;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Queries.GetAllApplications;

public record GetAllApplicationsQuery(
    ApplicationStatus? Status = null,
    string? QueueTab = null,
    string? Scope = null,
    int? PageNumber = 1,
    int? PageSize = 10,
    string? SearchTerm = null,
    string? Mode = null,
    Guid? TenantId = null,
    string? FieldOffice = null,
    string? AssignedTo = null
) : IRequest<ApiResponse<PagedApplicationListDto>>;
