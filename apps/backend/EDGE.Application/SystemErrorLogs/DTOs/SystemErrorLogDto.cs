using System;

namespace EDGE.Application.SystemErrorLogs.DTOs;

public class SystemErrorLogDto
{
    public Guid Id { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ExceptionType { get; set; }
    public string? StackTrace { get; set; }
    public string? Source { get; set; }
    public string? RequestPath { get; set; }
    public string? HttpMethod { get; set; }
    public string? UserEmail { get; set; }
    public DateTime LoggedAt { get; set; }
}
