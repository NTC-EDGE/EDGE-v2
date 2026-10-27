using FluentValidation;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Requirements.Dtos;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Requirements.Commands.AttachServiceVariantRequirement;
using EDGE.Application.Requirements.Commands.CreateRequirement;
using EDGE.Application.Requirements.Commands.DeleteRequirement;
using EDGE.Application.Requirements.Commands.UnlinkServiceVariantRequirement;
using EDGE.Application.Requirements.Commands.UpdateRequirement;
using EDGE.Application.Requirements.Queries.GetRequirementById;
using EDGE.Application.Requirements.Queries.GetRequirements;
using EDGE.Application.Requirements.Queries.GetServiceRequirements;

namespace EDGE.Api.Endpoints;

public static class RequirementEndpoints
{
    public static RouteGroupBuilder MapRequirementEndpoints(this RouteGroupBuilder group)
    {
        // 1. Master Requirements Catalog APIs
        var requirements = group.MapGroup("requirements")
            .WithTags("Requirements");

        requirements.MapPost("/", CreateRequirement)
            .WithName("CreateRequirement")
            .WithSummary("Create a new requirement")
            .WithDescription("Creates a new master requirement record.");

        requirements.MapPut("/{id:guid}", UpdateRequirement)
            .WithName("UpdateRequirement")
            .WithSummary("Update an existing requirement")
            .WithDescription("Updates the details of a specific requirement.");

        requirements.MapDelete("/{id:guid}", DeleteRequirement)
            .WithName("DeleteRequirement")
            .WithSummary("Delete a requirement")
            .WithDescription("Deletes a specific requirement record.");

        requirements.MapGet("/{id:guid}", GetRequirementById)
            .WithName("GetRequirementById")
            .WithSummary("Get a requirement by ID")
            .WithDescription("Retrieves the details of a specific requirement.");

        requirements.MapGet("/", GetRequirements)
            .WithName("GetRequirements")
            .WithSummary("Get all requirements")
            .WithDescription("Retrieves a list of all requirement records.")
            .Produces<PaginatedApiResponse<RequirementDto>>(StatusCodes.Status200OK);

        // 2. Service Variant Requirement Rules Configuration & Citizen Query APIs
        var services = group.MapGroup("services")
            .WithTags("Service Requirements");

        services.MapPost("/{serviceId:guid}/variants/{variantId:guid}/requirements", AttachServiceVariantRequirement)
            .WithName("AttachServiceVariantRequirement")
            .WithSummary("Dynamically attach a requirement to a ServiceVariant");

        services.MapDelete("/{serviceId:guid}/variants/{variantId:guid}/requirements/{id:guid}", UnlinkServiceVariantRequirement)
            .WithName("UnlinkServiceVariantRequirement")
            .WithSummary("Unlink a requirement from a ServiceVariant");

        services.MapGet("/{serviceId:guid}/requirements", GetServiceRequirements)
            .WithName("GetServiceRequirements")
            .WithSummary("Fetch requirements for a service/variant");

        return group;
    }

    [HasPermission(Permissions.CreateRequirements)]
    public static async Task<IResult> CreateRequirement(
        CreateRequirementCommand command,
        IValidator<CreateRequirementCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result.Succeeded
            ? Results.CreatedAtRoute("GetRequirementById", new { id = result.Data }, result)
            : Results.BadRequest(result);
    }

    [HasPermission(Permissions.UpdateRequirements)]
    public static async Task<IResult> UpdateRequirement(
        Guid id,
        UpdateRequirementCommand command,
        IValidator<UpdateRequirementCommand> validator,
        IMediator mediator)
    {
        if (id != command.Id)
        {
            return Results.BadRequest(ApiResponse<bool>.Fail("Route ID does not match body ID."));
        }

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        if (!result.Succeeded)
        {
            if (result.Message != null && result.Message.Contains("not found"))
            {
                return Results.NotFound(result);
            }
            return Results.BadRequest(result);
        }

        return Results.Ok(result);
    }

    [HasPermission(Permissions.DeleteRequirements)]
    public static async Task<IResult> DeleteRequirement(
        Guid id,
        IMediator mediator)
    {
        var command = new DeleteRequirementCommand(id);
        var result = await mediator.Send(command);
        if (!result.Succeeded)
        {
            if (result.Message != null && result.Message.Contains("not found"))
            {
                return Results.NotFound(result);
            }
            return Results.BadRequest(result);
        }

        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadRequirements)]
    public static async Task<IResult> GetRequirements(
        int? pageNumber,
        int? pageSize,
        string? searchTerm,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetRequirementsQuery(pageNumber, pageSize, searchTerm));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadRequirements)]
    public static async Task<IResult> GetRequirementById(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetRequirementByIdQuery(id));
        if (!result.Succeeded)
        {
            return Results.NotFound(result);
        }
        return Results.Ok(result);
    }

    [HasPermission(Permissions.CreateRequirements)]
    public static async Task<IResult> AttachServiceVariantRequirement(
        Guid serviceId,
        Guid variantId,
        AttachServiceVariantRequirementCommand command,
        IValidator<AttachServiceVariantRequirementCommand> validator,
        IMediator mediator)
    {
        var payload = command with { ServiceId = serviceId, ServiceVariantId = variantId };

        var validationResult = await validator.ValidateAsync(payload);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(payload);
        if (!result.Succeeded)
        {
            if (result.Message != null && result.Message.Contains("not found"))
            {
                return Results.NotFound(result);
            }
            return Results.BadRequest(result);
        }

        return Results.Ok(result);
    }

    [HasPermission(Permissions.DeleteRequirements)]
    public static async Task<IResult> UnlinkServiceVariantRequirement(
        Guid serviceId,
        Guid variantId,
        Guid id,
        IMediator mediator)
    {
        var command = new UnlinkServiceVariantRequirementCommand(id);
        var result = await mediator.Send(command);
        if (!result.Succeeded)
        {
            if (result.Message != null && result.Message.Contains("not found"))
            {
                return Results.NotFound(result);
            }
            return Results.BadRequest(result);
        }

        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadRequirements)]
    public static async Task<IResult> GetServiceRequirements(
        Guid serviceId,
        Guid? variantId,
        IMediator mediator)
    {
        var query = new GetServiceRequirementsQuery(serviceId, variantId);
        var result = await mediator.Send(query);
        if (!result.Succeeded)
        {
            if (result.Message != null && result.Message.Contains("not found"))
            {
                return Results.NotFound(result);
            }
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
}
