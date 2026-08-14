using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.SoaNotes.Commands.DeleteSoaNote;

public class DeleteSoaNoteCommandHandler : IRequestHandler<DeleteSoaNoteCommand>
{
    private readonly ISoaNoteRepository _soaNoteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteSoaNoteCommandHandler(ISoaNoteRepository soaNoteRepository, IUnitOfWork unitOfWork)
    {
        _soaNoteRepository = soaNoteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteSoaNoteCommand request, CancellationToken cancellationToken)
    {
        var soaNote = await _soaNoteRepository.GetByIdAsync(request.Id, cancellationToken);
        if (soaNote == null)
        {
            throw new KeyNotFoundException($"SOA note template with ID '{request.Id}' was not found.");
        }

        _soaNoteRepository.Delete(soaNote);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
