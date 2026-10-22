using System;
using System.Collections.Generic;

namespace EDGE.Application.Applications.Dtos;

public class PagedApplicationListDto
{
    public List<ApplicationSummaryDto> Items { get; set; } = new();
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public int TotalCount { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
    public ApplicationStatisticsDto Statistics { get; set; } = new();
}

public class ApplicationStatisticsDto
{
    public int TotalCount { get; set; }
    public int SingleCount { get; set; }
    public int BulkCount { get; set; }
    public int EvaluatingCount { get; set; }
    public int ApprovedCount { get; set; }
    public int PaymentRequiredCount { get; set; }
    public int CompletedCount { get; set; }
    public int ReturnedCount { get; set; }
    public int ReadyDocumentsCount { get; set; }
}
