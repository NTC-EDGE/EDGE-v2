using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.ServiceNotes.DTOs;

namespace EDGE.Application.ServiceNotes.Queries.GetServiceNoteById;

public class GetServiceNoteByIdQueryHandler : IRequestHandler<GetServiceNoteByIdQuery, ServiceNoteDto?>
{
    private readonly IServiceNoteRepository _serviceNoteRepository;

    public GetServiceNoteByIdQueryHandler(IServiceNoteRepository serviceNoteRepository)
    {
        _serviceNoteRepository = serviceNoteRepository;
    }

    public async Task<ServiceNoteDto?> Handle(GetServiceNoteByIdQuery request, CancellationToken cancellationToken)
    {
        var note = await _serviceNoteRepository.GetByIdAsync(request.Id, cancellationToken);
        if (note == null) return null;

        return new ServiceNoteDto
        {
            Id = note.Id,
            Notes = note.Notes,
            ServiceId = note.ServiceId,
            ServiceVariantId = note.ServiceVariantId,
            ServiceName = note.Service?.Name,
            ServiceVariantName = note.ServiceVariant != null ? $"{note.ServiceVariant.Type} ({note.ServiceVariant.Description})" : null,
            CreatedAt = note.CreatedAt,
            CreatedBy = note.CreatedBy,
            LastModifiedAt = note.LastModifiedAt,
            LastModifiedBy = note.LastModifiedBy
        };
    }
}
