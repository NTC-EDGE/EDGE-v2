using System;

namespace EDGE.Application.Announcements.DTOs;

public class SystemAnnouncementDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "Info";
    public bool IsActive { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string TargetAudience { get; set; } = "All";
    public DateTime CreatedAt { get; set; }
}
