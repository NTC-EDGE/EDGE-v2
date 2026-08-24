using System;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Forms.Commands.CreateForm;
using EDGE.Application.Forms.Commands.UpdateForm;
using EDGE.Application.Forms.Commands.DeleteForm;
using EDGE.Application.Forms.Commands.DuplicateForm;
using EDGE.Application.Forms.Queries.GetForms;
using EDGE.Application.Forms.Queries.GetFormById;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Api.Endpoints;

public static class FormEndpoints
{
    public static RouteGroupBuilder MapFormEndpoints(this RouteGroupBuilder group)
    {
        var forms = group.MapGroup("forms")
            .WithTags("Forms");

        forms.MapPost("/", CreateForm)
            .WithName("CreateForm")
            .WithSummary("Create a form template")
            .WithDescription("Creates a new dynamic form template schema for a service.");

        forms.MapGet("/", GetForms)
            .WithName("GetForms")
            .WithSummary("Get all forms")
            .WithDescription("Retrieves paginated dynamic form templates with optional search and service filtering.")
            .Produces<EDGE.Application.Common.Models.PaginatedApiResponse<FormDto>>(StatusCodes.Status200OK);

        forms.MapGet("/{id:guid}", GetFormById)
            .WithName("GetFormById")
            .WithSummary("Get a form template by ID")
            .WithDescription("Retrieves a dynamic form template schema by its identifier.");

        forms.MapPut("/{id:guid}", UpdateForm)
            .WithName("UpdateForm")
            .WithSummary("Update a form template")
            .WithDescription("Updates an existing dynamic form template schema.");

        forms.MapDelete("/{id:guid}", DeleteForm)
            .WithName("DeleteForm")
            .WithSummary("Delete a form template")
            .WithDescription("Deletes a dynamic form template.");

        forms.MapPost("/{id:guid}/duplicate", DuplicateForm)
            .WithName("DuplicateForm")
            .WithSummary("Duplicate a form template")
            .WithDescription("Duplicates an existing dynamic form template into a new schema.");

        return group;
    }

    public static async Task<IResult> CreateForm(
        CreateFormCommand command,
        IValidator<CreateFormCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return Results.Created($"/api/v2/forms/{result.FormId}", result);
    }

    public static async Task<IResult> GetForms(
        IMediator mediator,
        int pageNumber = 1,
        int pageSize = 50,
        string? searchTerm = null,
        Guid? serviceId = null)
    {
        var result = await mediator.Send(new GetFormsQuery(pageNumber, pageSize, searchTerm, serviceId));
        return Results.Ok(result);
    }

    public static async Task<IResult> GetFormById(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetFormByIdQuery(id));
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    public static async Task<IResult> UpdateForm(
        Guid id,
        UpdateFormCommand command,
        IValidator<UpdateFormCommand> validator,
        IMediator mediator)
    {
        if (id != command.Id)
        {
            return Results.BadRequest(new { message = "Path ID does not match request body ID." });
        }

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        if (result.IsNotFound)
        {
            return Results.NotFound(result);
        }

        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public static async Task<IResult> DeleteForm(
        Guid id,
        IValidator<DeleteFormCommand> validator,
        IMediator mediator)
    {
        var command = new DeleteFormCommand(id);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        if (result.IsNotFound)
        {
            return Results.NotFound(result);
        }

        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    public static async Task<IResult> DuplicateForm(
        Guid id,
        DuplicateFormCommand? command,
        IValidator<DuplicateFormCommand> validator,
        IMediator mediator)
    {
        var cmd = command ?? new DuplicateFormCommand(id);
        if (cmd.Id != id)
        {
            cmd = cmd with { Id = id };
        }

        var validationResult = await validator.ValidateAsync(cmd);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(cmd);
        if (result.IsNotFound)
        {
            return Results.NotFound(result);
        }

        return result.Succeeded ? Results.Created($"/api/v2/forms/{result.Data?.FormId}", result) : Results.BadRequest(result);
    }
}
