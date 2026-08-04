using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.NotificationTemplates.DTOs;

namespace EDGE.Application.NotificationTemplates.Queries.GetNotificationTemplates;

public class GetNotificationTemplatesQueryHandler : IRequestHandler<GetNotificationTemplatesQuery, PaginatedApiResponse<NotificationTemplateDto>>
{
    private readonly INotificationTemplateRepository _repository;

    public GetNotificationTemplatesQueryHandler(INotificationTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task<PaginatedApiResponse<NotificationTemplateDto>> Handle(GetNotificationTemplatesQuery request, CancellationToken cancellationToken)
    {
        var templates = await _repository.GetAllAsync(cancellationToken);
        var queryable = templates.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.Trim().ToLower();
            queryable = queryable.Where(t => t.Name.ToLower().Contains(term) || t.EventKey.ToLower().Contains(term) || t.Subject.ToLower().Contains(term));
        }

        var totalCount = queryable.Count();
        var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var paginated = queryable
            .OrderBy(t => t.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new NotificationTemplateDto
            {
                Id = t.Id,
                EventKey = t.EventKey,
                Name = t.Name,
                Subject = t.Subject,
                BodyHtml = t.BodyHtml,
                AvailablePlaceholders = t.AvailablePlaceholders,
                IsActive = t.IsActive,
                LastModifiedAt = t.LastModifiedAt
            })
            .ToList();

        return new PaginatedApiResponse<NotificationTemplateDto>(paginated, pageNumber, pageSize, totalCount);
    }
}
