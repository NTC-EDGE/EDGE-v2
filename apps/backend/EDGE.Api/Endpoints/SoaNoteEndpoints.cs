using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Common.Models;
using EDGE.Application.SoaNotes.DTOs;
using EDGE.Application.SoaNotes.Commands.CreateSoaNote;
using EDGE.Application.SoaNotes.Commands.UpdateSoaNote;
using EDGE.Application.SoaNotes.Commands.DeleteSoaNote;
using EDGE.Application.SoaNotes.Queries.GetAllSoaNotes;
using EDGE.Application.SoaNotes.Queries.GetSoaNoteById;

namespace EDGE.Api.Endpoints;

public static class SoaNoteEndpoints
{
    public static RouteGroupBuilder MapSoaNoteEndpoints(this RouteGroupBuilder group)
    {
        var soaNotes = group.MapGroup("soa-notes")
            .WithTags("SOA Notes");

        soaNotes.MapPost("/", CreateSoaNote)
            .WithName("CreateSoaNote")
            .WithTags("SOA Notes")
            .WithSummary("Create new SOA note template")
            .WithDescription("Creates a new reusable Statement of Account note or terms template.")
            .Produces<SoaNoteDto>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        soaNotes.MapGet("/", GetAllSoaNotes)
            .WithName("GetAllSoaNotes")
            .WithTags("SOA Notes")
            .WithSummary("Retrieve all SOA note templates")
            .WithDescription("Retrieves a paginated list of reusable Statement of Account note templates.")
            .Produces<PaginatedApiResponse<SoaNoteDto>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        soaNotes.MapGet("/{id:guid}", GetSoaNoteById)
            .WithName("GetSoaNoteById")
            .WithTags("SOA Notes")
            .WithSummary("Retrieve SOA note template by ID")
            .WithDescription("Retrieves the details of a specific Statement of Account note template.")
            .Produces<SoaNoteDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        soaNotes.MapPut("/{id:guid}", UpdateSoaNote)
            .WithName("UpdateSoaNote")
            .WithTags("SOA Notes")
            .WithSummary("Update SOA note template")
            .WithDescription("Updates the details of a specific Statement of Account note template.")
            .Produces<SoaNoteDto>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        soaNotes.MapDelete("/{id:guid}", DeleteSoaNote)
            .WithName("DeleteSoaNote")
            .WithTags("SOA Notes")
            .WithSummary("Delete SOA note template")
            .WithDescription("Permanently removes a specific Statement of Account note template.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        return group;
    }

    [HasPermission(Permissions.CreateSoaNotes)]
    public static async Task<IResult> CreateSoaNote(
        CreateSoaNoteCommand command,
        IValidator<CreateSoaNoteCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return Results.Created($"/api/v2/soa-notes/{result.Id}", result);
    }

    [HasPermission(Permissions.ReadSoaNotes)]
    public static async Task<IResult> GetAllSoaNotes(
        int? pageNumber,
        int? pageSize,
        string? searchTerm,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetAllSoaNotesQuery(pageNumber, pageSize, searchTerm));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadSoaNotes)]
    public static async Task<IResult> GetSoaNoteById(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetSoaNoteByIdQuery(id));
        return result is not null ? Results.Ok(result) : Results.NotFound(new { message = $"SOA note template with ID '{id}' was not found." });
    }

    [HasPermission(Permissions.UpdateSoaNotes)]
    public static async Task<IResult> UpdateSoaNote(
        Guid id,
        UpdateSoaNoteCommand command,
        IValidator<UpdateSoaNoteCommand> validator,
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

        try
        {
            var result = await mediator.Send(command);
            return Results.Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(new { message = ex.Message });
        }
    }

    [HasPermission(Permissions.DeleteSoaNotes)]
    public static async Task<IResult> DeleteSoaNote(Guid id, IMediator mediator)
    {
        try
        {
            await mediator.Send(new DeleteSoaNoteCommand(id));
            return Results.NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(new { message = ex.Message });
        }
    }
}
