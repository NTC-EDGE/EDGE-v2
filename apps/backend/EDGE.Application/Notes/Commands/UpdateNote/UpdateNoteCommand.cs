using MediatR;
using EDGE.Application.Notes.DTOs;

namespace EDGE.Application.Notes.Commands.UpdateNote;

public record UpdateNoteCommand(Guid Id, string Notes, Guid ServiceCategoryId) : IRequest<NoteDto>;
