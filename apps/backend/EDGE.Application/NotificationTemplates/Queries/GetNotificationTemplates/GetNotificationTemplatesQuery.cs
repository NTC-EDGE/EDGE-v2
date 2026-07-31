using System.Collections.Generic;
using MediatR;
using EDGE.Application.NotificationTemplates.DTOs;

namespace EDGE.Application.NotificationTemplates.Queries.GetNotificationTemplates;

public record GetNotificationTemplatesQuery : IRequest<List<NotificationTemplateDto>>;
