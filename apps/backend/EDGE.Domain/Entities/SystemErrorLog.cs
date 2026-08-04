using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class SystemErrorLog : BaseEntity
{
    public string Level { get; set; } = "Error"; // "Error", "Critical", "Warning"
    public string Message { get; set; } = string.Empty;
    public string? ExceptionType { get; set; }
    public string? StackTrace { get; set; }
    public string? Source { get; set; }
    public string? RequestPath { get; set; }
    public string? HttpMethod { get; set; }
    public string? UserEmail { get; set; }
    public DateTime LoggedAt { get; set; } = DateTime.UtcNow;
}
