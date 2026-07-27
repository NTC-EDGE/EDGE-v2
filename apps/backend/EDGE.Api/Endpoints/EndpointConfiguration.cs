using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace EDGE.Api.Endpoints;

public static class EndpointConfiguration
{
    public static void MapApiEndpoints(this IEndpointRouteBuilder app)
    {
        // Keep webhooks at '/webhooks/clerk' as configured in the Clerk developer portal
        app.MapWebhookEndpoints();
        app.MapFormPrintingEndpoints();

        // Standardize all CRUD endpoints under the '/api/v2' route group prefix
        var apiV2Group = app.MapGroup("/api/v2");

        apiV2Group.MapTenantEndpoints();
        apiV2Group.MapTenantMemberEndpoints();
        apiV2Group.MapApplicationEndpoints();
        apiV2Group.MapUserEndpoints();
        apiV2Group.MapRoleEndpoints();
        apiV2Group.MapPermissionEndpoints();
        apiV2Group.MapRolePermissionEndpoints();
        apiV2Group.MapScheduleEndpoints();
        apiV2Group.MapServiceEndpoints();
        apiV2Group.MapServiceCategoryEndpoints();
        apiV2Group.MapFieldOfficeEndpoints();
        apiV2Group.MapApplicantEndpoints();
        apiV2Group.MapNoteEndpoints();
        apiV2Group.MapStorageEndpoints();
        apiV2Group.MapRegionEndpoints();
        apiV2Group.MapProvinceEndpoints();
        apiV2Group.MapMunicipalityEndpoints();
        apiV2Group.MapBarangayEndpoints();
        apiV2Group.MapFeeEndpoints();
        apiV2Group.MapServiceFeeEndpoints();
        apiV2Group.MapRequirementEndpoints();
        apiV2Group.MapServiceVariantRequirementEndpoints();
        apiV2Group.MapFormEndpoints();
        apiV2Group.MapFeedbackEndpoints();
        apiV2Group.MapSystemAnnouncementEndpoints();
        apiV2Group.MapAuditLogEndpoints();
    }
}
