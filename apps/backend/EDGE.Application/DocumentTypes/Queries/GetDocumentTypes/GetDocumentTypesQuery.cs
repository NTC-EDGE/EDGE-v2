using MediatR;
using EDGE.Application.DocumentTypes.DTOs;
using EDGE.Application.Common.Models;

namespace EDGE.Application.DocumentTypes.Queries.GetDocumentTypes;

public record GetDocumentTypesQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? SearchTerm = null,
    string? Category = null,
    bool ActiveOnly = false
) : IRequest<PaginatedApiResponse<DocumentTypeDto>>;
