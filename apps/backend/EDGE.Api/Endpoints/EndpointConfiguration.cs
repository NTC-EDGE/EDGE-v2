using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace EDGE.Api.Endpoints;

public static class EndpointConfiguration
{
    public static void MapApiEndpoints(this IEndpointRouteBuilder app)
    {
        // Keep webhooks at '/webhooks/clerk' as configured in the Clerk developer portal
        app.MapWebhookEndpoints();

        // Standardize all CRUD endpoints under the '/api/v2' route group prefix
        var apiV2Group = app.MapGroup("/api/v2");

        apiV2Group.MapTenantEndpoints();
        apiV2Group.MapTenantMemberEndpoints();
        apiV2Group.MapApplicationEndpoints();
        apiV2Group.MapUserEndpoints();
        apiV2Group.MapRoleEndpoints();
        apiV2Group.MapPermissionEndpoints();
        apiV2Group.MapRolePermissionEndpoints();

        // Catalog hierarchy endpoints
        apiV2Group.MapServiceCategoryEndpoints();
        apiV2Group.MapServiceEndpoints();
        apiV2Group.MapServiceVariantEndpoints();
    }
}

