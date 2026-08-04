using MediatR;
using EDGE.Application.NotificationTemplates.DTOs;
using EDGE.Application.Common.Models;

namespace EDGE.Application.NotificationTemplates.Queries.GetNotificationTemplates;

public record GetNotificationTemplatesQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? SearchTerm = null
) : IRequest<PaginatedApiResponse<NotificationTemplateDto>>;
