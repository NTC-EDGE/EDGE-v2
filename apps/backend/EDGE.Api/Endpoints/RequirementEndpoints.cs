using MediatR;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Requirements.Commands.CreateRequirement;
using EDGE.Application.Requirements.Commands.UpdateRequirement;
using EDGE.Application.Requirements.Commands.DeleteRequirement;
using EDGE.Application.Requirements.Queries.GetRequirementById;
using EDGE.Application.Requirements.Queries.GetRequirements;

namespace EDGE.Api.Endpoints;

public static class RequirementEndpoints
{
    public static RouteGroupBuilder MapRequirementEndpoints(this RouteGroupBuilder group)
    {
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
            .WithDescription("Retrieves a list of all requirement records.");

        return group;
    }

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
            ? Results.Created($"/api/v2/requirements/{result.Data}", result)
            : Results.BadRequest(result);
    }

    public static async Task<IResult> UpdateRequirement(
        Guid id,
        UpdateRequirementCommand command,
        IValidator<UpdateRequirementCommand> validator,
        IMediator mediator)
    {
        if (id != command.Id)
        {
            return Results.BadRequest(new { message = "The path ID does not match the request body ID." });
        }

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public static async Task<IResult> DeleteRequirement(
        Guid id,
        IValidator<DeleteRequirementCommand> validator,
        IMediator mediator)
    {
        var command = new DeleteRequirementCommand(id);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public static async Task<IResult> GetRequirementById(
        Guid id,
        IValidator<GetRequirementByIdQuery> validator,
        IMediator mediator)
    {
        var query = new GetRequirementByIdQuery(id);
        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    public static async Task<IResult> GetRequirements(
        IValidator<GetRequirementsQuery> validator,
        IMediator mediator)
    {
        var query = new GetRequirementsQuery();
        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
}
