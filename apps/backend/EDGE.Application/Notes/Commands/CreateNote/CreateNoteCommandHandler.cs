using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Notes.DTOs;

namespace EDGE.Application.Notes.Commands.CreateNote;

public class CreateNoteCommandHandler : IRequestHandler<CreateNoteCommand, NoteDto>
{
    private readonly INoteRepository _noteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateNoteCommandHandler(INoteRepository noteRepository, IUnitOfWork unitOfWork)
    {
        _noteRepository = noteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<NoteDto> Handle(CreateNoteCommand request, CancellationToken cancellationToken)
    {
        var note = new Note
        {
            Notes = request.Notes,
            ServiceId = request.ServiceId,
            ServiceVariantId = request.ServiceVariantId
        };

        await _noteRepository.AddAsync(note, cancellationToken);
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
