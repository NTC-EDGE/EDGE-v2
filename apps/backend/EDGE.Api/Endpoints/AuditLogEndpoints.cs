using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.AuditLogs.Queries.GetAuditLogs;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;

namespace EDGE.Api.Endpoints;

public static class AuditLogEndpoints
{
    public static RouteGroupBuilder MapAuditLogEndpoints(this RouteGroupBuilder group)
    {
        var logs = group.MapGroup("audit-logs")
            .WithTags("Audit Logs");

        logs.MapGet("/", GetAuditLogs)
            .WithName("GetAuditLogs")
            .WithSummary("Get system audit logs")
            .WithDescription("Retrieves paginated system audit logs.");

        return group;
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> GetAuditLogs(
        int? pageNumber,
        int? pageSize,
        string? searchTerm,
        IMediator mediator)
    {
        var (items, totalCount) = await mediator.Send(new GetAuditLogsQuery(pageNumber ?? 1, pageSize ?? 20, searchTerm));
        return Results.Ok(new { succeeded = true, data = items, totalCount, pageNumber = pageNumber ?? 1, pageSize = pageSize ?? 20 });
    }
}
