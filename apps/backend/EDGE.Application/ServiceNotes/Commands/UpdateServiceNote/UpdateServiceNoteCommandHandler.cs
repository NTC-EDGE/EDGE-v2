using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.ServiceNotes.DTOs;

namespace EDGE.Application.ServiceNotes.Commands.UpdateServiceNote;

public class UpdateServiceNoteCommandHandler : IRequestHandler<UpdateServiceNoteCommand, ServiceNoteDto>
{
    private readonly IServiceNoteRepository _serviceNoteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateServiceNoteCommandHandler(IServiceNoteRepository serviceNoteRepository, IUnitOfWork unitOfWork)
    {
        _serviceNoteRepository = serviceNoteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceNoteDto> Handle(UpdateServiceNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await _serviceNoteRepository.GetByIdAsync(request.Id, cancellationToken);
        if (note == null)
        {
            throw new KeyNotFoundException($"Service note with ID '{request.Id}' was not found.");
        }

        note.Notes = request.Notes;
        note.ServiceId = request.ServiceId;
        note.ServiceVariantId = request.ServiceVariantId;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var loadedNote = await _serviceNoteRepository.GetByIdAsync(note.Id, cancellationToken) ?? note;

        return new ServiceNoteDto
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
