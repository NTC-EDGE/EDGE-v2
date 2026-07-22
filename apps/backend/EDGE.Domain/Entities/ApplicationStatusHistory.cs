using System;
using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class ApplicationStatusHistory : BaseEntity
{
    public Guid ApplicationId { get; set; }
    public Application? Application { get; set; }
    public ApplicationStatus Status { get; set; }
    public string? Remarks { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public Guid? UserId { get; set; }
    public User? User { get; set; }
}
