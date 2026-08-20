using System;
using MediatR;
using EDGE.Application.Applications.Dtos;

namespace EDGE.Application.Applications.Queries.GetDraftApplications;

public record GetDraftApplicationsQuery(
    Guid? CategoryId = null,
    string? CategoryParam = null,
    int PageNumber = 1,
    int PageSize = 10,
    string? SearchTerm = null
) : IRequest<DraftApplicationsEnvelope>;
