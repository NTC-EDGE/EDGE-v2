using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Announcements.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Announcements.Commands.TogglePublishAnnouncement;

public class TogglePublishAnnouncementCommandHandler : IRequestHandler<TogglePublishAnnouncementCommand, SystemAnnouncementDto?>
{
    private readonly ISystemAnnouncementRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public TogglePublishAnnouncementCommandHandler(ISystemAnnouncementRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<SystemAnnouncementDto?> Handle(TogglePublishAnnouncementCommand request, CancellationToken cancellationToken)
    {
        var announcement = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (announcement == null) return null;

        announcement.IsActive = request.IsActive;
        _repository.Update(announcement);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new SystemAnnouncementDto
        {
            Id = announcement.Id,
            Title = announcement.Title,
            Message = announcement.Message,
            Type = announcement.Type,
            IsActive = announcement.IsActive,
            StartDate = announcement.StartDate,
            EndDate = announcement.EndDate,
            TargetAudience = announcement.TargetAudience,
            CreatedAt = announcement.CreatedAt
        };
    }
}
