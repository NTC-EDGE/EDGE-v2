using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EDGE.Api.Filters;
using EDGE.Domain.Models;
using EDGE.Application.Users.Commands.CreateUser;
using EDGE.Application.Users.Commands.UpdateUser;
using EDGE.Application.Users.Queries.GetUserByAuthUserId;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Api.Controllers;

[ApiController]
[Route("webhooks")]
public class WebhookController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IClerkUserService _clerkUserService;

    public WebhookController(IMediator mediator, IClerkUserService clerkUserService)
    {
        _mediator = mediator;
        _clerkUserService = clerkUserService;
    }

    [HttpPost("clerk")]
    [AllowAnonymous]
    [ClerkWebhookVerification]
    public async Task<IActionResult> HandleWebhook()
    {
        if (HttpContext.Items["ClerkWebhookPayload"] is not ClerkWebhookPayload payload)
        {
            return BadRequest("Payload not available");
        }

        if (string.IsNullOrEmpty(payload.Type) || payload.Data is null)
        {
            return BadRequest("Invalid webhook payload structure");
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
                        createData.LastName ?? "",
                        "client"
                    );
                    await _mediator.Send(cmd);
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
                    await _mediator.Send(cmd);
                    success = true;
                }
                break;

            case "session.created":
                if (payload.Data is ClerkSessionData sessionData)
                {
                    var user = await _mediator.Send(new GetUserByAuthUserIdQuery(sessionData.UserId));
                    if (user == null)
                    {
                        var clerkUser = await _clerkUserService.GetUserByIdAsync(sessionData.UserId);
                        if (clerkUser != null)
                        {
                            var cmd = new CreateUserCommand(
                                clerkUser.Id,
                                clerkUser.EmailAddresses.FirstOrDefault()?.EmailAddress ?? "",
                                clerkUser.FirstName ?? "",
                                clerkUser.LastName ?? "",
                                "client"
                            );
                            await _mediator.Send(cmd);
                        }
                    }
                    success = true;
                }
                break;

            default:
                message = "Unsupported webhook event type";
                break;
        }

        return success ? Ok(new { Succeeded = true }) : BadRequest(new { Succeeded = false, Message = message });
    }
}
