using System;
using System.Collections.Generic;

namespace EDGE.Application.Common.Models;

public class PaginatedApiResponse<T>
{
    public bool Succeeded { get; set; } = true;
    public string? Message { get; set; }
    public List<T> Data { get; set; } = new();
    public List<T> Items
    {
        get => Data;
        set => Data = value;
    }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalCount { get; set; }
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PaginatedApiResponse() { }

    public PaginatedApiResponse(List<T> data, int pageNumber, int pageSize, int totalCount, string? message = null)
    {
        Data = data ?? new List<T>();
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalCount = totalCount;
        TotalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0;
        Message = message;
        Succeeded = true;
    }
}
