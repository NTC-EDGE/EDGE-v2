using System.Collections.Generic;
using EDGE.Application.SystemErrorLogs.DTOs;

namespace EDGE.Api.Endpoints.SystemErrorLogs.DTOs;

public class PagedSystemErrorLogsResponse
{
    public List<SystemErrorLogDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
}
