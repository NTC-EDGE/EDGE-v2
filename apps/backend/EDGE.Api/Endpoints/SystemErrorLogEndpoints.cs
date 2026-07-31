using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.SystemErrorLogs.Queries.GetSystemErrorLogs;
using EDGE.Application.SystemErrorLogs.DTOs;

namespace EDGE.Api.Endpoints;

public static class SystemErrorLogEndpoints
{
    public static RouteGroupBuilder MapSystemErrorLogEndpoints(this RouteGroupBuilder group)
    {
        var logs = group.MapGroup("error-logs")
            .WithTags("System Error Logs");

        logs.MapGet("/", GetErrorLogs)
            .WithName("GetSystemErrorLogs")
            .WithSummary("Get application error logs")
            .WithDescription("Retrieves paged system exception logs and stack traces for debugging and issue resolution.")
            .Produces<PagedSystemErrorLogsResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        return group;
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> GetErrorLogs(
        int? pageNumber,
        int? pageSize,
        string? level,
        string? searchTerm,
        IMediator mediator)
    {
        var (items, totalCount) = await mediator.Send(new GetSystemErrorLogsQuery(
            pageNumber ?? 1,
            pageSize ?? 20,
            level,
            searchTerm));

        return Results.Ok(new PagedSystemErrorLogsResponse { Items = items, TotalCount = totalCount });
    }
}

public class PagedSystemErrorLogsResponse
{
    public List<SystemErrorLogDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
}
