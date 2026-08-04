using System;

namespace EDGE.Application.NotificationTemplates.DTOs;

public class NotificationTemplateDto
{
    public Guid Id { get; set; }
    public string EventKey { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string BodyHtml { get; set; } = string.Empty;
    public string AvailablePlaceholders { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? LastModifiedAt { get; set; }
}
