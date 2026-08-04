using FluentValidation;
using MediatR;
using EDGE.Application.Feedback.Commands.SubmitFeedback;
using EDGE.Application.Feedback.Commands.DeleteFeedback;
using EDGE.Application.Feedback.Queries.GetFeedbacks;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;

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
            .WithSummary("Submit user feedback")
            .WithDescription("Submits user or client feedback for administrative review.");

        feedback.MapGet("/", GetFeedbacks)
            .WithName("GetFeedbacks")
            .WithSummary("Get feedback submissions")
            .WithDescription("Retrieves all customer and client feedback submissions.");

        feedback.MapDelete("/{id:guid}", DeleteFeedback)
            .WithName("DeleteFeedback")
            .WithSummary("Delete feedback submission")
            .WithDescription("Removes a feedback entry.");

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

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> GetFeedbacks(IMediator mediator)
    {
        var result = await mediator.Send(new GetFeedbacksQuery());
        return Results.Ok(new { succeeded = true, data = result });
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> DeleteFeedback(Guid id, IMediator mediator)
    {
        var success = await mediator.Send(new DeleteFeedbackCommand(id));
        return success ? Results.NoContent() : Results.NotFound(new { message = "Feedback not found" });
    }
}
