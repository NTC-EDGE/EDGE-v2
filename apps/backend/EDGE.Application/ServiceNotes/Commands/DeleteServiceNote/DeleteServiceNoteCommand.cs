using MediatR;

namespace EDGE.Application.ServiceNotes.Commands.DeleteServiceNote;

public record DeleteServiceNoteCommand(Guid Id) : IRequest;
