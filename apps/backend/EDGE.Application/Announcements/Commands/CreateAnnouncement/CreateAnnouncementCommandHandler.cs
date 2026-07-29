using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Announcements.DTOs;

namespace EDGE.Application.Announcements.Commands.CreateAnnouncement;

public class CreateAnnouncementCommandHandler : IRequestHandler<CreateAnnouncementCommand, SystemAnnouncementDto>
{
    private readonly ISystemAnnouncementRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateAnnouncementCommandHandler(ISystemAnnouncementRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<SystemAnnouncementDto> Handle(CreateAnnouncementCommand request, CancellationToken cancellationToken)
    {
        var announcement = new SystemAnnouncement
        {
            Title = request.Title.Trim(),
            Message = request.Message.Trim(),
            Type = request.Type,
            IsActive = request.IsActive,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TargetAudience = request.TargetAudience
        };

        await _repository.AddAsync(announcement, cancellationToken);
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
