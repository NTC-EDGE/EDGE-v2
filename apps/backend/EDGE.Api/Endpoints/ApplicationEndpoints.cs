using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Application.Applications.Commands;
using EDGE.Application.Applications.Queries;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using EDGE.Infrastructure.Hubs;

namespace EDGE.Api.Endpoints;

public static class ApplicationEndpoints
{
    public static void MapApplicationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/applications").WithTags("Applications");

        group.MapPost("/", async (
            CreateApplicationCommand command,
            IValidator<CreateApplicationCommand> validator,
            IMediator mediator,
            IBackgroundJobClient backgroundJobs,
            IHubContext<NotificationHub> hubContext) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);

            backgroundJobs.Enqueue(() => Console.WriteLine($"[Hangfire Job] Processed application: {result.Title} by {result.ApplicantName}"));
            await hubContext.Clients.All.SendAsync("ReceiveNotification", $"New application submitted: '{result.Title}'");

            return Results.Created($"/applications/{result.Id}", result);
        })
        .WithName("CreateApplication")
        .RequireAuthorization(Policies.CanSubmitApplication);

        group.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetApplicationsQuery());
            return Results.Ok(result);
        })
        .WithName("GetApplications")
        .RequireAuthorization(Policies.CanViewAllApplications);

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetApplicationQuery(id));
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetApplicationById")
        .RequireAuthorization(Policies.CanViewAllApplications);

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateApplicationCommand command,
            IValidator<UpdateApplicationCommand> validator,
            IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest("Route ID does not match request body ID.");
            }

            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("UpdateApplication")
        .RequireAuthorization(Policies.CanEvaluateApplication);

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var success = await mediator.Send(new DeleteApplicationCommand(id));
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteApplication")
        .RequireAuthorization(Policies.AdminOnly);
    }
}
