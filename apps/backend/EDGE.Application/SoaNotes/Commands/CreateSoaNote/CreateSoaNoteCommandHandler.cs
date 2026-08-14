using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.SoaNotes.DTOs;

namespace EDGE.Application.SoaNotes.Commands.CreateSoaNote;

public class CreateSoaNoteCommandHandler : IRequestHandler<CreateSoaNoteCommand, SoaNoteDto>
{
    private readonly ISoaNoteRepository _soaNoteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateSoaNoteCommandHandler(ISoaNoteRepository soaNoteRepository, IUnitOfWork unitOfWork)
    {
        _soaNoteRepository = soaNoteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<SoaNoteDto> Handle(CreateSoaNoteCommand request, CancellationToken cancellationToken)
    {
        var soaNote = new SoaNote
        {
            Notes = request.Notes,
            Code = request.Code,
            Title = request.Title
        };

        await _soaNoteRepository.AddAsync(soaNote, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new SoaNoteDto
        {
            Id = soaNote.Id,
            Code = soaNote.Code,
            Title = soaNote.Title,
            Notes = soaNote.Notes,
            CreatedAt = soaNote.CreatedAt,
            CreatedBy = soaNote.CreatedBy,
            LastModifiedAt = soaNote.LastModifiedAt,
            LastModifiedBy = soaNote.LastModifiedBy
        };
    }
}
