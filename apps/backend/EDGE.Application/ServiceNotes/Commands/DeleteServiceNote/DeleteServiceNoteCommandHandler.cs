using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.ServiceNotes.Commands.DeleteServiceNote;

public class DeleteServiceNoteCommandHandler : IRequestHandler<DeleteServiceNoteCommand>
{
    private readonly IServiceNoteRepository _serviceNoteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteServiceNoteCommandHandler(IServiceNoteRepository serviceNoteRepository, IUnitOfWork unitOfWork)
    {
        _serviceNoteRepository = serviceNoteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteServiceNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await _serviceNoteRepository.GetByIdAsync(request.Id, cancellationToken);
        if (note == null)
        {
            throw new KeyNotFoundException($"Service note with ID '{request.Id}' was not found.");
        }

        _serviceNoteRepository.Delete(note);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
