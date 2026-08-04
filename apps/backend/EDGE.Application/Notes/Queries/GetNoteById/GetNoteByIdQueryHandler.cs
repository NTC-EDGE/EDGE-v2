using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Notes.DTOs;

namespace EDGE.Application.Notes.Queries.GetNoteById;

public class GetNoteByIdQueryHandler : IRequestHandler<GetNoteByIdQuery, NoteDto?>
{
    private readonly INoteRepository _noteRepository;

    public GetNoteByIdQueryHandler(INoteRepository noteRepository)
    {
        _noteRepository = noteRepository;
    }

    public async Task<NoteDto?> Handle(GetNoteByIdQuery request, CancellationToken cancellationToken)
    {
        var note = await _noteRepository.GetByIdAsync(request.Id, cancellationToken);
        if (note == null) return null;

        return new NoteDto
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
