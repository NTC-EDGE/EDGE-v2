using MediatR;
using EDGE.Application.ServiceNotes.DTOs;

namespace EDGE.Application.ServiceNotes.Queries.GetServiceNoteById;

public record GetServiceNoteByIdQuery(Guid Id) : IRequest<ServiceNoteDto?>;
