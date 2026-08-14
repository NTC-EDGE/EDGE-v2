using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.ServiceNotes.DTOs;

namespace EDGE.Application.ServiceNotes.Commands.CreateServiceNote;

public class CreateServiceNoteCommandHandler : IRequestHandler<CreateServiceNoteCommand, ServiceNoteDto>
{
    private readonly IServiceNoteRepository _serviceNoteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateServiceNoteCommandHandler(IServiceNoteRepository serviceNoteRepository, IUnitOfWork unitOfWork)
    {
        _serviceNoteRepository = serviceNoteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceNoteDto> Handle(CreateServiceNoteCommand request, CancellationToken cancellationToken)
    {
        var note = new ServiceNote
        {
            Notes = request.Notes,
            ServiceId = request.ServiceId,
            ServiceVariantId = request.ServiceVariantId
        };

        await _serviceNoteRepository.AddAsync(note, cancellationToken);
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
