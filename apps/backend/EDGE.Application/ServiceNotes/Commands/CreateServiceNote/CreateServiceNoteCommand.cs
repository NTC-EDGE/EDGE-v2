using MediatR;
using EDGE.Application.ServiceNotes.DTOs;

namespace EDGE.Application.ServiceNotes.Commands.CreateServiceNote;

public record CreateServiceNoteCommand(string Notes, Guid ServiceId, Guid? ServiceVariantId) : IRequest<ServiceNoteDto>;
