using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using EDGE.Domain.Authorization;

namespace EDGE.Api.Filters;

public class TenantMembershipFilter : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var tenantContextService = context.HttpContext.RequestServices.GetRequiredService<ITenantContextService>();
        var tenantId = tenantContextService.TenantId;

        if (!tenantId.HasValue || !await tenantContextService.IsUserActiveMemberAsync(tenantId.Value, context.HttpContext.RequestAborted))
        {
            return Results.Problem(
                title: "Access Denied",
                detail: $"Access denied: You are not an active member of tenant '{tenantId}'.",
                statusCode: StatusCodes.Status403Forbidden
            );
        }

        return await next(context);
    }
}

public static class TenantMembershipFilterExtensions
{
    public static RouteGroupBuilder RequireTenantMembership(this RouteGroupBuilder builder)
    {
        builder.AddEndpointFilter<TenantMembershipFilter>();
        return builder;
    }

    public static RouteHandlerBuilder RequireTenantMembership(this RouteHandlerBuilder builder)
    {
        builder.AddEndpointFilter<TenantMembershipFilter>();
        return builder;
    }
}
