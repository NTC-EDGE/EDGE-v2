using MediatR;
using EDGE.Application.ServiceNotes.DTOs;

namespace EDGE.Application.ServiceNotes.Commands.UpdateServiceNote;

public record UpdateServiceNoteCommand(Guid Id, string Notes, Guid ServiceId, Guid? ServiceVariantId) : IRequest<ServiceNoteDto>;
