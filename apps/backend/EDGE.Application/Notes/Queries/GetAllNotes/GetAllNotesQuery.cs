using MediatR;
using EDGE.Application.Notes.DTOs;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Notes.Queries.GetAllNotes;

public record GetAllNotesQuery(int PageNumber = 1, int PageSize = 10) : IRequest<PaginatedApiResponse<NoteDto>>;
