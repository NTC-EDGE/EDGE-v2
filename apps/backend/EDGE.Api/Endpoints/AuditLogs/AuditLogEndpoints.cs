using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.AuditLogs.Queries.GetAuditLogs;
using EDGE.Application.AuditLogs.DTOs;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Api.Endpoints.AuditLogs.DTOs;

namespace EDGE.Api.Endpoints.AuditLogs;

public static class AuditLogEndpoints
{
    public static RouteGroupBuilder MapAuditLogEndpoints(this RouteGroupBuilder group)
    {
        var logs = group.MapGroup("audit-logs")
            .WithTags("Audit Logs");

        logs.MapGet("/", GetAuditLogs)
            .WithName("GetAuditLogs")
            .WithSummary("Get system audit logs")
            .WithDescription("Retrieves paginated system audit logs scoped by optional tenantId.")
            .Produces<PagedAuditLogsResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        return group;
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> GetAuditLogs(
        [FromQuery] int? pageNumber,
        [FromQuery] int? pageSize,
        [FromQuery] string? searchTerm,
        [FromQuery] Guid? tenantId,
        IMediator mediator)
    {
        var (items, totalCount) = await mediator.Send(new GetAuditLogsQuery(pageNumber ?? 1, pageSize ?? 20, searchTerm, tenantId));
        return Results.Ok(new PagedAuditLogsResponse
        {
            Succeeded = true,
            Data = items,
            TotalCount = totalCount,
            PageNumber = pageNumber ?? 1,
            PageSize = pageSize ?? 20
        });
    }
}
