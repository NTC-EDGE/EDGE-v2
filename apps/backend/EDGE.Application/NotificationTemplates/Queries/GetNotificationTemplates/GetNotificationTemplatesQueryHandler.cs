using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.NotificationTemplates.DTOs;

namespace EDGE.Application.NotificationTemplates.Queries.GetNotificationTemplates;

public class GetNotificationTemplatesQueryHandler : IRequestHandler<GetNotificationTemplatesQuery, List<NotificationTemplateDto>>
{
    private readonly INotificationTemplateRepository _repository;

    public GetNotificationTemplatesQueryHandler(INotificationTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<NotificationTemplateDto>> Handle(GetNotificationTemplatesQuery request, CancellationToken cancellationToken)
    {
        var templates = await _repository.GetAllAsync(cancellationToken);

        return templates.Select(t => new NotificationTemplateDto
        {
            Id = t.Id,
            EventKey = t.EventKey,
            Name = t.Name,
            Subject = t.Subject,
            BodyHtml = t.BodyHtml,
            AvailablePlaceholders = t.AvailablePlaceholders,
            IsActive = t.IsActive,
            LastModifiedAt = t.LastModifiedAt
        }).ToList();
    }
}
