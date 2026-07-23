using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Requirements.Commands.AttachServiceVariantRequirement;
using EDGE.Application.Requirements.Commands.CreateRequirement;
using EDGE.Application.Requirements.Commands.UnlinkServiceVariantRequirement;
using EDGE.Application.Requirements.Queries.GetRequirements;
using EDGE.Application.Requirements.Queries.GetServiceRequirements;

namespace EDGE.Api.Endpoints;

public static class RequirementEndpoints
{
    public static void MapRequirementEndpoints(this IEndpointRouteBuilder app)
    {
        var masterGroup = app.MapGroup("/api/v2/requirements")
            .WithTags("Requirements Catalog");

        // 1. Master Requirements Catalog APIs
        masterGroup.MapPost("", async (CreateRequirementCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("CreateMasterRequirement")
        .WithSummary("Create a new master requirement in the catalog");

        masterGroup.MapGet("", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetRequirementsQuery());
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("GetMasterRequirements")
        .WithSummary("List all master requirements in the catalog");

        // 2. Variant Requirement Rules Configuration APIs
        var serviceGroup = app.MapGroup("/api/v2/services")
            .WithTags("Service Requirements");

        serviceGroup.MapPost("/{serviceId:guid}/variants/{variantId:guid}/requirements", async (
            Guid serviceId,
            Guid variantId,
            AttachServiceVariantRequirementCommand command,
            IMediator mediator) =>
        {
            var updatedCommand = command with { ServiceId = serviceId, ServiceVariantId = variantId };
            var result = await mediator.Send(updatedCommand);
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("AttachServiceVariantRequirement")
        .WithSummary("Dynamically attach a requirement to a ServiceVariant");

        serviceGroup.MapDelete("/{serviceId:guid}/variants/{variantId:guid}/requirements/{id:guid}", async (
            Guid serviceId,
            Guid variantId,
            Guid id,
            IMediator mediator) =>
        {
            var result = await mediator.Send(new UnlinkServiceVariantRequirementCommand(id));
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("UnlinkServiceVariantRequirement")
        .WithSummary("Unlink a requirement from a ServiceVariant");

        // 3. Citizen Application Query API
        serviceGroup.MapGet("/{serviceId:guid}/requirements", async (
            Guid serviceId,
            Guid? variantId,
            string? examineeType,
            IMediator mediator) =>
        {
            var query = new GetServiceRequirementsQuery(serviceId, variantId, examineeType);
            var result = await mediator.Send(query);
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("GetServiceRequirements")
        .WithSummary("Fetch dynamic requirements required for a service/variant/examineeType");
    }
}
