using MediatR;
using EDGE.Application.Notes.DTOs;

namespace EDGE.Application.Notes.Queries.GetNoteById;

public record GetNoteByIdQuery(Guid Id) : IRequest<NoteDto?>;
