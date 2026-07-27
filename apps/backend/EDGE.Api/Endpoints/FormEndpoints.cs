using System;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Forms.Commands.CreateForm;
using EDGE.Application.Forms.Queries.GetForms;

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
            .WithDescription("Retrieves all dynamic form templates.");

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

    public static async Task<IResult> GetForms(IMediator mediator)
    {
        var result = await mediator.Send(new GetFormsQuery());
        return Results.Ok(new { succeeded = true, data = result });
    }
}
