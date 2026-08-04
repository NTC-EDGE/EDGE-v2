using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.AuditLogs.Queries.GetAuditLogs;

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
            .WithDescription("Retrieves paginated system audit logs scoped by optional tenantId.");

        return group;
    }

    public static async Task<IResult> GetAuditLogs(
        [FromQuery] int? pageNumber,
        [FromQuery] int? pageSize,
        [FromQuery] string? searchTerm,
        [FromQuery] Guid? tenantId,
        IMediator mediator)
    {
        var (items, totalCount) = await mediator.Send(new GetAuditLogsQuery(pageNumber ?? 1, pageSize ?? 20, searchTerm, tenantId));
        return Results.Ok(new { succeeded = true, data = items, totalCount, pageNumber = pageNumber ?? 1, pageSize = pageSize ?? 20 });
    }
}
