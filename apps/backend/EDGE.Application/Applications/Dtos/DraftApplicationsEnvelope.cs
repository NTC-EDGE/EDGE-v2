using System;
using System.Collections.Generic;
using System.Linq;

namespace EDGE.Application.Applications.Dtos;

public class DraftApplicationsEnvelope
{
    public bool Succeeded { get; set; } = true;
    public string? Message { get; set; }

    /// <summary>
    /// Populated when querying draft category summary counts.
    /// </summary>
    public List<DraftCategorySummaryDto>? Summaries { get; set; }

    /// <summary>
    /// Populated when querying paged draft application items.
    /// </summary>
    public List<DraftApplicationItemDto>? Items { get; set; }

    /// <summary>
    /// Dynamic data property ensuring seamless compatibility with ApiResponse data payload structures.
    /// </summary>
    public object? Data => Items != null ? Items : Summaries;

    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalCount { get; set; }
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public static DraftApplicationsEnvelope SuccessSummaries(
        List<DraftCategorySummaryDto> summaries,
        string message = "User draft applications retrieved successfully.")
    {
        return new DraftApplicationsEnvelope
        {
            Succeeded = true,
            Message = message,
            Summaries = summaries ?? new List<DraftCategorySummaryDto>(),
            TotalCount = summaries?.Sum(s => s.DraftCount) ?? 0,
            PageNumber = 1,
            PageSize = summaries?.Count ?? 0,
            TotalPages = 1
        };
    }

    public static DraftApplicationsEnvelope SuccessPaged(
        List<DraftApplicationItemDto> items,
        int pageNumber,
        int pageSize,
        int totalCount,
        string message = "User draft applications retrieved successfully.")
    {
        var totalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0;
        return new DraftApplicationsEnvelope
        {
            Succeeded = true,
            Message = message,
            Items = items ?? new List<DraftApplicationItemDto>(),
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public static DraftApplicationsEnvelope Fail(string message)
    {
        return new DraftApplicationsEnvelope
        {
            Succeeded = false,
            Message = message,
            Summaries = null,
            Items = null,
            PageNumber = 1,
            PageSize = 0,
            TotalCount = 0,
            TotalPages = 0
        };
    }
}
