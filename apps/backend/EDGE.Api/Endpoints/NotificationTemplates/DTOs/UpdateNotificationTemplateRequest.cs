using System;

namespace EDGE.Api.Endpoints.NotificationTemplates.DTOs;

public record UpdateNotificationTemplateRequest(
    string Subject,
    string BodyHtml,
    bool IsActive
);
