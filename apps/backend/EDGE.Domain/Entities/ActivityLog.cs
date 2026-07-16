using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class ActivityLog : BaseEntity
{
    public string ActivityType { get; set; } = null!; // e.g., "CreateApplication"
    public string Description { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string IpAddress { get; set; } = null!;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
