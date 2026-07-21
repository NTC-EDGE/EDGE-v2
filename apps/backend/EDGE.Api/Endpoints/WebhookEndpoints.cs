using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Domain.Models;
using EDGE.Application.Users.Commands.CreateUser;
using EDGE.Application.Users.Commands.UpdateUser;
using EDGE.Application.Users.Queries.GetUserByAuthUserId;
using EDGE.Application.Common.Interfaces;
using EDGE.Api.Filters;

namespace EDGE.Api.Endpoints;

public static class WebhookEndpoints
{
    public static void MapWebhookEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/webhooks/clerk", async (
            HttpContext httpContext,
            IMediator mediator,
            IClerkUserService clerkUserService) =>
        {
            if (httpContext.Items["ClerkWebhookPayload"] is not ClerkWebhookPayload payload)
            {
                return Results.BadRequest("Payload not available");
            }

            if (string.IsNullOrEmpty(payload.Type) || payload.Data is null)
            {
                return Results.BadRequest("Invalid webhook payload structure");
            }

            var success = false;
            var message = string.Empty;

            switch (payload.Type)
            {
                case "user.created":
                    if (payload.Data is ClerkUserData createData)
                    {
                        var cmd = new CreateUserCommand(
                            createData.Id,
                            createData.EmailAddresses.FirstOrDefault()?.EmailAddress ?? "",
                            createData.FirstName ?? "",
                            createData.LastName ?? ""
                        );
                        await mediator.Send(cmd);
                        success = true;
                    }
                    break;

                case "user.updated":
                    if (payload.Data is ClerkUserData updateData)
                    {
                        var cmd = new UpdateUserCommand(
                            updateData.Id,
                            updateData.EmailAddresses.FirstOrDefault()?.EmailAddress ?? "",
                            updateData.FirstName ?? "",
                            updateData.LastName ?? ""
                        );
                        await mediator.Send(cmd);
                        success = true;
                    }
                    break;

                case "session.created":
                    if (payload.Data is ClerkSessionData sessionData)
                    {
                        var user = await mediator.Send(new GetUserByAuthUserIdQuery(sessionData.UserId));
                        if (user == null)
                        {
                            var clerkUser = await clerkUserService.GetUserByIdAsync(sessionData.UserId);
                            if (clerkUser != null)
                            {
                                var cmd = new CreateUserCommand(
                                    clerkUser.Id,
                                    clerkUser.EmailAddresses.FirstOrDefault()?.EmailAddress ?? "",
                                    clerkUser.FirstName ?? "",
                                    clerkUser.LastName ?? ""
                                );
                                await mediator.Send(cmd);
                            }
                        }
                        success = true;
                    }
                    break;

                default:
                    message = "Unsupported webhook event type";
                    break;
            }

            return success ? Results.Ok(new { Succeeded = true }) : Results.BadRequest(new { Succeeded = false, Message = message });
        })
        .WithName("HandleClerkWebhook")
        .WithTags("Webhooks")
        .WithSummary("Handle Clerk identity webhooks")
        .WithDescription("Processes Clerk authentication webhook events for user creation, profile sync, and session management.")
        .AddEndpointFilter<ClerkWebhookVerificationFilter>()
        .AllowAnonymous();
    }
}
