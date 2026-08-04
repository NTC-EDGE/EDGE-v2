using System;
using MediatR;
using EDGE.Application.NotificationTemplates.DTOs;

namespace EDGE.Application.NotificationTemplates.Commands.UpdateNotificationTemplate;

public record UpdateNotificationTemplateCommand(
    Guid Id,
    string Subject,
    string BodyHtml,
    bool IsActive
) : IRequest<NotificationTemplateDto>;
