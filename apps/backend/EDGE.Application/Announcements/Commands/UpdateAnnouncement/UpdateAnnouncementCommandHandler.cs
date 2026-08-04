using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Announcements.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Announcements.Commands.UpdateAnnouncement;

public class UpdateAnnouncementCommandHandler : IRequestHandler<UpdateAnnouncementCommand, SystemAnnouncementDto?>
{
    private readonly ISystemAnnouncementRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateAnnouncementCommandHandler(ISystemAnnouncementRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<SystemAnnouncementDto?> Handle(UpdateAnnouncementCommand request, CancellationToken cancellationToken)
    {
        var announcement = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (announcement == null) return null;

        announcement.Title = request.Title;
        announcement.Message = request.Message;
        announcement.Type = request.Type;
        announcement.IsActive = request.IsActive;
        announcement.StartDate = request.StartDate;
        announcement.EndDate = request.EndDate;
        announcement.TargetAudience = request.TargetAudience;

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
