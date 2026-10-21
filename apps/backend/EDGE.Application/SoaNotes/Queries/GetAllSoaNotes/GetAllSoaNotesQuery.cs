using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.SoaNotes.DTOs;

namespace EDGE.Application.SoaNotes.Queries.GetAllSoaNotes;

public record GetAllSoaNotesQuery(
    int? PageNumber,
    int? PageSize,
    string? SearchTerm,
    Guid? TenantId = null
) : IRequest<PaginatedApiResponse<SoaNoteDto>>;
