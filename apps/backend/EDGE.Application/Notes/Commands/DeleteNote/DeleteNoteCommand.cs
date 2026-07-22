using MediatR;

namespace EDGE.Application.Notes.Commands.DeleteNote;

public record DeleteNoteCommand(Guid Id) : IRequest;
