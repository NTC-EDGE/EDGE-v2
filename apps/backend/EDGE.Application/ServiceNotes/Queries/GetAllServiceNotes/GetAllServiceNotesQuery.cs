using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceNotes.DTOs;

namespace EDGE.Application.ServiceNotes.Queries.GetAllServiceNotes;

public record GetAllServiceNotesQuery(
    int? PageNumber,
    int? PageSize,
    string? SearchTerm,
    Guid? ServiceId,
    Guid? ServiceVariantId
) : IRequest<PaginatedApiResponse<ServiceNoteDto>>;
