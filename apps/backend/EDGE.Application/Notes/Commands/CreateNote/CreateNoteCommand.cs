using MediatR;
using EDGE.Application.Notes.DTOs;

namespace EDGE.Application.Notes.Commands.CreateNote;

public record CreateNoteCommand(string Notes, Guid ServiceCategoryId) : IRequest<NoteDto>;
