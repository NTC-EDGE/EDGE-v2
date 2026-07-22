using FluentValidation;
using MediatR;
using EDGE.Application.Notes.Commands.CreateNote;
using EDGE.Application.Notes.Commands.UpdateNote;
using EDGE.Application.Notes.Commands.DeleteNote;
using EDGE.Application.Notes.Queries.GetAllNotes;
using EDGE.Application.Notes.Queries.GetNoteById;

namespace EDGE.Api.Endpoints;

public static class NoteEndpoints
{
    public static RouteGroupBuilder MapNoteEndpoints(this RouteGroupBuilder group)
    {
        var notes = group.MapGroup("notes")
            .WithTags("Notes");

        notes.MapPost("/", async (
            CreateNoteCommand command,
            IValidator<CreateNoteCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Created($"/api/v2/notes/{result.Id}", result);
        })
        .WithName("CreateNote")
        .WithTags("Notes")
        .WithSummary("Create new regulatory note")
        .WithDescription("Creates a new compliance or regulatory instruction note associated with a service category.")
        .RequireAuthorization();

        notes.MapGet("/", async (
            int? pageNumber,
            int? pageSize,
            IMediator mediator) =>
        {
            var result = await mediator.Send(new GetAllNotesQuery(pageNumber ?? 1, pageSize ?? 10));
            return Results.Ok(result);
        })
        .WithName("GetAllNotes")
        .WithTags("Notes")
        .WithSummary("Retrieve all regulatory notes")
        .WithDescription("Retrieves a list of all regulatory and guideline notes registered across service categories.")
        .RequireAuthorization();

        notes.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetNoteByIdQuery(id));
            return result is not null ? Results.Ok(result) : Results.NotFound(new { message = $"Note with ID '{id}' was not found." });
        })
        .WithName("GetNoteById")
        .WithTags("Notes")
        .WithSummary("Retrieve note by ID")
        .WithDescription("Retrieves the details of a specific compliance note by its unique identifier.")
        .RequireAuthorization();

        notes.MapPut("/{id:guid}", async (
            Guid id,
            UpdateNoteCommand command,
            IValidator<UpdateNoteCommand> validator,
            IMediator mediator) =>
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
        })
        .WithName("UpdateNote")
        .WithTags("Notes")
        .WithSummary("Update regulatory note")
        .WithDescription("Updates the details of a specific compliance note.")
        .RequireAuthorization();

        notes.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            try
            {
                await mediator.Send(new DeleteNoteCommand(id));
                return Results.NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { message = ex.Message });
            }
        })
        .WithName("DeleteNote")
        .WithTags("Notes")
        .WithSummary("Delete regulatory note")
        .WithDescription("Permanently removes a specific compliance note from the database.")
        .RequireAuthorization();

        return group;
    }
}
