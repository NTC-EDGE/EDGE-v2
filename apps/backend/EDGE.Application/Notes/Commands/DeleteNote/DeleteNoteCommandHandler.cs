using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Notes.Commands.DeleteNote;

public class DeleteNoteCommandHandler : IRequestHandler<DeleteNoteCommand>
{
    private readonly INoteRepository _noteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteNoteCommandHandler(INoteRepository noteRepository, IUnitOfWork unitOfWork)
    {
        _noteRepository = noteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await _noteRepository.GetByIdAsync(request.Id, cancellationToken);
        if (note == null)
        {
            throw new KeyNotFoundException($"Note with ID '{request.Id}' was not found.");
        }

        _noteRepository.Delete(note);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
