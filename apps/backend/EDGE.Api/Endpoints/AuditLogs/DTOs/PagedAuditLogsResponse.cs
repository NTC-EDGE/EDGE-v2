using System.Collections.Generic;
using EDGE.Application.AuditLogs.DTOs;

namespace EDGE.Api.Endpoints.AuditLogs.DTOs;

public class PagedAuditLogsResponse
{
    public bool Succeeded { get; set; }
    public List<AuditLogDto> Data { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}
