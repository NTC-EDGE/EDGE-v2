using System;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EDGE.Application.Feedback.Commands.SubmitFeedback;
using EDGE.Application.Feedback.Commands.DeleteFeedback;
using EDGE.Application.Feedback.Queries.GetFeedbacks;

namespace EDGE.Api.Endpoints;

public static class FeedbackEndpoints
{
    public static RouteGroupBuilder MapFeedbackEndpoints(this RouteGroupBuilder group)
    {
        var feedback = group.MapGroup("feedback")
            .WithTags("Feedback");

        feedback.MapPost("/", SubmitFeedback)
            .AllowAnonymous()
            .WithName("SubmitFeedback")
            .WithSummary("Submit user feedback addressed to an NTC Regional Office")
            .WithDescription("Submits user or client feedback addressed to a selected NTC Regional Office (Tenant) for regional review.");

        feedback.MapGet("/", GetFeedbacks)
            .RequireAuthorization()
            .WithName("GetFeedbacks")
            .WithSummary("Get regional feedback submissions")
            .WithDescription("Retrieves customer and client feedback submissions scoped to the staff member's active NTC Regional Office.");

        feedback.MapDelete("/{id:guid}", DeleteFeedback)
            .RequireAuthorization()
            .WithName("DeleteFeedback")
            .WithSummary("Delete feedback submission")
            .WithDescription("Removes a feedback entry within the staff member's authorized NTC Regional Office.");

        return group;
    }

    public static async Task<IResult> SubmitFeedback(
        SubmitFeedbackCommand command,
        IValidator<SubmitFeedbackCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return Results.Created($"/api/v2/feedback/{result.Id}", result);
    }

    [Authorize]
    public static async Task<IResult> GetFeedbacks(
        [FromQuery] Guid? tenantId,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetFeedbacksQuery(tenantId));
        return Results.Ok(new { succeeded = true, data = result });
    }

    [Authorize]
    public static async Task<IResult> DeleteFeedback(Guid id, IMediator mediator)
    {
        var success = await mediator.Send(new DeleteFeedbackCommand(id));
        return success ? Results.NoContent() : Results.NotFound(new { message = "Feedback not found" });
    }
}

