using System;

namespace EDGE.Application.Feedback.DTOs;

public class FeedbackDto
{
    public Guid Id { get; set; }
    public Guid? TenantId { get; set; }
    public string? TenantName { get; set; }
    public string? TenantCode { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsAnonymous { get; set; }
    public DateTime CreatedAt { get; set; }
}

