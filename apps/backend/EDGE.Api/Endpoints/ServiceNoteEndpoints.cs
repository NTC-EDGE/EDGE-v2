using System;
using System.Collections.Generic;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceNotes.DTOs;
using EDGE.Application.ServiceNotes.Commands.CreateServiceNote;
using EDGE.Application.ServiceNotes.Commands.UpdateServiceNote;
using EDGE.Application.ServiceNotes.Commands.DeleteServiceNote;
using EDGE.Application.ServiceNotes.Queries.GetAllServiceNotes;
using EDGE.Application.ServiceNotes.Queries.GetServiceNoteById;

namespace EDGE.Api.Endpoints;

public static class ServiceNoteEndpoints
{
    public static RouteGroupBuilder MapServiceNoteEndpoints(this RouteGroupBuilder group)
    {
        var notes = group.MapGroup("service-notes")
            .WithTags("Service Notes");

        notes.MapPost("/", CreateServiceNote)
            .WithName("CreateServiceNote")
            .WithTags("Service Notes")
            .WithSummary("Create new service compliance note")
            .WithDescription("Creates a new compliance or regulatory instruction note associated with a service.")
            .Produces<ServiceNoteDto>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        notes.MapGet("/", GetAllServiceNotes)
            .WithName("GetAllServiceNotes")
            .WithTags("Service Notes")
            .WithSummary("Retrieve all service compliance notes")
            .WithDescription("Retrieves a list of all regulatory and guideline notes registered across services.")
            .Produces<PaginatedApiResponse<ServiceNoteDto>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        notes.MapGet("/{id:guid}", GetServiceNoteById)
            .WithName("GetServiceNoteById")
            .WithTags("Service Notes")
            .WithSummary("Retrieve service note by ID")
            .WithDescription("Retrieves the details of a specific service note by its unique identifier.")
            .Produces<ServiceNoteDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        notes.MapPut("/{id:guid}", UpdateServiceNote)
            .WithName("UpdateServiceNote")
            .WithTags("Service Notes")
            .WithSummary("Update service compliance note")
            .WithDescription("Updates the details of a specific service note.")
            .Produces<ServiceNoteDto>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        notes.MapDelete("/{id:guid}", DeleteServiceNote)
            .WithName("DeleteServiceNote")
            .WithTags("Service Notes")
            .WithSummary("Delete service compliance note")
            .WithDescription("Permanently removes a specific service note from the database.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        // Also alias /notes route group to ensure full backward compatibility
        var legacyNotes = group.MapGroup("notes")
            .WithTags("Service Notes");

        legacyNotes.MapPost("/", CreateServiceNote)
            .Produces<ServiceNoteDto>(StatusCodes.Status201Created);
        legacyNotes.MapGet("/", GetAllServiceNotes)
            .Produces<PaginatedApiResponse<ServiceNoteDto>>(StatusCodes.Status200OK);
        legacyNotes.MapGet("/{id:guid}", GetServiceNoteById)
            .Produces<ServiceNoteDto>(StatusCodes.Status200OK);
        legacyNotes.MapPut("/{id:guid}", UpdateServiceNote)
            .Produces<ServiceNoteDto>(StatusCodes.Status200OK);
        legacyNotes.MapDelete("/{id:guid}", DeleteServiceNote)
            .Produces(StatusCodes.Status204NoContent);

        return group;
    }

    [HasPermission(Permissions.CreateServiceNotes)]
    public static async Task<IResult> CreateServiceNote(
        CreateServiceNoteCommand command,
        IValidator<CreateServiceNoteCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return Results.Created($"/api/v2/service-notes/{result.Id}", result);
    }

    [HasPermission(Permissions.ReadServiceNotes)]
    public static async Task<IResult> GetAllServiceNotes(
        int? pageNumber,
        int? pageSize,
        string? searchTerm,
        Guid? serviceId,
        Guid? serviceVariantId,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetAllServiceNotesQuery(pageNumber, pageSize, searchTerm, serviceId, serviceVariantId));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadServiceNotes)]
    public static async Task<IResult> GetServiceNoteById(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetServiceNoteByIdQuery(id));
        return result is not null ? Results.Ok(result) : Results.NotFound(new { message = $"Service note with ID '{id}' was not found." });
    }

    [HasPermission(Permissions.UpdateServiceNotes)]
    public static async Task<IResult> UpdateServiceNote(
        Guid id,
        UpdateServiceNoteCommand command,
        IValidator<UpdateServiceNoteCommand> validator,
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

    [HasPermission(Permissions.DeleteServiceNotes)]
    public static async Task<IResult> DeleteServiceNote(Guid id, IMediator mediator)
    {
        try
        {
            await mediator.Send(new DeleteServiceNoteCommand(id));
            return Results.NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(new { message = ex.Message });
        }
    }
}
