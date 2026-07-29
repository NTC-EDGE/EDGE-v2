using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Announcements.Commands.DeleteAnnouncement;

public class DeleteAnnouncementCommandHandler : IRequestHandler<DeleteAnnouncementCommand, bool>
{
    private readonly ISystemAnnouncementRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteAnnouncementCommandHandler(ISystemAnnouncementRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteAnnouncementCommand request, CancellationToken cancellationToken)
    {
        var announcement = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (announcement == null) return false;

        _repository.Delete(announcement);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
