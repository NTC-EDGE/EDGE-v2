using MediatR;
using EDGE.Application.Notes.DTOs;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Notes.Queries.GetAllNotes;

public record GetAllNotesQuery(
    int? PageNumber = null,
    int? PageSize = null,
    string? SearchTerm = null,
    Guid? ServiceId = null,
    Guid? ServiceVariantId = null
) : IRequest<PaginatedApiResponse<NoteDto>>;
