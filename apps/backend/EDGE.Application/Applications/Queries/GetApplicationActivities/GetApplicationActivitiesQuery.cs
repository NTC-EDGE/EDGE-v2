using System;
using MediatR;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Models;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Queries.GetApplicationActivities;

public record GetApplicationActivitiesQuery(
    ApplicationStatus? Status = null,
    string? QueueTab = null,
    string? Scope = null,
    int? PageNumber = 1,
    int? PageSize = 15,
    string? SearchTerm = null,
    string? Mode = null,
    Guid? TenantId = null,
    string? FieldOffice = null,
    string? AssignedTo = null,
    string? Role = null
) : IRequest<ApiResponse<PagedApplicationActivitiesDto>>;

