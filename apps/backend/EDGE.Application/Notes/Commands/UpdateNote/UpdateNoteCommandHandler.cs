using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Notes.DTOs;

namespace EDGE.Application.Notes.Commands.UpdateNote;

public class UpdateNoteCommandHandler : IRequestHandler<UpdateNoteCommand, NoteDto>
{
    private readonly INoteRepository _noteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateNoteCommandHandler(INoteRepository noteRepository, IUnitOfWork unitOfWork)
    {
        _noteRepository = noteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<NoteDto> Handle(UpdateNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await _noteRepository.GetByIdAsync(request.Id, cancellationToken);
        if (note == null)
        {
            throw new KeyNotFoundException($"Note with ID '{request.Id}' was not found.");
        }

        note.Notes = request.Notes;
        note.ServiceId = request.ServiceId;
        note.ServiceVariantId = request.ServiceVariantId;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var loadedNote = await _noteRepository.GetByIdAsync(note.Id, cancellationToken) ?? note;

        return new NoteDto
        {
            Id = loadedNote.Id,
            Notes = loadedNote.Notes,
            ServiceId = loadedNote.ServiceId,
            ServiceVariantId = loadedNote.ServiceVariantId,
            ServiceName = loadedNote.Service?.Name,
            ServiceVariantName = loadedNote.ServiceVariant != null ? $"{loadedNote.ServiceVariant.Type} ({loadedNote.ServiceVariant.Description})" : null,
            CreatedAt = loadedNote.CreatedAt,
            CreatedBy = loadedNote.CreatedBy,
            LastModifiedAt = loadedNote.LastModifiedAt,
            LastModifiedBy = loadedNote.LastModifiedBy
        };
    }
}
