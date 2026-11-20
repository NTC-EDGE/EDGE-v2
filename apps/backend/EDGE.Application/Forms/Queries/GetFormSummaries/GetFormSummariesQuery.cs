using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Queries.GetFormSummaries;

public record GetFormSummariesQuery(
    int PageNumber = 1,
    int PageSize = 50,
    string? SearchTerm = null,
    Guid? ServiceId = null,
    string? FormKey = null,
    Guid? ServiceCategoryId = null,
    bool? IsActive = null) : IRequest<PaginatedApiResponse<FormSummaryDto>>;
