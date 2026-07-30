using MediatR;
using System.Collections.Generic;
using EDGE.Application.Elements.DTOs;

using EDGE.Application.Common.Models;

namespace EDGE.Application.Elements.Queries.GetElements;

public record GetElementsQuery(
    int? PageNumber = null,
    int? PageSize = null,
    string? SearchTerm = null
) : IRequest<PaginatedApiResponse<ElementDto>>;
