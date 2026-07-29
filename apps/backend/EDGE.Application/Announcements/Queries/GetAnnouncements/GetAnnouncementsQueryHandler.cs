using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Announcements.DTOs;

namespace EDGE.Application.Announcements.Queries.GetAnnouncements;

public class GetAnnouncementsQueryHandler : IRequestHandler<GetAnnouncementsQuery, List<SystemAnnouncementDto>>
{
    private readonly ISystemAnnouncementRepository _repository;

    public GetAnnouncementsQueryHandler(ISystemAnnouncementRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<SystemAnnouncementDto>> Handle(GetAnnouncementsQuery request, CancellationToken cancellationToken)
    {
        var items = await _repository.GetAllAsync(cancellationToken);
        return items.Select(a => new SystemAnnouncementDto
        {
            Id = a.Id,
            Title = a.Title,
            Message = a.Message,
            Type = a.Type,
            IsActive = a.IsActive,
            StartDate = a.StartDate,
            EndDate = a.EndDate,
            TargetAudience = a.TargetAudience,
            CreatedAt = a.CreatedAt
        }).ToList();
    }
}
