using System.Collections.Generic;
using MediatR;
using EDGE.Application.SystemErrorLogs.DTOs;

namespace EDGE.Application.SystemErrorLogs.Queries.GetSystemErrorLogs;

public record GetSystemErrorLogsQuery(
    int PageNumber = 1,
    int PageSize = 20,
    string? Level = null,
    string? SearchTerm = null
) : IRequest<(List<SystemErrorLogDto> Items, int TotalCount)>;
