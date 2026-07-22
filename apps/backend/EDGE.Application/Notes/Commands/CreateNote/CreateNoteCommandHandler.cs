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
            ServiceCategoryId = request.ServiceCategoryId
        };

        await _noteRepository.AddAsync(note, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new NoteDto
        {
            Id = note.Id,
            Notes = note.Notes,
            ServiceCategoryId = note.ServiceCategoryId,
            CreatedAt = note.CreatedAt,
            CreatedBy = note.CreatedBy,
            LastModifiedAt = note.LastModifiedAt,
            LastModifiedBy = note.LastModifiedBy
        };
    }
}
