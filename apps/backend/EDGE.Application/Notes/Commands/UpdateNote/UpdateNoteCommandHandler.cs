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
        note.ServiceCategoryId = request.ServiceCategoryId;

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
