using MediatR;
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

        requirements.MapPost("/", async (CreateRequirementCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.Succeeded
                ? Results.Created($"/api/v2/requirements/{result.Data}", result)
                : Results.BadRequest(result);
        })
        .WithName("CreateRequirement")
        .WithSummary("Create a new requirement")
        .WithDescription("Creates a new master requirement record.");

        requirements.MapPut("/{id:guid}", async (Guid id, UpdateRequirementCommand command, IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest(new { message = "The path ID does not match the request body ID." });
            }

            var result = await mediator.Send(command);
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("UpdateRequirement")
        .WithSummary("Update an existing requirement")
        .WithDescription("Updates the details of a specific requirement.");

        requirements.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new DeleteRequirementCommand(id));
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("DeleteRequirement")
        .WithSummary("Delete a requirement")
        .WithDescription("Deletes a specific requirement record.");

        requirements.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetRequirementByIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetRequirementById")
        .WithSummary("Get a requirement by ID")
        .WithDescription("Retrieves the details of a specific requirement.");

        requirements.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetRequirementsQuery());
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("GetRequirements")
        .WithSummary("Get all requirements")
        .WithDescription("Retrieves a list of all requirement records.");

        return group;
    }
}
